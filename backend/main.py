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
from runner import run_script
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    """Retrieve list of python script filenames located in the scripts subfolder."""
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    scripts_dir = os.path.join(backend_dir, "scripts")
    
    if not os.path.exists(scripts_dir):
        return []
        
    try:
        # Find all python script filenames
        files = [f for f in os.listdir(scripts_dir) if f.endswith(".py")]
        return files
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to scan backend/scripts directory: {e}"
        )

@app.post("/scripts/register")
def register_new_script(req: ScriptRegisterRequest):
    """Add a new script configuration document to the Firestore scripts collection."""
    if db is None:
        raise HTTPException(
            status_code=500,
            detail="Firestore database client not initialized. Ensure serviceAccountKey.json is configured."
        )
        
    # Auto-generate a standardized file name from display name
    clean_name = "".join(c for c in req.name if c.isalnum() or c.isspace()).strip()
    file_path = clean_name.lower().replace(" ", "_") + ".py"
    
    # Payload schema
    doc_payload = {
        "name": req.name,
        "filePath": file_path,
        "description": req.description,
        "lastStatus": "idle",
        "status": "Idle",  # Capitalized to match frontend badge states
        "lastRun": None,
        "duration": "00:00:00"  # Format to prevent front-end renderer exceptions
    }
    
    try:
        # Write script document in Firestore
        _, doc_ref = db.collection("scripts").add(doc_payload)
        return {
            "status": "registered",
            "id": doc_ref.id,
            "data": doc_payload
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write script payload configuration to Firestore: {e}"
        )
