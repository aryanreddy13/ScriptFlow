import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Export db as None initially
db = None

# Resolve absolute path to serviceAccountKey.json in the same directory as this file
backend_dir = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(backend_dir, "serviceAccountKey.json")

if os.path.exists(key_path):
    try:
        # Check if it contains placeholder values to warn the user
        with open(key_path, "r") as f:
            data = json.load(f)
            
        if data.get("project_id") == "placeholder-project-id" or "YOUR_PRIVATE_KEY_HERE" in data.get("private_key", ""):
            print("WARNING: serviceAccountKey.json contains placeholder values. Firebase Admin SDK will not be authenticated properly.")
        
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"ERROR: Failed to initialize Firebase Admin SDK: {e}")
        print("db client will be set to None. Firestore integrations will not be functional.")
else:
    print("WARNING: serviceAccountKey.json not found. Firestore integrations will not be functional.")
