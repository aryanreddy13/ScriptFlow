import sys
import subprocess
import time
import os
import platform
from datetime import datetime, timezone
from firebase import db

# In-memory store for script states (used by main.py /scripts endpoint)
SCRIPT_STATES = {}

def format_duration(seconds: float) -> str:
    """Format duration from float seconds to HH:MM:SS string."""
    hours, remainder = divmod(int(seconds), 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def run_script(script_name: str):
    print(f"[{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}] Triggering script execution for: '{script_name}'")
    
    script_id = script_name.replace(".py", "")
    display_name = script_name.replace("_", " ").replace(".py", "").title()
    file_path = script_name if script_name.endswith('.py') else f"{script_name}.py"
    
    # Check script existence in backend/scripts/ folder
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    scripts_dir = os.path.join(backend_dir, 'scripts')
    script_path = os.path.join(scripts_dir, file_path)

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
            except Exception as fe:
                print(f"Failed to write failure run to Firestore: {fe}")
                
        SCRIPT_STATES[script_id] = {
            "status": "Idle",
            "lastStatus": "failed",
            "lastRun": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S'),
            "duration": "00:00:00"
        }
        return False

    triggered_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    
    # Set status to Running
    SCRIPT_STATES[script_id] = {
        "status": "Running",
        "lastRun": triggered_at,
        "duration": "00:00:00"
    }

    # Run the script via subprocess.Popen
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
    
    status_cap = "Success" if return_code == 0 else "Failed"
    status_lower = "success" if return_code == 0 else "failed"

    output_lines = []
    if stdout:
        output_lines.extend(stdout.splitlines())
    if stderr:
        output_lines.extend(stderr.splitlines())
    if not output_lines:
        output_lines = [f"Script exited with return code: {return_code}"]

    # Write new document to the runs collection
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
    else:
        print(f"Firestore not initialized. Execution results: Status={status_cap}, Duration={duration_seconds}s, ExitCode={return_code}")

    # Update in-memory state
    SCRIPT_STATES[script_id] = {
        "status": "Idle",
        "lastStatus": status_lower,
        "lastRun": triggered_at,
        "duration": duration_formatted
    }

    return return_code == 0
