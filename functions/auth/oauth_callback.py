from dataclasses import asdict
import json
import os
import requests
from firebase_functions import https_fn
from firebase_functions.params import SecretParam, StringParam, IntParam
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
    default="https://us-central1-hackncsu-today.cloudfunctions.net/oauth_callback",
    description="The redirect URI for Discord OAuth2.",
)  # set to http://127.0.0.1:5001/hackncsu-today/us-central1/oauth_callback in .env.local for local testing
FRONTEND_AUTH_URI = StringParam(
    "FRONTEND_AUTH_URI",
    default="https://today.hackncstate.org/auth",
    description="The frontend URI to redirect to after authentication is complete.",
)  # set to http://localhost:8080/auth in .env.local for local testing

SPREADSHEET_URL = StringParam(
    "SPREADSHEET_URL",
    default="https://docs.google.com/spreadsheets/d/160mQFRW4EXJpxHGi2QGIWsn0yqPNyMfmfXf5gxvYHCU/edit?gid=0#gid=0",
    description="The URL of the Google Spreadsheet containing participant registrations.",
)
ORGANIZERS_LIST = StringParam(
    "ORGANIZERS_LIST",
    default="",
    description="Comma-separated list of organizer Discord IDs. These users will be logged in as organizers.",
)

USERNAME_COL_R = IntParam(
    "USERNAME_COL_R",
    default=6,
    description="The zero-based index of the column containing Discord usernames in the Registrations sheet.",
)
SHIRT_SIZE_COL_R = IntParam(
    "SHIRT_SIZE_COL_R",
    default=16,
    description="The zero-based index of the column containing shirt sizes in the Registrations sheet.",
)

CHECKED_IN_COL_C = IntParam(
    "CHECKED_IN_COL_C",
    default=0,
    description="The zero-based index of the column indicating whether the participant has checked in.",
)
FIRST_NAME_COL_C = IntParam(
    "FIRST_NAME_COL_C",
    default=1,
    description="The zero-based index of the column containing participants' first names.",
)
LAST_NAME_COL_C = IntParam(
    "LAST_NAME_COL_C",
    default=2,
    description="The zero-based index of the column containing participants' last names.",
)
PHONE_NUMBER_COL_C = IntParam(
    "PHONE_NUMBER_COL_C",
    default=3,
    description="The zero-based index of the column containing participants' phone numbers.",
)
EMAIL_COL_C = IntParam(
    "EMAIL_COL_C",
    default=4,
    description="The zero-based index of the column containing participants' email addresses.",
)
DIETARY_RESTRICTIONS_COL_C = IntParam(
    "DIETARY_RESTRICTIONS_COL_C",
    default=5,
    description="The zero-based index of the column containing participants' dietary restrictions.",
)
RFID_UUID_COL_C = IntParam(
    "RFID_UUID_COL_C",
    default=6,
    description="The zero-based index of the column containing participants' RFID UUIDs.",
)


def _get_registration(uid: str, username: str) -> User:
    """Gets a participant's registration and returns their User.
    Organizers will not need to be present on the spreadsheet
    """

    import gspread

    is_organizer = uid in ORGANIZERS_LIST.value.split(",")

    if is_organizer:
        return User(id=uid, role="organizer", username=username)
    else:
        creds, _ = google.auth.default(
            scopes=[
                "https://www.googleapis.com/auth/spreadsheets.readonly",
                "https://www.googleapis.com/auth/drive",
            ]
        )
        gc = gspread.authorize(creds)

        spreadsheet = gc.open_by_url(
            SPREADSHEET_URL.value,
        )

        print(spreadsheet.worksheets())

        reg_sheet = spreadsheet.worksheet("Registration Submissions")
        checkin_sheet = spreadsheet.worksheet("Check-in")

        cell = reg_sheet.find(username, in_column=USERNAME_COL_R.value + 1)

        # participant not registered
        if not cell:
            raise ValueError("participant_not_found")

        reg_row = reg_sheet.row_values(cell.row)
        checkin_row = checkin_sheet.row_values(cell.row)

        checked_in = checkin_row[CHECKED_IN_COL_C.value]

        # participant did not check in
        if str(checked_in).upper() != "TRUE":
            raise ValueError(
                "not_checked_in",
            )

        shirt_size = reg_row[SHIRT_SIZE_COL_R.value]

        email = checkin_row[EMAIL_COL_C.value]
        first_name = checkin_row[FIRST_NAME_COL_C.value]
        last_name = checkin_row[LAST_NAME_COL_C.value]
        phone = checkin_row[PHONE_NUMBER_COL_C.value]
        dietary_restrictions = checkin_row[DIETARY_RESTRICTIONS_COL_C.value]
        rfid_uuid = checkin_row[RFID_UUID_COL_C.value]

        print(
            email,
            first_name,
            last_name,
            phone,
            dietary_restrictions,
            shirt_size,
            rfid_uuid,
        )

        return User(
            id=uid,
            role="participant",
            username=username,
            firstName=first_name,
            lastName=last_name,
            phone=phone,
            email=email,
            dietaryRestrictions=dietary_restrictions,
            shirtSize=shirt_size,
            rfidUUID=rfid_uuid,
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

    _create_user(user)

    # if running locally with the emulator, give all users organizer permissions
    if os.getenv("FUNCTIONS_EMULATOR") == "true":
        claims = {"isOrganizer": True}
    else:
        claims = {"isOrganizer": user.role == "organizer"}

    try:
        return auth.create_custom_token(uid, developer_claims=claims).decode("utf-8")
    except Exception as e:
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
