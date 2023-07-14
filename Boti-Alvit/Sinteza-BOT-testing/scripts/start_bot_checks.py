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
    
account_config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot', 'accounts', customConfig['username'], 'config.yml')

# Remaping keys
if customConfig['blogger-followers']:
    customConfig['blogger-followers'] = customConfig['blogger-followers'].split(
        ",")
if customConfig['hashtag-likers-top']:
    customConfig['hashtag-likes-top'] = customConfig['hashtag-likes-top'].split(
        ",")
if customConfig['working-hours']:
    customConfig['working-hours'] = customConfig['working-hours'][0].split(
        ",")
elif type(customConfig['working-hours']) == list and len(customConfig['working-hours']) == 0:
    customConfig['working-hours'] = ["10.15-16.40", "18.15-22.46"]

# Change username in config.yml file


def change_keys_in_config(username):
    '''
    Change config.yml file based on username
    '''
    with open(f"{account_config_path}") as fp:
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
    _print(f"[INFO] Writing to {account_config_path}")
    with open(f"{account_config_path}", "w") as fp:
        yaml.dump(data, fp)


# Make the default config files and folders for a user
def make_config(_instagram_username):
    '''
    Make the default config files and folders for a user
    '''
    if _instagram_username.strip() == "":
        return "[ERROR] Invalid username."
    for file in LIST_OF_FILES:
        path = f"{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot', 'accounts', _instagram_username, file)}"
        default_config = f"{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot', 'config-examples', file)}"
        if (file not in AVAILABLE_FILES):
            _print(f"[INFO] Copying file from  : {default_config} to {path}")
            # copy config files to that dir
            os.popen(f'copy {default_config} {path}')
        else:
            _print(f"[INFO] File {file} already exists.")
    return "[INFO] Success"


# check accounts/username folder.
if os.path.isdir(f"{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot', 'accounts', customConfig['username'])}"):
    _print("[INFO] Folder located.")
    _instagram_client_config_files = os.listdir(
        f"{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot', 'accounts', customConfig['username'])}")
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
    os.mkdir(f"{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot', 'accounts', customConfig['username'])}")
    AVAILABLE_FILES = []
    # Make the config
    make_config(customConfig['username'])
    # Change username
    change_keys_in_config(customConfig['username'])
    _print("[INFO] End")
