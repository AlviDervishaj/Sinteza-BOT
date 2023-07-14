import os
import subprocess
import sys

_instagram_username = sys.stdin.read()

if not _instagram_username:
    print("Please enter a valid instagram username")
    exit()

iBot_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot')
run_path = os.path.join(os.path.dirname(
    os.path.dirname(__file__)), 'Bot', 'run.py')
config_path = os.path.join(os.path.dirname(os.path.dirname(
    __file__)), 'Bot', 'accounts', _instagram_username, 'config.yml')

print(f"[INFO] Starting Bot for {_instagram_username}")
output = subprocess.Popen(
    ['python', run_path, '--config',  config_path])
print(f"[INFO] Bot for {_instagram_username} started.")
print(f"{output.stdout.read() if output.stdout else 'No output'}")
