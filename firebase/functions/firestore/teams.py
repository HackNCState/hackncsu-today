import json
import os
import requests
from firebase_functions import https_fn
from firebase_functions.params import SecretParam, StringParam, IntParam
from firebase_admin import auth

import google.auth

SPREADSHEET_URL = StringParam(
    "SPREADSHEET_URL",
    default="https://docs.google.com/spreadsheets/d/1QoWfF3ooyeb5S9LkwmDgaG-3_01sOWNf1BUIpAALotk/edit?gid=0#gid=0",
    description="The URL of the Google Spreadsheet containing team information.",
)
WORKSHEET_NAME = StringParam(
    "WORKSHEET_NAME",
    default="Team Verification",
    description="The name of the worksheet in the Google Spreadsheet where team information is stored.",
)