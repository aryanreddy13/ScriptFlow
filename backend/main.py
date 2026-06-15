# ==============================================================================
# PLACE YOUR REAL SERVICE ACCOUNT KEY FILE AT:
# c:\Projects\ScriptFlow\backend\serviceAccountKey.json
#
# Obtain this file from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
# ==============================================================================

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from firebase import db
from runner import run_script, SCRIPT_STATES
from scheduler import load_schedules, scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retrieve and register cron triggers from Firestore schedules on startup
    load_schedules()
    yield
    # Safely shutdown the scheduler upon backend termination
    if scheduler.running:
        scheduler.shutdown()

# Initialize FastAPI application
app = FastAPI(
    title="ScriptFlow API Backend",
    description="Python daemon executing automation scripts, loading schedulers, and sync-logging with Firestore.",
    lifespan=lifespan
)

# Enable CORS for frontend workspace access
origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScriptRegisterRequest(BaseModel):
    name: str
    description: str

@app.get("/health")
def get_health():
    """Basic health check query."""
    return {"status": "ok"}

@app.post("/run/{script_name}")
def trigger_script_run(script_name: str, background_tasks: BackgroundTasks):
    """Trigger script execution via subprocess background tasks."""
    background_tasks.add_task(run_script, script_name)
    return {"status": "triggered", "script": script_name}

@app.get("/scripts")
def list_available_scripts():
    """Retrieve list of python script filenames located in the scripts subfolder, as structured objects."""
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    scripts_dir = os.path.join(backend_dir, "scripts")
    
    if not os.path.exists(scripts_dir):
        return []
        
    try:
        scripts_data = []
        for f in os.listdir(scripts_dir):
            if f.endswith(".py"):
                # Clean up file name to generate a sensible display name
                display_name = f.replace("_", " ").replace(".py", "").title()
                script_id = f.replace(".py", "")
                
                # Fetch state from in-memory dictionary or use defaults
                state = SCRIPT_STATES.get(script_id, {})
                status = state.get("status", "Idle")
                last_run = state.get("lastRun", "Never")
                duration = state.get("duration", "00:00:00")
                
                scripts_data.append({
                    "id": script_id,
                    "name": display_name,
                    "filePath": f,
                    "description": "Custom automation script.",
                    "status": status,
                    "lastRun": last_run,
                    "duration": duration
                })
        return scripts_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to scan backend/scripts directory: {e}"
        )

@app.post("/scripts/register")
def register_new_script(req: ScriptRegisterRequest):
    """Create a new script physical file in the backend/scripts collection."""
    # Auto-generate a standardized file name from display name
    clean_name = "".join(c for c in req.name if c.isalnum() or c.isspace()).strip()
    file_path = clean_name.lower().replace(" ", "_") + ".py"
    
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    scripts_dir = os.path.join(backend_dir, "scripts")
    os.makedirs(scripts_dir, exist_ok=True)
    
    full_path = os.path.join(scripts_dir, file_path)
    
    if os.path.exists(full_path):
        raise HTTPException(status_code=400, detail="Script file already exists.")
        
    try:
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(f'# {req.name}\n# {req.description}\n\nprint("Executing {req.name}...")\n')
            
        doc_payload = {
            "id": file_path.replace(".py", ""),
            "name": req.name,
            "filePath": file_path,
            "description": req.description,
            "lastStatus": "idle",
            "status": "Idle",
            "lastRun": "Never",
            "duration": "00:00:00"
        }
        
        return {
            "status": "registered",
            "id": doc_payload["id"],
            "data": doc_payload
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create script file: {e}"
        )
