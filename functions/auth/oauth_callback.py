from dataclasses import asdict
import json
import os
import time
import threading
import requests
from firebase_functions import https_fn
from firebase_functions.params import SecretParam, StringParam
from firebase_admin import auth, firestore

import google.auth

from .models import User

CLIENT_ID = StringParam(
    "CLIENT_ID", default="1371413608394653736", description="Discord OAuth2 Client ID."
)
CLIENT_SECRET = SecretParam(
    "CLIENT_SECRET", description="Discord OAuth2 Client Secret. "
)  # set this via command: firebase functions:secrets:set CLIENT_SECRET
REDIRECT_URI = StringParam(
    "REDIRECT_URI",
    default="http://127.0.0.1:5001/hackncsu-today/us-central1/oauth_callback",
    description="The redirect URI for Discord OAuth2.",
)  # set to https://us-central1-hackncsu-today.cloudfunctions.net/oauth_callback for prod deploys
FRONTEND_AUTH_URI = StringParam(
    "FRONTEND_AUTH_URI",
    default="http://localhost:8080/auth",
    description="The frontend URI to redirect to after authentication is complete.",
)  # set to https://today.hackncstate.org/auth for prod deploys
# set to https://hackncsu-today--dev-2clduajf.web.app/auth for dev deploys

SPREADSHEET_URL = StringParam(
    "REGISTRATION_SPREADSHEET_URL",
    default="https://docs.google.com/spreadsheets/d/160mQFRW4EXJpxHGi2QGIWsn0yqPNyMfmfXf5gxvYHCU/edit?gid=0#gid=0",
    description="The URL of the Google Spreadsheet containing participant registrations.",
)
ORGANIZERS_LIST = StringParam(
    "ORGANIZERS_LIST",
    default="",
    description="Comma-separated list of organizer Discord IDs. These users will be logged in as organizers.",
)

USERNAME_COL_R = StringParam(
    "USERNAME_COL_R",
    default="Discord",
    description="The header name of the column containing Discord usernames in the Registrations sheet.",
)
SHIRT_SIZE_COL_R = StringParam(
    "SHIRT_SIZE_COL_R",
    default="Shirt Size",
    description="The header name of the column containing shirt sizes in the Registrations sheet.",
)

CHECKED_IN_COL_C = StringParam(
    "CHECKED_IN_COL_C",
    default="Checked in",
    description="The header name of the column indicating whether the participant has checked in.",
)
FIRST_NAME_COL_C = StringParam(
    "FIRST_NAME_COL_C",
    default="First Name",
    description="The header name of the column containing participants' first names.",
)
LAST_NAME_COL_C = StringParam(
    "LAST_NAME_COL_C",
    default="Last Name",
    description="The header name of the column containing participants' last names.",
)
PHONE_NUMBER_COL_C = StringParam(
    "PHONE_NUMBER_COL_C",
    default="Phone",
    description="The header name of the column containing participants' phone numbers.",
)
EMAIL_COL_C = StringParam(
    "EMAIL_COL_C",
    default="Email",
    description="The header name of the column containing participants' email addresses.",
)
DIETARY_RESTRICTIONS_COL_C = StringParam(
    "DIETARY_RESTRICTIONS_COL_C",
    default="Dietary Restrictions",
    description="The header name of the column containing participants' dietary restrictions.",
)
RFID_UUID_COL_C = StringParam(
    "RFID_UUID_COL_C",
    default="RFID UUID",
    description="The header name of the column containing participants' RFID UUIDs.",
)
UNIVERSITY_COL_R = StringParam(
    "UNIVERSITY_COL_R",
    default="University",
    description="The header name of the column containing participants' university in the Registrations sheet.",
)


# ---------------------------------------------------------------------------
# In-memory spreadsheet cache – avoids hitting Google Sheets on every login.
# Cloud Functions reuse warm instances, so the cache survives across
# invocations on the same instance.  A TTL (default 5 min) keeps it fresh.
# ---------------------------------------------------------------------------

SHEET_CACHE_TTL_SECONDS = 300  # 5 minutes

_sheet_cache_lock = threading.Lock()
_sheet_cache: dict | None = (
    None  # {"ts": float, "reg_headers": [...], "reg_rows": [...], "checkin_headers": [...], "checkin_rows": [...]}
)


