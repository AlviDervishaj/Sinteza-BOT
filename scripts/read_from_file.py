from sys import stdin, argv
import os
import json


def _print(value: str):
    print(value, flush=True)


deviceId: str = stdin.read()

if not deviceId:
    print("[ERROR] Please proivde device id", flush=True)
    exit()
data_path = os.path.join(os.path.abspath(
    os.path.dirname(os.path.dirname(__file__))), 'Data')

print(f"[INFO] Trying to read from file {deviceId}.json", flush=True)
try:
    with open(f"{data_path}/{deviceId}.json", "r") as fp:
        data = json.load(fp)

    _print([data, data_path, deviceId, os.stat(fp)])
except FileNotFoundError:
    _print("[INFO] File not found")
    exit()
