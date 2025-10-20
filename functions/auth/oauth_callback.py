import json
import os
import requests
from firebase_functions import https_fn
from firebase_functions.params import SecretParam, StringParam, IntParam
from firebase_admin import auth, firestore

import google.auth

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
    default="https://docs.google.com/spreadsheets/d/1QoWfF3ooyeb5S9LkwmDgaG-3_01sOWNf1BUIpAALotk/edit?gid=0#gid=0",
    description="The URL of the Google Spreadsheet containing participant registrations.",
)
WORKSHEET_NAME = StringParam(
    "WORKSHEET_NAME",
    default="Registrations",
    description="The name of the worksheet in the Google Spreadsheet where participant registrations are stored.",
)
ORGANIZERS_LIST = StringParam(
    "ORGANIZERS_LIST",
    default="",
    description="Comma-separated list of organizer Discord IDs. These users will be logged in as organizers.",
)

FIRST_NAME_COLUMN = IntParam(
    "FIRST_NAME_COLUMN",
    default=0,
    description="The column number in the spreadsheet where first names are stored. Default is 0 (column A).",
)
LAST_NAME_COLUMN = IntParam(
    "LAST_NAME_COLUMN",
    default=1,
    description="The column number in the spreadsheet where last names are stored. Default is 1 (column B).",
)
PHONE_NUMBER_COLUMN = IntParam(
    "PHONE_NUMBER_COLUMN",
    default=2,
    description="The column number in the spreadsheet where phone numbers are stored. Default is 2 (column C).",
)
EMAIL_COLUMN = IntParam(
    "EMAIL_COLUMN",
    default=3,
    description="The column number in the spreadsheet where email addresses are stored. Default is 3 (column D).",
)
CHECKED_IN_COLUMN = IntParam(
    "CHECKED_IN_COLUMN",
    default=6,
    description="The column number in the spreadsheet where the checked-in checkboxes are stored. Default is 6 (column G).",
)
DISCORD_USERNAME_COLUMN = IntParam(
    "DISCORD_USERNAME_COLUMN",
    default=7,
    description="The column number in the spreadsheet where Discord usernames are stored. Default is 7 (column H).",
)


def _validate_user(id: str, username: str) -> tuple[str, dict]:
    """Compare a Discord user with the participants spreadsheet
    and give a token if they are included and checked in. Also returns
    user information.

    Most user information will be missing if the user is an organizer since
    organizers do not need to be in the spreadsheet."""
    print(f"Generating auth token for user {username} ({id})")

    import gspread

    is_organizer = id in ORGANIZERS_LIST.value.split(",")
    print(f"User is organizer: {is_organizer}")

    if not is_organizer:
        # check spreadsheet for participant registration (by Discord username)
        try:
            print("Checking spreadsheet for participant registration...")
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

            worksheet = spreadsheet.worksheet("Registrations")
            print(
                f"Searching for '{username}' in column {DISCORD_USERNAME_COLUMN.value}"
            )

            cell = worksheet.find(username, in_column=DISCORD_USERNAME_COLUMN.value + 1)
            print(f"Found cell: {cell}")

            if not cell:
                raise ValueError(
                    "participant_not_found",
                    "This Discord account is not associated with a registered participant.\nLet a staff member know if you think this is a mistake.",
                )

            row_data = worksheet.row_values(cell.row)

            # access data from the row using column indices
            checked_in_status = row_data[CHECKED_IN_COLUMN.value]
            print(f"Checked in status for {username}: {checked_in_status}")

            if str(checked_in_status).upper() != "TRUE":
                raise ValueError(
                    "not_checked_in",
                    "You're a participant but it seems you haven't checked in yet!\nPlease check in at the registration desk or let a staff member know if you think this is a mistake.",
                )

            first_name = row_data[FIRST_NAME_COLUMN.value]
            last_name = row_data[LAST_NAME_COLUMN.value]
            phone = row_data[PHONE_NUMBER_COLUMN.value]
            email = row_data[EMAIL_COLUMN.value]
            print(f"Participant info: {first_name} {last_name}, {email}, {phone}")

            if not first_name or not last_name or not email:
                raise ValueError(
                    "missing_info",
                    "Participant's name or email is missing in the spreadsheet.",
                )

        except gspread.exceptions.SpreadsheetNotFound:
            print("Spreadsheet not found.")
            raise ValueError(
                "spreadsheet_not_found",
                "Spreadsheet not found. Check name and permissions.",
            )
        except https_fn.HttpsError as e:
            print(f"Caught HttpsError: {e}")
            raise e
        except Exception as e:
            print(f"Caught exception while checking spreadsheet: {e}")
            raise ValueError(
                "spreadsheet_check_error",
                f"An error occurred checking spreadsheet: {e}",
            )
    else:
        print("User is an organizer, skipping spreadsheet check.")
        first_name = None
        last_name = None
        phone = None
        email = None

    # If running in the emulator, give organizer permissions to all users
    # Normally an organizer is denoted by their Discord ID being in the ORGANIZERS_LIST
    # and they won't need to be in the spreadsheet to get a token,
    # but in the emulator we want to allow all users to test organizer functionality
    if os.getenv("FUNCTIONS_EMULATOR") == "true":
        is_organizer = True

    try:
        custom_token = auth.create_custom_token(
            id,
            developer_claims={
                "isOrganizer": is_organizer,
            },
        )

        # Trick frontend into still thinking this is a participant
        # (you will be able to switch to organizer mode while developing)
        if os.getenv("FUNCTIONS_EMULATOR") == "true":
            is_organizer = False

        user = {  # TODO update to be dataclass for nicer typing
            "id": id,
            "username": username,
            "firstName": first_name,
            "lastName": last_name,
            "phone": phone,
            "email": email,
            "dietaryRestrictions": None,  # TODO get this from spreadsheet?
            "shirtSize": None,  # TODO get this from spreadsheet?
            "eventsAttended": [],
            "hadFirstLunch": False,
            "hadSecondLunch": False,
            "hadDinner": False,
            "hadBreakfast": False,
            "notes": [],
            "isOrganizer": is_organizer,
        }
        print(f"Successfully generated token and user data: {user}")
        return (custom_token.decode("utf-8"), user)
    except Exception as e:
        print(f"Error creating custom token: {e}")
        raise ValueError(
            "token_creation_failed",
            f"Error creating custom token: {e}",
        )


