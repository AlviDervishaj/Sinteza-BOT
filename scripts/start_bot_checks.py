import os
import sys
import json
import collections
import ruamel.yaml
from ruamel.yaml.comments import CommentedSeq
from datetime import datetime

yaml = ruamel.yaml.YAML()
yaml.preserve_quotes = True


LIST_OF_FILES = ['blacklist.txt', 'comments_list.txt', 'config.yml',
                 'filters.yml', 'pm_list.txt', 'telegram.yml', 'whitelist.txt']

AVAILABLE_FILES = []

command = "copy" if sys.platform.startswith(
    'win32') or sys.platform.startswith('cygwin') else "cp"


def compare(x, y): return collections.Counter(x) == collections.Counter(y)


def _print(value: str):
    print(value, flush=True)


botConfig = sys.stdin.read()
customConfig = json.loads(botConfig)
if not customConfig['username']:
    _print("Please enter a valid instagram username")
    exit(5)
if not customConfig['device']:
    _print("Please enter a valid device.")
    exit(5)

# format as list
if customConfig['blogger-followers']:
    customConfig['blogger-followers'] = \
            customConfig['blogger-followers'][0].split(",")
# format as list
if customConfig['hashtag-likers-top']:
    customConfig['hashtag-likers-top'] = \
        customConfig['hashtag-likers-top'][0].split(",")
    
#  default working hours
if type(customConfig['working-hours']) == list and \
        len(customConfig['working-hours']) == 0:
    customConfig['working-hours'] = ["8.30-16.40", "18.15-22.46"]
# format as an list
elif customConfig['working-hours']:
    customConfig['working-hours'] = customConfig['working-hours'][0].split(",")

jobs = customConfig.pop("jobs", "follow")

def get_commented_keys():
    if jobs[0] == "follow":
        # comment out the unfollow job
        return ["hashtag-likers-top", "unfollow-non-followers", "unfollow", "unfollow-any", "unfollow-any-non-followers", "unfollow-any-followers", "total-unfollows-limit"]
    elif jobs[0] == "unfollow":
        # comment out the follow job
        return ["follow-limit", "follow-percentage", "blogger-followers"]
    elif jobs[0] == "hashtags":
        if len(jobs) == 2 and jobs[1] == "follow":
            # comment out the unfollow job
            return ["unfollow-non-followers", "unfollow", "unfollow-any", "unfollow-any-non-followers", "unfollow-any-followers", "total-unfollows-limit"]
        elif len(jobs) == 2 and jobs[1] == "unfollow":
            # comment out the follow job
            return ["follow-limit", "follow-percentage", "blogger-followers"]
        else:
            # comment out the unfollow job and follow job
            return ["follow-limit", "blogger-followers", "follow-percentage", "unfollow-non-followers", "unfollow", "unfollow-any", "unfollow-any-non-followers", "unfollow-any-followers", "total-unfollows-limit"]
    else:
        return ["hashtag-likers-top", "unfollow-non-followers", "unfollow", "unfollow-any", "unfollow-any-non-followers", "unfollow-any-followers", "total-unfollows-limit"]

# def comment_out_keys_in_config(username):
#     '''
#     Remove jobs.
#     '''
#     config_path = os.path.join(os.path.dirname(os.path.dirname(
#         __file__)), 'accounts', username, 'config.yml')
#     temp_path = os.path.join(os.path.dirname(os.path.dirname(
#         __file__)), 'accounts', username, 'temp.yml')
#     temp = []
#     with open(config_path, 'r') as f:
#         yaml_data = yaml.load(f)
    
#     for key in get_commented_keys():
#         if key in yaml_data:
#             temp.append({key: yaml_data[key]})
#             del yaml_data[key]
#             continue
#         else:
#             continue
#     # store data back in file
#     with open(config_path, 'w') as f:
#         yaml.dump(yaml_data, f)
#     # store to temp file
#     if(len(temp) > 0):
#         today = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
#         with open(temp_path, 'w+') as f:
#             d = {"removedJobs": temp, "timestamp": today, "currentJobs": jobs}
#             yaml.dump(d, f)

    

