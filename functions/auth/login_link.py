import os
import re

from firebase_admin import auth, firestore
from firebase_functions import https_fn
from firebase_functions.params import StringParam

from .mailer import SENDGRID_API_KEY, login_link_email, send_email

FRONTEND_AUTH_URI = StringParam(
    "FRONTEND_AUTH_URI",
    default="http://localhost:8080/auth",
    description="The frontend page that completes sign-in from the magic link.",
)  # set to https://today.hackncstate.org/auth for prod deploys
ORGANIZER_EMAILS = StringParam(
    "ORGANIZER_EMAILS",
    default="",
    description="Comma-separated list of organizer emails. These users will be logged in as organizers.",
)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _is_emulator() -> bool:
    return os.getenv("FUNCTIONS_EMULATOR") == "true"


def _error(reason: str, message: str) -> https_fn.HttpsError:
    # reason is a stable code the frontend switches on, message is for logs/debugging
    return https_fn.HttpsError(
        code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
        message=message,
        details={"reason": reason},
    )


def _get_or_create_auth_user(email: str) -> auth.UserRecord:
    try:
        return auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        return auth.create_user(email=email)


def _prepare_organizer(email: str) -> str:
    """Make sure the organizer has an auth account, claims and a users/{uid} doc."""

    user = _get_or_create_auth_user(email)
    # claims set before sign-in end up in the token the frontend gets
    auth.set_custom_user_claims(user.uid, {"isOrganizer": True, "role": "organizer"})

    db = firestore.client()
    db.collection("users").document(user.uid).set(
        {
            "id": user.uid,
            "role": "organizer",
            "email": email,
            "firstName": "",
            "lastName": "",
            "username": email.split("@")[0],  # TODO: remove after migration to email-based login
        },
        merge=True,
    )
    return user.uid


def _check_participant(email: str) -> str:
    """Participants can only log in once check-in has provisioned their account."""

    try:
        user = auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        raise _error("not_checked_in", "No account for this email.")

    db = firestore.client()
    if not db.collection("users").document(user.uid).get().exists:
        raise _error("not_checked_in", "User has not been checked in.")

    if not _is_emulator():
        event_doc = db.document("event/main").get()
        event_data = event_doc.to_dict() if event_doc.exists else {}
        if not event_data.get("loginEnabled", True):
            raise _error("login_disabled", "Login is disabled.")

    return user.uid


@https_fn.on_call(secrets=[SENDGRID_API_KEY])
def send_login_link(request: https_fn.CallableRequest) -> None:
    """Emails a dashboard magic link to an organizer or checked-in participant."""

    email = str(request.data.get("email", "")).strip().lower()
    if not EMAIL_RE.match(email):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="A valid email is required.",
            details={"reason": "invalid_email"},
        )

    organizer_emails = [
        e.strip().lower() for e in ORGANIZER_EMAILS.value.split(",") if e.strip()
    ]

    if email in organizer_emails:
        uid = _prepare_organizer(email)
    else:
        uid = _check_participant(email)

    user_doc = firestore.client().collection("users").document(uid).get()
    first_name = (user_doc.to_dict() or {}).get("firstName") or None

    link = auth.generate_sign_in_with_email_link(
        email,
        auth.ActionCodeSettings(url=FRONTEND_AUTH_URI.value, handle_code_in_app=True),
    )

    # locally, print the link instead of needing a real SendGrid key (real keys start with "SG.")
    if _is_emulator() and not os.getenv("SENDGRID_API_KEY", "").startswith("SG."):
        print(f"[send_login_link] login link for {email}: {link}")
        return

    subject, html_body, text_body = login_link_email(first_name, link)
    try:
        send_email(email, subject, html_body, text_body)
    except Exception as e:
        print(f"[send_login_link] failed to send email to {email}: {e}")
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message="Failed to send login email.",
            details={"reason": "email_failed"},
        )