def _create_user(data: dict):
    """Create the user in Firestore (/users/{id}) if they do not already exist."""
    db = firestore.client()
    user_id = data["id"]
    user_ref = db.collection("users").document(user_id)

    user_doc = user_ref.get()

    if user_doc.exists:
        print(f"User {user_id} already exists in Firestore. Updating...")
        user_ref.update(
            {
                "username": data["username"],
                "firstName": data.get("firstName"),
                "lastName": data.get("lastName"),
                "phone": data.get("phone"),
                "email": data.get("email"),
                "isOrganizer": data["isOrganizer"],
            }
        )
    else:
        print(f"Creating new user {user_id} in Firestore...")
        user_ref.set(data)

    print(f"User {user_id} saved successfully.")


@https_fn.on_request(secrets=[CLIENT_SECRET])
def oauth_callback(req: https_fn.Request) -> https_fn.Response:
    """Handle OAuth2 callback from Discord. Returns HTML page that is listened to
    by the main window to receive the authentication token, plus user information."""
    print("oauth_callback function started.")

    code = req.args.get("code")
    print(f"Received code: {code}")

    if code:
        try:
            token_data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": REDIRECT_URI.value,
            }
            print(f"Exchanging code for token with data: {token_data}")

            token_response = requests.post(
                "https://discord.com/api/oauth2/token",
                data=token_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                auth=(CLIENT_ID.value, CLIENT_SECRET.value),
            )
            print(f"Token response status: {token_response.status_code}")
            print(f"Token response content: {token_response.text}")

            token_response.raise_for_status()
            access_token = token_response.json()["access_token"]
            print(f"Received access token: {access_token[:10]}...")

            user_response = requests.get(
                "https://discord.com/api/users/@me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            print(f"User response status: {user_response.status_code}")
            user_response.raise_for_status()
            discord_user = user_response.json()
            print(f"Discord user data: {discord_user}")
            discord_user_id = discord_user["id"]
            discord_username = discord_user["username"]

            print("Calling _validate_user...")

            token, user = _validate_user(
                id=discord_user_id,
                username=discord_username,
            )
            print(f"Received auth token from _validate_user: {token}")

            _create_user(user)

            print("Ensured user exists in Firestore.")

            # Redirect to frontend with token
            redirect_url = f"{FRONTEND_AUTH_URI.value}?token={token}"
            print(f"Redirecting to: {redirect_url}")
            return https_fn.Response(status=302, headers={"Location": redirect_url})
        
        except ValueError as ve:
            error_code, error_message = ve.args
            print(f"Caught ValueError: {error_code}, {error_message}")
            redirect_url = f"{FRONTEND_AUTH_URI.value}?error={error_code}"
            print(f"Redirecting to error page: {redirect_url}")
            return https_fn.Response(status=302, headers={"Location": redirect_url})

        except Exception as e:
            # Handle any errors during authentication
            print(f"Caught exception: {e}")
            redirect_url = f"{FRONTEND_AUTH_URI.value}?error=internal_error"
            print(f"Redirecting to error page: {redirect_url}")
            return https_fn.Response(status=302, headers={"Location": redirect_url})

    # Handle missing code parameter
    redirect_url = f"{FRONTEND_AUTH_URI.value}?error=missing_code"
    print(f"Redirecting to error page: {redirect_url}")
    return https_fn.Response(status=302, headers={"Location": redirect_url})