def change_keys_in_config(username):
    '''
    Change config.yml file based on username
    '''
    config_path = os.path.join(os.path.dirname(os.path.dirname(
        __file__)), 'accounts', username, 'config.yml')
    try:
        with open(config_path) as fp:
            data = yaml.load(fp)
    except Exception as e:
        _print(f"[ERROR] {e}")
        exit()

    for config in customConfig:
        if config in data:

            if (data[config] == customConfig[config]):
                _print(f"[INFO] {config.capitalize()} : DEFAULT")
                continue
            if type(customConfig[config]) == list:
                if len(customConfig[config]) > 1 and customConfig[config][0] != "":
                    _print(
                        f"[INFO] Changing {config} from {data[config]} to {customConfig[config]}")
                    customConfig[config] = CommentedSeq(
                        customConfig[config])
                    customConfig[config].fa.set_flow_style()
                    data[config] = customConfig[config]
                    continue
                else:
                    data[config] = data[config]
                    continue
            elif (type(customConfig[config]) == str and str(customConfig[config]) != ""):
                _print(
                    f"[INFO] Changing {config} from {data[config]} to {customConfig[config]}")
                data[config] = customConfig[config]
                continue
            else:
                _print(
                    f"[INFO] Skipping `{config}`")
                continue
        else:
            _print(f"[INFO] Skipping `{config}`")

    _print("Commenting out keys...")
    with open(config_path, "w") as fp:
        _print(f"[INFO] Writing to {config_path}")
        yaml.default_flow_style = True
        yaml.width = float("inf")
        yaml.dump(data, fp)
    
    # comment_out_keys_in_config(username)



# Make the default config files and folders for a user
def make_config(_instagram_username):
    '''
    Make the default config files and folders for a user
    '''
    if _instagram_username.strip() == "":
        return "[ERROR] Invalid username."
    for file in LIST_OF_FILES:
        config_path = os.path.join(os.path.dirname(os.path.dirname(
            __file__)), 'accounts', _instagram_username, file)
        default_path = os.path.join(os.path.dirname(os.path.dirname(
            __file__)), 'Bot', 'config-examples', file)
        if (file not in AVAILABLE_FILES):
            _print(
                f"[INFO] Copying file from  : {default_path} to {config_path}")
            # copy config files to that dir
            os.popen(f'{command} {default_path} {config_path}')
        else:
            _print(f"[INFO] File {file} already exists.")
    return "[INFO] Success"

# make the accounts folder and the user folder


def make_directories(_username):
    accounts_dir = os.path.join(os.path.dirname(os.path.dirname(
        __file__)), 'accounts')
    if (os.path.isdir(accounts_dir)):

        user_dir = os.path.join(os.path.dirname(os.path.dirname(
            __file__)), 'accounts', _username)
        if (os.path.isdir(user_dir)):
            return True
        else:
            os.mkdir(user_dir)
            return True
    else:
        os.mkdir(accounts_dir)
        os.mkdir(user_dir)
        return True


# check base accounts folder
if (os.path.exists(os.path.join(os.path.dirname(os.path.dirname(
        __file__)), 'accounts'))):
    _print("[INFO] Folder located.")
else:
    _print("[INFO] Creating accounts folder.")
    os.mkdir(os.path.join(os.path.dirname(os.path.dirname(
        __file__)), 'accounts'))
    _print("[INFO] Folder created.")

# check accounts/username folder.
user_dir = os.path.join(os.path.dirname(os.path.dirname(
    __file__)), 'accounts', customConfig['username'])
if os.path.exists(user_dir):
    _print("[INFO] Folder located.")
    _instagram_client_config_files = os.listdir(
        user_dir)
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
        change_keys_in_config(customConfig['username'])
    _print("[INFO] End")
else:
    os.mkdir(user_dir)
    _print("[INFO] Folder created.")
    _print("[INFO] Creating config files...")
    make_config(customConfig['username'])
    change_keys_in_config(customConfig['username'])
    _print("[INFO] End")
