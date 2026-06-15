import sys
import subprocess
import time
import os
import platform
from datetime import datetime, timezone
from firebase import db

def format_duration(seconds: float) -> str:
    """Format duration from float seconds to HH:MM:SS string."""
    hours, remainder = divmod(int(seconds), 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def run_script(script_name: str):
    print(f"[{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}] Triggering script execution for: '{script_name}'")
    
    script_id = None
    display_name = script_name
    file_path = None
    
    # 1. Query matching script document by name field
    if db is not None:
        try:
            # Check by display name
            docs = db.collection('scripts').where('name', '==', script_name).limit(1).get()
            if not docs:
                # Check by filePath
                docs = db.collection('scripts').where('filePath', '==', script_name).limit(1).get()
                
            if docs:
                script_doc = docs[0]
                script_id = script_doc.id
                display_name = script_doc.get('name') or script_name
                file_path = script_doc.get('filePath')
        except Exception as e:
            print(f"Error querying scripts collection in Firestore: {e}")

    # If file_path is not found from db, fall back to script_name
    if not file_path:
        file_path = script_name
        if not file_path.endswith('.py'):
            file_path += '.py'

    # 2. Check script existence in backend/scripts/ folder
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    scripts_dir = os.path.join(backend_dir, 'scripts')
    script_path = os.path.join(scripts_dir, file_path)
    
    # Try resolving if just the file name is stored instead of full path
    if not os.path.exists(script_path):
        script_path = os.path.join(scripts_dir, os.path.basename(file_path))

    if not os.path.exists(script_path):
        error_msg = f"Script file not found at path: {script_path}"
        print(f"ERROR: {error_msg}")
        # Write a failed run if db is available
        if db is not None:
            triggered_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            try:
                db.collection('runs').add({
                    'scriptName': display_name,
                    'triggeredAt': triggered_at,
                    'duration': 0.0,
                    'status': 'Failed',
                    'output': [error_msg],
                    'metadata': {
                        'os': f"{platform.system()} {platform.release()}",
                        'pid': os.getpid(),
                        'exitCode': -1
                    },
                    'error': error_msg
                })
                # Also update script status if we found it
                if script_id:
                    db.collection('scripts').document(script_id).update({
                        'status': 'Idle',
                        'lastStatus': 'failed',
                        'lastRun': triggered_at
                    })
            except Exception as fe:
                print(f"Failed to write failure run to Firestore: {fe}")
        return False

    # 3. Set status to Running in scripts collection before executing
    triggered_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    if db is not None and script_id:
        try:
            db.collection('scripts').document(script_id).update({
                'status': 'Running',
                'lastRun': triggered_at
            })
        except Exception as e:
            print(f"Error updating script status to Running: {e}")

    # 4. Run the script via subprocess.Popen (to capture PID)
    start_time = time.time()
    try:
        process = subprocess.Popen(
            [sys.executable, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        pid = process.pid
        stdout, stderr = process.communicate()
        return_code = process.returncode
    except Exception as e:
        pid = -1
        stdout = ""
        stderr = f"Subprocess initialization failed: {e}"
        return_code = -1

    end_time = time.time()
    duration_seconds = round(end_time - start_time, 2)
    duration_formatted = format_duration(duration_seconds)
    
    # Capitalized status for frontend, lowercase for prompt's lastStatus
    status_cap = "Success" if return_code == 0 else "Failed"
    status_lower = "success" if return_code == 0 else "failed"

    # Combine stdout and stderr into output list of lines
    output_lines = []
    if stdout:
        output_lines.extend(stdout.splitlines())
    if stderr:
        output_lines.extend(stderr.splitlines())
    if not output_lines:
        output_lines = [f"Script exited with return code: {return_code}"]

    # 5. Write new document to the runs collection
    run_doc_data = {
        'scriptName': display_name,
        'triggeredAt': triggered_at,
        'duration': duration_seconds,
        'status': status_cap,
        'output': output_lines,
        'metadata': {
            'os': f"{platform.system()} {platform.release()}",
            'pid': pid,
            'exitCode': return_code
        },
        'error': stderr if return_code != 0 else ""
    }

    if db is not None:
        try:
            db.collection('runs').add(run_doc_data)
            print(f"Run document saved for '{display_name}' (Status: {status_cap})")
        except Exception as e:
            print(f"Error writing to runs collection in Firestore: {e}")
            
        # 6. Update the matching document in scripts collection
        # If script_id is not set, let's query by name to be sure
        if not script_id:
            try:
                docs = db.collection('scripts').where('name', '==', display_name).limit(1).get()
                if docs:
                    script_id = docs[0].id
            except Exception as e:
                print(f"Error querying script by name for update: {e}")
                
        if script_id:
            try:
                db.collection('scripts').document(script_id).update({
                    'status': 'Idle',
                    'lastStatus': status_lower,
                    'lastRun': triggered_at,
                    'duration': duration_formatted
                })
                print(f"Script document updated for '{display_name}' (ID: {script_id})")
            except Exception as e:
                print(f"Error updating script document in Firestore: {e}")
    else:
        print(f"Firestore not initialized. Execution results: Status={status_cap}, Duration={duration_seconds}s, ExitCode={return_code}")

    return return_code == 0
