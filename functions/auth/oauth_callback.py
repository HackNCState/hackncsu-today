import json
import os
import requests
from firebase_functions import https_fn
from firebase_functions.params import SecretParam, StringParam, IntParam
from firebase_admin import auth

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


def _generate_auth_token(id: str, username: str) -> dict:
    """Compare a Discord user with the participants spreadsheet
    and give a token if they are included and checked in. Also returns
    user information if available."""
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
                    "participant-not-found",
                    "This Discord account is not associated with a registered participant.\nLet a staff member know if you think this is a mistake.",
                )

            row_data = worksheet.row_values(cell.row)

            # access data from the row using column indices
            checked_in_status = row_data[CHECKED_IN_COLUMN.value]
            print(f"Checked in status for {username}: {checked_in_status}")

            if str(checked_in_status).upper() != "TRUE":
                raise ValueError(
                    "not-checked-in",
                    "You're a participant but it seems you haven't checked in yet!\nPlease check in at the registration desk or let a staff member know if you think this is a mistake.",
                )

            first_name = row_data[FIRST_NAME_COLUMN.value]
            last_name = row_data[LAST_NAME_COLUMN.value]
            phone = row_data[PHONE_NUMBER_COLUMN.value]
            email = row_data[EMAIL_COLUMN.value]
            print(f"Participant info: {first_name} {last_name}, {email}, {phone}")

            if not first_name or not last_name or not email:
                raise ValueError(
                    "missing-info",
                    "Participant's name or email is missing in the spreadsheet.",
                )

        except gspread.exceptions.SpreadsheetNotFound:
            print("Spreadsheet not found.")
            raise ValueError(
                "spreadsheet-not-found",
                "Spreadsheet not found. Check name and permissions.",
            )
        except https_fn.HttpsError as e:
            print(f"Caught HttpsError: {e}")
            raise e
        except Exception as e:
            print(f"Caught exception while checking spreadsheet: {e}")
            raise ValueError(
                "internal-error",
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

        result = {
            "token": custom_token.decode("utf-8"),
            "id": id,
            "username": username,
            "firstName": first_name,
            "lastName": last_name,
            "phone": phone,
            "email": email,
            "isOrganizer": is_organizer,
        }
        print(f"Successfully generated token and user data: {result}")
        return result
    except Exception as e:
        print(f"Error creating custom token: {e}")
        raise ValueError(
            "token-creation-failed",
            f"Error creating custom token: {e}",
        )


@https_fn.on_request(secrets=[CLIENT_SECRET])
def oauth_callback(req: https_fn.Request) -> https_fn.Response:
    """Handle OAuth2 callback from Discord. Returns HTML page that is listened to
    by the main window to receive the authentication token, plus user information."""
    print("oauth_callback function started.")

    code = req.args.get("code")
    print(f"Received code: {code}")

    if not code:
        print("Missing 'code' parameter. Args: ", req.url)
        response_json = json.dumps(
            {
                "status": "error",
                "error": {
                    "code": "missing-parameter",
                    "message": "Missing 'code' parameter in the request.",
                },
            }
        )
    else:
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

            print("Calling _generate_auth_token...")
            auth_token = _generate_auth_token(
                id=discord_user_id,
                username=discord_username,
            )
            print(f"Received auth token from _generate_auth_token: {auth_token}")

            success_payload = {
                "status": "success",
                "data": auth_token,
            }
            response_json = json.dumps(success_payload)
            print(f"Success payload: {response_json}")

        except ValueError as e:
            # Handle specific ValueError exceptions (e.g., missing parameters, invalid format)
            print(f"Caught ValueError: {e}")
            error_code, error_message = e.args
            error_payload = {
                "status": "error",
                "error": {"code": error_code, "message": error_message},
            }
            response_json = json.dumps(error_payload)
            print(f"Error payload (ValueError): {response_json}")
        except Exception as e:
            # Handle unexpected errors (e.g., Discord API is down, parsing failed)
            print(f"Caught unexpected exception: {e}")
            error_payload = {
                "status": "error",
                "error": {
                    "code": "internal-server-error",
                    "message": f"An unexpected error occurred during authentication. Contact a staff member.\n{e}",
                },
            }
            response_json = json.dumps(error_payload)
            print(f"Error payload (Exception): {response_json}")

    html_response = f"""
    <!DOCTYPE html>
    <html>
    <head><title>Authenticating...</title></head>
    <body>
    <p>Please wait, finishing authentication...</p>
    <script>
        // Send the JSON payload (string) to the main window
        window.opener.postMessage({json.dumps(response_json)}, '*');
        // Close this popup window
        window.close();
    </script>
    </body>
    </html>
    """
    print("Sending HTML response to close popup.")

    return https_fn.Response(html_response, status=200, content_type="text/html")
