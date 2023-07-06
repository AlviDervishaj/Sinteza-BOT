from sys import stdin
import os
import json


def _print(value: str):
    print(value, flush=True)


data: str = stdin.read()
if not data['logs']:
    _print("[ERROR] Please proivde logs")
    exit()
if not data['device']:
    _print("[ERROR] Please proivde device")
    exit()
parsed_data = json.loads(data["logs"])
data_path = os.path.join(os.path.abspath(
    os.path.dirname(os.path.dirname(__file__))), 'Data')

_print("[INFO] Trying to write to file", flush=True)
with open(f"{data_path}/{data['device']}.json", "a") as fp:
    fp.write(json.dumps(data, indent=4))


_print([data, data_path, data["device"], os.stat(fp)])
