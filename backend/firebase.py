import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Export db as None initially
db = None

# Resolve absolute path to serviceAccountKey.json in the same directory as this file
backend_dir = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(backend_dir, "serviceAccountKey.json")

try:
    cred_json = os.environ.get("FIREBASE_CREDENTIALS")
    if cred_json:
        # Load from environment variable (JSON string)
        cred = credentials.Certificate(json.loads(cred_json))
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase Admin SDK initialized successfully via FIREBASE_CREDENTIALS env var.")
    elif os.path.exists(key_path):
        # Fall back to local file
        with open(key_path, "r") as f:
            data = json.load(f)
            
        if data.get("project_id") == "placeholder-project-id" or "YOUR_PRIVATE_KEY_HERE" in data.get("private_key", ""):
            print("WARNING: serviceAccountKey.json contains placeholder values. Firebase Admin SDK will not be authenticated properly.")
        
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase Admin SDK initialized successfully via serviceAccountKey.json.")
    else:
        print("WARNING: Neither FIREBASE_CREDENTIALS env var nor serviceAccountKey.json was found. Firestore integrations will not be functional.")
except Exception as e:
    print(f"ERROR: Failed to initialize Firebase Admin SDK: {e}")
    print("db client will be set to None. Firestore integrations will not be functional.")

