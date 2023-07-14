# make a python script to export data to excel
# 1. read data from stdin.read()
# 2. export the data to excel
# 3. save the excel file to a specific path


import sys
import pandas as pd
import json

# read data
data = json.loads(sys.stdin.read())


def export_to_excel(data):
    # convert data to dataframe
    df = pd.DataFrame(data)
    # export data to excel
    df.to_excel('data.xlsx', index=False)


export_to_excel(data)
