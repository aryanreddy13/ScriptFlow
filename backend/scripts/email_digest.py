import sys
import time

print("[INFO] Starting email digest dispatch service...")
time.sleep(0.5)
print("[INFO] Loading customer subscriber database profiles...")
time.sleep(0.5)
print("[ERROR] SMTP Connection Exception: Connection timed out on port 465.")
print("[ERROR] FAILED: Email digest transmission failed. Exit code 1.")
sys.exit(1)
