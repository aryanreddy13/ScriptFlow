import time
import sys
import random

def print_log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")
    sys.stdout.flush()

def main():
    print_log("Starting sample backup script...")
    time.sleep(1)
    
    print_log("Connecting to database...")
    time.sleep(1.5)
    
    print_log("Database connected. Fetching records...")
    records = random.randint(1000, 5000)
    time.sleep(2)
    
    print_log(f"Found {records} records to backup. Processing...")
    
    for i in range(1, 4):
        time.sleep(1)
        print_log(f"Processed batch {i}/3...")
        
    time.sleep(1)
    print_log("Backup completed successfully.")
    
if __name__ == "__main__":
    main()
