import pysrt
import os
import sys
import yaml

LIST_OF_FILES = ['blacklist.txt', 'comments_list.txt', 'config.yml', 'filters.yml', 'pm_list.txt', 'telegram.yml', 'telegram.yml']
LIST_OF_FILES_SORTED = sorted(LIST_OF_FILES)

Loader = yaml.Loader
Dumper = yaml.Dumper

iBot_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Bot')
_instagram_username = sys.stdin.read()

if not _instagram_username:
    print("Please enter a valid instagram username")
    exit()

# Change username in config.yml file
def change_username_in_config(_instagram_username):
    if _instagram_username.strip() == "":
        return "[ERROR] Invalid username."
    print("[INFO] Trying to change username in config.yml file")
    with open(f"{iBot_path}/accounts/{_instagram_username}/config.yml") as fp:
        data = yaml.safe_load(fp)

    data['username'] = _instagram_username
    print(f"[INFO] Changed username in config.yml file to `{_instagram_username}`")
    with open(f"{iBot_path}/accounts/{_instagram_username}/config.yml", "w") as fp:
        yaml.dump(data, fp)


# Make the default config files and folders for a user
def make_config(_instagram_username):
    if _instagram_username.strip() == "":
        return "[ERROR] Invalid username."
    for file in LIST_OF_FILES:
        path = f"{iBot_path}/accounts/{_instagram_username}/{file}"
        default_config = f"{iBot_path}/config-examples/{file}"
        print(f"[INFO] Copying file from  : {default_config} to {path}"  )
        # copy config files to that dir
        os.popen(f'cp {default_config} {path}')
    return "[INFO] Success"

# check accounts/username folder.
if os.path.isdir(f"{iBot_path}/accounts/{_instagram_username}"):
    print("[INFO] Folder located.")
    _instagram_client_config_files = os.listdir(f"{iBot_path}/accounts/{_instagram_username}")
    # check files
    if set(_instagram_client_config_files) == set(LIST_OF_FILES):
        print("[INFO] Config is correct. ")
        # try to change username in the config file to the username provided
        change_username_in_config(_instagram_username)
    else:
        print("[INFO] Config is not correct. ")
        print("[INFO] Replacing files...")
        make_config(_instagram_username)
    print("[INFO] End")
else:
    # folder with username does not exist. Create one
    os.mkdir(f"{iBot_path}/accounts/{_instagram_username}")
    # Make the config
    make_config(_instagram_username)
    # Change username
    change_username_in_config(_instagram_username)
    print("[INFO] End")

