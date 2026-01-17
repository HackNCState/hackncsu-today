from firebase_functions import https_fn
from firebase_admin import firestore
from firebase_functions.params import StringParam
from dataclasses import asdict

import google.auth

from .models import Schedule, ScheduleItem

SCHEDULE_SPREADSHEET_URL = StringParam(
    "SCHEDULE_SPREADSHEET_URL",
    default="https://docs.google.com/spreadsheets/d/1ZEU5ZB0P8dFo_7a56hiTMqxwA35AIeV41SbyhYyIdAE/edit#gid=0",
    description="The URL of the Google Spreadsheet containing the event schedule.",
)

CONFIG_COL_S = StringParam(
    "CONFIG_COL_S",
    default="Dashboard Config",
    description="The column in the schedule spreadsheet where the config is stored.",
)
TIME_COL_S = StringParam(
    "TIME_COL_S",
    default="Time",
    description="The column in the schedule spreadsheet where the event time is stored.",
)
NAME_COL_S = StringParam(
    "NAME_COL_S",
    default="Action",
    description="The column in the schedule spreadsheet where the event name is stored.",
)
DESC_COL_S = StringParam(
    "DESC_COL_S",
    default="Notes",
    description="The column in the schedule spreadsheet where the event description is stored.",
)


@https_fn.on_call()
def load_schedule(request: https_fn.CallableRequest) -> None:
    """Loads the event schedule from a Google Sheet."""

    if not request.auth or not request.auth.token.get("isOrganizer", False):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.PERMISSION_DENIED,
            message="Only organizers can load the event schedule.",
        )

    import gspread

    creds, _ = google.auth.default(
        scopes=[
            "https://www.googleapis.com/auth/spreadsheets.readonly",
            "https://www.googleapis.com/auth/drive",
        ]
    )

    gc = gspread.authorize(creds)

    spreadsheet = gc.open_by_url(SCHEDULE_SPREADSHEET_URL.value)

    sheet = spreadsheet.sheet1

    records = sheet.get_all_records()

    schedules: list[Schedule] = []
    current_schedule: Schedule | None = None
    skipping = False

    col_config = CONFIG_COL_S.value
    col_time = TIME_COL_S.value
    col_name = NAME_COL_S.value
    col_desc = DESC_COL_S.value

    for row in records:
        config_val = str(row.get(col_config, "")).strip()

        if config_val.startswith("DAYSTART:"):
            title = config_val.split(":", 1)[1].strip()
            current_schedule = Schedule(title=title, items=[])
            schedules.append(current_schedule)
            skipping = False
            continue

        if config_val == "DAYSKIP":
            skipping = True
            current_schedule = None
            continue

        if skipping or current_schedule is None:
            continue

        # only add an item if the corresponding config cell is set to true
        if config_val.replace("'", "").replace('"', "").upper() == "TRUE":
            item = ScheduleItem(
                title=str(row.get(col_name, "")),
                description=str(row.get(col_desc, "")),
                time=str(row.get(col_time, "")),
                state="upcoming",
            )
            current_schedule.items.append(item)

    # then store them in firestore under event/main["schedules"]
    db = firestore.client()
    db.document("event/main").set(
        {"schedules": [asdict(s) for s in schedules]}, merge=True
    )
