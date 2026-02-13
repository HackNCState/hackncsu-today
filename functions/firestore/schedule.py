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
    """Syncs the event schedule from a Google Sheet."""

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

    # fetch existing schedules to merge changes
    db = firestore.client()
    doc_ref = db.document("event/main")
    doc = doc_ref.get()
    existing_schedules_map = {}  # Title -> Schedule Dict
    if doc.exists:
        data = doc.to_dict()
        if data and "schedules" in data:
            for s in data["schedules"]:
                existing_schedules_map[s["title"]] = s

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
            new_item = ScheduleItem(
                title=str(row.get(col_name, "")),
                description=str(row.get(col_desc, "")),
                time=str(row.get(col_time, "")),
                state="upcoming",
            )
            current_schedule.items.append(new_item)

    # scary and mostly ai generated sync logic
    # basically if we already have a schedule saved, this will merge changes in the spreadsheet
    # to the existing schedule while preserving ongoing/ended states and oldTimes where possible
    for schedule in schedules:
        if schedule.title not in existing_schedules_map:
            continue

        old_schedule = existing_schedules_map[schedule.title]
        old_items = old_schedule.get("items", [])
        new_items = schedule.items

        # 1. Determine State Pivot from Old Items
        pivot_mode = "AFTER_ALL"  # ON, BEFORE, AFTER_ALL
        pivot_item_title = None
        pivot_old_index = len(old_items)

        for i, item in enumerate(old_items):
            if item.get("state") == "ongoing":
                pivot_mode = "ON"
                pivot_item_title = item.get("title")
                pivot_old_index = i
                break
            if item.get("state") == "upcoming":
                pivot_mode = "BEFORE"
                pivot_item_title = item.get("title")
                pivot_old_index = i
                break

        # 2. Map Pivot to New Items
        target_index = -1

        # Try to find by title
        found_index = -1
        if pivot_item_title:
            for i, item in enumerate(new_items):
                if item.title == pivot_item_title:
                    found_index = i
                    break

        if pivot_mode == "ON":
            if found_index != -1:
                target_index = found_index
            else:
                # "whatever takes its place" -> approx same index
                target_index = (
                    min(pivot_old_index, len(new_items) - 1) if new_items else -1
                )
                if target_index == -1:
                    pivot_mode = "AFTER_ALL"  # list empty
        elif pivot_mode == "BEFORE":
            if found_index != -1:
                target_index = found_index
            else:
                target_index = min(pivot_old_index, len(new_items))
        elif pivot_mode == "AFTER_ALL":
            target_index = len(new_items)

        # 3. Apply State and Time Logic
        old_items_map = {itm.get("title"): itm for itm in old_items}

        for i, item in enumerate(new_items):
            # State Logic
            if pivot_mode == "ON":
                if i < target_index:
                    item.state = "ended"
                elif i == target_index:
                    item.state = "ongoing"
                else:
                    item.state = "upcoming"
            else:  # BEFORE or AFTER_ALL
                if i < target_index:
                    item.state = "ended"
                else:
                    item.state = "upcoming"

            # Time Logic
            if item.title in old_items_map:
                old_match = old_items_map[item.title]
                if item.time != old_match.get("time"):
                    # Time changed, track old time
                    item.oldTime = old_match.get("time")
                else:
                    # Time didn't change, preserve existing oldTime (if any)
                    item.oldTime = old_match.get("oldTime")

    # then store them in firestore under event/main["schedules"]
    # db is already initialized above
    db.document("event/main").set(
        {
            "schedules": [
                asdict(
                    s, dict_factory=lambda x: {k: v for (k, v) in x if v is not None}
                )
                for s in schedules
            ]
        },
        merge=True,
    )
