import os
import subprocess
import sys
from dotenv import dotenv_values

env = dotenv_values(os.path.join(os.path.dirname(
    os.path.dirname(__file__)), '.env.development'))
_instagram_username = sys.stdin.read()

if not _instagram_username:
    print("Please enter a valid instagram username")
    exit()

run_path = os.path.join(os.path.dirname(
    os.path.dirname(__file__)), 'Bot', 'run.py')
config_path = os.path.join(os.path.dirname(os.path.dirname(
    __file__)), 'accounts', _instagram_username, 'config.yml')

print(f"[INFO] Starting Bot for {_instagram_username}")
command = 'python' if sys.platform.startswith(
    'win32') or sys.platform.startswith('cygwin') else 'python3'
output = subprocess.Popen(
    [command, run_path, '--config',  config_path])
print(f"[INFO] Bot for {_instagram_username} started.")
print(f"{output.stdout.read() if output.stdout else 'No output'}")