def _fetch_sheets_data() -> dict:
    """Fetch both worksheets from Google Sheets and return them as a dict."""
    import gspread

    creds, _ = google.auth.default(
        scopes=[
            "https://www.googleapis.com/auth/spreadsheets.readonly",
            "https://www.googleapis.com/auth/drive",
        ]
    )
    gc = gspread.authorize(creds)
    spreadsheet = gc.open_by_url(SPREADSHEET_URL.value)

    reg_sheet = spreadsheet.worksheet("Registration Submissions")
    checkin_sheet = spreadsheet.worksheet("Check-in")

    # Batch-fetch all values in two calls (instead of per-row later)
    reg_all = reg_sheet.get_all_values()
    checkin_all = checkin_sheet.get_all_values()

    return {
        "ts": time.monotonic(),
        "reg_headers": reg_all[0] if reg_all else [],
        "reg_rows": reg_all[1:] if len(reg_all) > 1 else [],
        "checkin_headers": checkin_all[0] if checkin_all else [],
        "checkin_rows": checkin_all[1:] if len(checkin_all) > 1 else [],
    }


def _get_cached_sheets() -> dict:
    """Return cached sheet data, refreshing if stale or missing."""
    global _sheet_cache
    with _sheet_cache_lock:
        now = time.monotonic()
        if _sheet_cache is None or (now - _sheet_cache["ts"]) > SHEET_CACHE_TTL_SECONDS:
            print("[sheet-cache] cache miss – fetching from Google Sheets")
            _sheet_cache = _fetch_sheets_data()
        else:
            age = round(now - _sheet_cache["ts"], 1)
            print(f"[sheet-cache] cache hit (age {age}s)")
        return _sheet_cache


def _get_col_index_from_headers(headers: list[str], name: str) -> int:
    """Return 1-based column index for a given header name.

    Matches case-insensitively and trims whitespace. Raises ValueError
    if the header is not found.
    """
    name_norm = name.strip().lower()
    for i, h in enumerate(headers):
        if h.strip().lower() == name_norm:
            return i + 1
    raise ValueError("column_not_found")


def _get_cell_from_row(row: list[str], index_1based: int) -> str:
    """Get cell value from row given a 1-based column index."""
    index_0based = index_1based - 1
    return row[index_0based] if len(row) > index_0based else ""


def _get_registration(uid: str, username: str) -> User:
    """Gets a participant's registration and returns their User.
    Organizers will not need to be present on the spreadsheet
    """

    is_organizer = uid in [
        o.strip() for o in ORGANIZERS_LIST.value.split(",") if o.strip()
    ]

    if is_organizer:
        return User(id=uid, role="organizer", username=username)
    else:
        sheets = _get_cached_sheets()
        reg_headers = sheets["reg_headers"]
        checkin_headers = sheets["checkin_headers"]

        username_col_idx = _get_col_index_from_headers(
            reg_headers, USERNAME_COL_R.value
        )

        # Search for the user in cached registration rows
        username_lower = username.lower()
        matched_row_idx: int | None = None
        for i, row in enumerate(sheets["reg_rows"]):
            cell_val = _get_cell_from_row(row, username_col_idx)
            if cell_val.strip().lower() == username_lower:
                matched_row_idx = i
                break

        # participant not registered
        if matched_row_idx is None:
            raise ValueError("participant_not_found")

        reg_row = sheets["reg_rows"][matched_row_idx]
        checkin_row = (
            sheets["checkin_rows"][matched_row_idx]
            if matched_row_idx < len(sheets["checkin_rows"])
            else []
        )

        checked_in_idx = _get_col_index_from_headers(
            checkin_headers, CHECKED_IN_COL_C.value
        )
        checked_in = _get_cell_from_row(checkin_row, checked_in_idx).upper()

        # participant did not check in
        if checked_in == "NO":
            raise ValueError(
                "not_checked_in",
            )

        # if checked in friday
        friday_checked_in = checked_in == "FRIDAY"

        shirt_size_idx = _get_col_index_from_headers(
            reg_headers, SHIRT_SIZE_COL_R.value
        )
        shirt_size = _get_cell_from_row(reg_row, shirt_size_idx)

        email_idx = _get_col_index_from_headers(checkin_headers, EMAIL_COL_C.value)
        email = _get_cell_from_row(checkin_row, email_idx)

        first_name_idx = _get_col_index_from_headers(
            checkin_headers, FIRST_NAME_COL_C.value
        )
        first_name = _get_cell_from_row(checkin_row, first_name_idx)

        last_name_idx = _get_col_index_from_headers(
            checkin_headers, LAST_NAME_COL_C.value
        )
        last_name = _get_cell_from_row(checkin_row, last_name_idx)

        phone_idx = _get_col_index_from_headers(
            checkin_headers, PHONE_NUMBER_COL_C.value
        )
        phone = _get_cell_from_row(checkin_row, phone_idx)

        dietary_idx = _get_col_index_from_headers(
            checkin_headers, DIETARY_RESTRICTIONS_COL_C.value
        )
        dietary_restrictions = _get_cell_from_row(checkin_row, dietary_idx)

        rfid_idx = _get_col_index_from_headers(checkin_headers, RFID_UUID_COL_C.value)
        rfid_uuid = _get_cell_from_row(checkin_row, rfid_idx)

        university_idx = _get_col_index_from_headers(
            reg_headers, UNIVERSITY_COL_R.value
        )
        university = _get_cell_from_row(reg_row, university_idx)

        print(
            email,
            first_name,
            last_name,
            phone,
            dietary_restrictions,
            shirt_size,
            rfid_uuid,
            university,
        )

        return User(
            id=uid,
            role="participant",
            username=username.lower(),
            firstName=first_name,
            lastName=last_name,
            phone=phone,
            email=email,
            dietaryRestrictions=dietary_restrictions,
            shirtSize=shirt_size,
            rfidUUID=rfid_uuid,
            university=university,
            # mark if they checked in on friday as having attended the career fair event
            attendedEvents=["career_fair_friday"] if friday_checked_in else [],
        )


