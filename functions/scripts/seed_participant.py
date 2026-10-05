"""Creates a checked-in participant in the LOCAL emulators, so you can test participant login.

This does what the check-in flow will eventually do: create the auth account and users/{uid}.

Usage (with the emulators running):
    functions/venv/bin/python functions/scripts/seed_participant.py you+participant@gmail.com [First] [Last]
"""

import os
import sys

# only ever talk to the emulators, never production
os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099"
os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:5500"
os.environ["GCLOUD_PROJECT"] = "hackncsu-today"
os.environ.setdefault("no_proxy", "*")

from firebase_admin import auth, credentials, firestore, initialize_app  # noqa: E402
from google.auth.credentials import AnonymousCredentials  # noqa: E402


class _EmulatorCredential(credentials.Base):
    def get_credential(self):
        return AnonymousCredentials()


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    first_name = sys.argv[2] if len(sys.argv) > 2 else "Test"
    last_name = sys.argv[3] if len(sys.argv) > 3 else "Participant"

    initialize_app(_EmulatorCredential())

    try:
        user = auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        user = auth.create_user(email=email)

    firestore.client().collection("users").document(user.uid).set(
        {
            "id": user.uid,
            "role": "participant",
            "email": email,
            "firstName": first_name,
            "lastName": last_name,
            "username": email.split("@")[0],  # TODO: remove after migration to email-based login
            "phone": "000-000-0000",
            "shirtSize": "M",
            "dietaryRestrictions": "None",
            "rfidUUID": f"test-rfid-{user.uid}",
            "university": "NC State University",
            "teamId": None,
            "attendedEvents": [],
            "checklistItemStatuses": [],
        },
        merge=True,
    )

    print(f"Checked-in participant ready: {email} (uid {user.uid})")


if __name__ == "__main__":
    main()
