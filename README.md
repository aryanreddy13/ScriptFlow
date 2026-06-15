# ScriptFlow

ScriptFlow is a modern, web-based control center and telemetry dashboard for managing, executing, and scheduling Python automation scripts. It consists of a FastAPI backend core for process execution/scheduling and a React + Firebase frontend dashboard for real-time tracking.

---

## Project Structure

```
ScriptFlow/
├── backend/                  # FastAPI Backend
│   ├── scripts/              # Directory containing executable scripts
│   ├── firebase.py           # Firebase Admin SDK initialization
│   ├── main.py               # FastAPI server and endpoint routers
│   ├── runner.py             # Subprocess execution and output logging
│   ├── scheduler.py          # APScheduler cron configuration
│   ├── requirements.txt      # Python dependencies
│   └── serviceAccountKey.json # Service account credentials (ignored by git)
│
├── frontend/                 # Vite + React Frontend
│   ├── src/                  # React components, pages, hooks, and routing
│   ├── public/               # Static assets (favicons, logos)
│   ├── tailwind.config.js    # Tailwind styling config
│   └── package.json          # Node dependencies and build scripts
│
└── .gitignore                # Root-level git ignore rules
```

---

## Tech Stack

### Backend
* **FastAPI**: Asynchronous Python web framework for clean API endpoints.
* **APScheduler**: Advanced Python Scheduler for loading and running scheduled tasks.
* **Firebase Admin SDK**: Direct synchronization of run statuses, console logs, and schedules with Google Firestore.
* **Subprocess Execution**: Captures script `stdout`/`stderr` logs, process PID, exit status, and duration dynamically.

### Frontend
* **Vite & React**: Lightweight development and bundling system.
* **Firebase Web SDK**: Seamless client-side authentication and real-time Firestore database subscriptions.
* **TailwindCSS**: Premium, modern dark-themed dashboard aesthetics with responsive layouts.
* **Recharts**: Beautiful metrics and success-rate analytics graphs.

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* Python 3.10+
* Node.js 18+

### 2. Backend Setup
1. Open a terminal and navigate to the `backend/` directory.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate      # On Windows
   source .venv/bin/activate    # On macOS/Linux
   pip install -r requirements.txt
   ```
3. Generate a service account key from the **Firebase Console** (**Project Settings** -> **Service Accounts**), name it `serviceAccountKey.json`, and place it in the `backend/` directory.
4. Start the backend development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   * The API docs will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
1. Open a terminal and navigate to the `frontend/` directory.
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory with your Firebase configuration parameters:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```
4. Start the frontend developer environment:
   ```bash
   npm run dev
   ```
   * The control center interface will open at `http://localhost:5173`.

---

## Features

1. **Telemetry Dashboard**: High-level execution metrics, recent execution histories, and real-time job success rates.
2. **Interactive Run Logs**: Live execution console streaming outputs from executed sub-processes.
3. **Task Scheduler**: Register cron rules that interface with APScheduler to execute background scripts automatically.
4. **Script Registry**: Register and trigger any Python script on demand directly from the web interface.