def _create_user(user: User):
    """Create the user in Firestore (/users/{id}) if they do not already exist."""

    db = firestore.client()
    user_doc = db.collection("users").document(user.id)

    user_doc.set(asdict(user), merge=True)


def _generate_login_token(uid: str, username: str) -> str:
    """Given an ID and username:

    - identify them in the registration sheet
    - if not checked in or missing, return error
    - if not in firestore, create user data
    - return a frontend login token
    """

    user = _get_registration(uid, username)

    # If login is disabled for participants, reject them
    if user.role != "organizer" and os.getenv("FUNCTIONS_EMULATOR") != "true":
        db = firestore.client()
        event_doc = db.document("event/main").get()
        if event_doc.exists:
            event_data = event_doc.to_dict()
            if event_data and not event_data.get("loginEnabled", True):
                raise ValueError("login_disabled")

    _create_user(user)

    # if running locally with the emulator, give all users organizer permissions
    if os.getenv("FUNCTIONS_EMULATOR") == "true":
        claims = {"isOrganizer": True}
    else:
        claims = {"isOrganizer": user.role == "organizer"}

    try:
        return auth.create_custom_token(uid, developer_claims=claims).decode("utf-8")
    except Exception as e:
        print(f"could not create custom token for user {uid}: {e}")
        raise ValueError("token_creation_failed")


@https_fn.on_request(secrets=[CLIENT_SECRET])
def oauth_callback(req: https_fn.Request) -> https_fn.Response:
    """Handle OAuth2 for frontend"""

    print("oauth callback started")

    redirect_url: str
    code = req.args.get("code")

    if not code:
        redirect_url = f"{FRONTEND_AUTH_URI.value}?error=missing_code"
    else:
        try:

            token_data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": REDIRECT_URI.value,
            }

            token_response = requests.post(
                "https://discord.com/api/oauth2/token",
                data=token_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                auth=(CLIENT_ID.value, CLIENT_SECRET.value),
            )

            token_response.raise_for_status()
            access_token = token_response.json()["access_token"]

            user_response = requests.get(
                "https://discord.com/api/users/@me",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            user_response.raise_for_status()
            discord_user = user_response.json()

            discord_user_id = discord_user["id"]
            discord_username = discord_user["username"]

            token = _generate_login_token(discord_user_id, discord_username)

            redirect_url = f"{FRONTEND_AUTH_URI.value}?token={token}"

        except ValueError as e:
            code = e.args[0]
            redirect_url = f"{FRONTEND_AUTH_URI.value}?error={code}"
        except Exception as e:
            print(f"Internal error during OAuth callback: {e}")
            redirect_url = f"{FRONTEND_AUTH_URI.value}?error=internal_error"

    return https_fn.Response(status=302, headers={"Location": redirect_url})
