from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from firebase import db
from runner import run_script

# Initialize the background scheduler
scheduler = BackgroundScheduler()

def load_schedules():
    """Query Firestore for enabled schedules, register cron trigger jobs, and start the scheduler."""
    if db is None:
        print("Firestore client is not initialized. Cannot load schedules.")
        return
        
    try:
        # Clear any existing jobs to prevent duplicate triggers on reload/restart
        scheduler.remove_all_jobs()
        
        # Query schedules collection where enabled is True
        schedules_ref = db.collection("schedules").where("enabled", "==", True).stream()
        
        count = 0
        for doc in schedules_ref:
            schedule_data = doc.to_dict()
            script_name = schedule_data.get("scriptName")
            # Fallback check for cronExpression vs cron (frontend compatibility)
            cron_expr = schedule_data.get("cronExpression") or schedule_data.get("cron")
            
            if not script_name or not cron_expr:
                print(f"Skipping schedule '{doc.id}': scriptName or cron expression is missing.")
                continue
                
            try:
                # Parse standard 5-field cron string using APScheduler from_crontab
                trigger = CronTrigger.from_crontab(cron_expr)
                scheduler.add_job(
                    run_script,
                    trigger=trigger,
                    args=[script_name],
                    id=doc.id,
                    replace_existing=True
                )
                print(f"Scheduled job: '{script_name}' on cron '{cron_expr}' (ID: {doc.id})")
                count += 1
            except Exception as pe:
                print(f"ERROR: Failed to parse cron '{cron_expr}' for schedule '{doc.id}': {pe}")
                
        print(f"Loaded {count} enabled schedules from Firestore.")
        
        # Start the scheduler if it isn't running already
        if not scheduler.running:
            scheduler.start()
            print("APScheduler BackgroundScheduler started.")
            
    except Exception as e:
        print(f"ERROR: Failed to load schedules from Firestore: {e}")
