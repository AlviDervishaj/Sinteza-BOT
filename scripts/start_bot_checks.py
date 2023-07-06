import os
import sys
import json
import collections
import ruamel.yaml

yaml = ruamel.yaml.YAML()


LIST_OF_FILES = ['blacklist.txt', 'comments_list.txt', 'config.yml',
                 'filters.yml', 'pm_list.txt', 'telegram.yml', 'whitelist.txt']

AVAILABLE_FILES = []


def compare(x, y): return collections.Counter(x) == collections.Counter(y)


def _print(value: str):
    print(value, flush=True)


iBot_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot')
botConfig = sys.stdin.read()
customConfig = json.loads(botConfig)

if not customConfig['username']:
    _print("Please enter a valid instagram username")
    exit()
if not customConfig['device']:
    _print("Please enter a valid device.")
    exit()
if not customConfig['password']:
    _print("Please enter a valid password.")
    exit()
if not customConfig['speed-multiplier']:
    _print("Please enter a valid speed.")
    exit()
if not customConfig['truncate-sources']:
    _print("Please provide truncate Sources.")
    exit()

# Remaping keys
if customConfig['blogger-followers']:
    customConfig['blogger-followers'] = customConfig['blogger-followers']
if customConfig['hashtag-likers-top']:
    customConfig['hashtag-likes-top'] = customConfig['hashtag-likes-top'].split(
        ",")
if customConfig['working-hours']:
    customConfig['working-hours'] = customConfig['working-hours'][0].split(
        ",")

# Change username in config.yml file


def change_keys_in_config(username):
    '''
    Change config.yml file based on username
    '''
    with open(f"{iBot_path}/accounts/{username}/config.yml") as fp:
        data = yaml.load(fp)

    for config in customConfig:
        if config in data:
            if (data[config] == customConfig[config]):
                _print(f"[INFO] {config.capitalize()} : DEFAULT")
            if type(customConfig[config]) == list:
                if customConfig[config] != []:
                    _print(
                        f"[INFO] Changing {config} from {data[config]} to {customConfig[config]}")
                    customConfig[config] = ruamel.yaml.comments.CommentedSeq(
                        customConfig[config])
                    customConfig[config].fa.set_flow_style()
                    data[config] = customConfig[config]
                else:
                    data[config] = ""
            elif (type(customConfig[config]) == str and str(customConfig[config]) != ""):
                _print(
                    f"[INFO] Changing {config} from {data[config]} to {customConfig[config]}")
                data[config] = customConfig[config]
            else:
                _print(
                    f"[INFO] Skipping `{config}`")
        else:
            _print(f"[INFO] Skipping `{config}`")
    _print(f"[INFO] Writing to {iBot_path}/accounts/{username}/config.yml")
    with open(f"{iBot_path}/accounts/{username}/config.yml", "w") as fp:
        yaml.dump(data, fp)


# Make the default config files and folders for a user
def make_config(_instagram_username):
    '''
    Make the default config files and folders for a user
    '''
    if _instagram_username.strip() == "":
        return "[ERROR] Invalid username."
    for file in LIST_OF_FILES:
        path = f"{iBot_path}/accounts/{_instagram_username}/{file}"
        default_config = f"{iBot_path}/config-examples/{file}"
        if (file not in AVAILABLE_FILES):
            _print(f"[INFO] Copying file from  : {default_config} to {path}")
            # copy config files to that dir
            os.popen(f'cp {default_config} {path}')
        else:
            _print(f"[INFO] File {file} already exists.")
    return "[INFO] Success"


# check accounts/username folder.
if os.path.isdir(f"{iBot_path}/accounts/{customConfig['username']}"):
    _print("[INFO] Folder located.")
    _instagram_client_config_files = os.listdir(
        f"{iBot_path}/accounts/{customConfig['username']}")
    AVAILABLE_FILES = _instagram_client_config_files
    # check files
    if compare(_instagram_client_config_files, LIST_OF_FILES):
        _print("[INFO] Config is correct. ")
        # try to change configs to the ones provided
        change_keys_in_config(customConfig['username'])
    else:
        _print("[INFO] Config is not correct. ")
        _print("[INFO] Replacing files...")
        make_config(customConfig['username'])
    _print("[INFO] End")
else:
    # folder with username does not exist. Create one
    os.mkdir(f"{iBot_path}/accounts/{customConfig['username']}")
    AVAILABLE_FILES = []
    # Make the config
    make_config(customConfig['username'])
    # Change username
    change_keys_in_config(customConfig['username'])
    _print("[INFO] End")
