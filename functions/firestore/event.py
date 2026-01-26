from datetime import datetime, timedelta

from firebase_functions import https_fn
from firebase_admin import firestore


@https_fn.on_call()
def initialize_event(request: https_fn.CallableRequest) -> None:
    """Initializes the event config with default data."""

    if not request.auth or not request.auth.token.get("isOrganizer", False):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.PERMISSION_DENIED,
            message="Only organizers can initialize event data.",
        )

    db = firestore.client()
    doc_ref = db.document("event/main")

    if doc_ref.get().exists:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.ALREADY_EXISTS,
            message="Event data already exists.",
        )

    start_time = (
        datetime.now().astimezone().replace(hour=16, minute=0, second=0, microsecond=0)
    )
    end_time = start_time + timedelta(days=1)

    default_config = {
        "tracks": [
            {"name": "Track 1", "description": "Sample elite ball track"},
            {"name": "Track 2", "description": "Sample great ball track"},
            {"name": "Track 3", "description": "Sample poke ball track"},
        ],
        "challenges": [
            {
                "name": "Sample Challenge 1",
                "description": "This is a sample challenge description.",
            },
            {
                "name": "Sample Challenge 2",
                "description": "This is another sample challenge description. Perhaps this could be an API challenge?",
            },
        ],
        "hackingState": "setup",
        "hackingEndTime": end_time.isoformat().replace("+00:00", "Z"),
        "schedules": [],
        "announcements": [],
        "resources": [
            {
                "type": "text",
                "label": "Rules",
                "content": "- Rule 1\n- Rule 2\n- Rule 3\n- etc.",
                "hidden": False,
            },
            {
                "type": "text",
                "label": "Tracks",
                "content": "The Tracks resource is auto-generated based on the tracks you configure for the event.",
                "hidden": True,
            },
            {
                "type": "text",
                "label": "Challenges",
                "content": "The Challenges resource is auto-generated based on the challenges you configure for the event.",
                "hidden": True,
            },
            {
                "type": "text",
                "label": "FAQs",
                "content": "Event FAQs go here. You can use markdown to bold, italicize, and add links and even images!",
                "hidden": False,
            },
            {
                "type": "text",
                "label": "Judging Criteria",
                "content": "Judging criteria go here. You can use markdown to bold, italicize, and add links and even images!",
                "hidden": False,
            },
            {
                "type": "text",
                "label": "Prizes",
                "content": "Prizes information goes here. You can use markdown to bold, italicize, and add links and even images!",
                "hidden": False,
            },
            {
                "type": "text",
                "label": "Catering Menu",
                "content": "![borzoi](https://media1.tenor.com/m/J3sih0hnKLwAAAAC/borzoi-siren.gif)",
                "hidden": False,
            },
            {
                "type": "link",
                "label": "Opening Slides",
                "url": "https://example.com",
                "hidden": True,
            },
            {
                "type": "link",
                "label": "Discord",
                "url": "https://example.com",
                "hidden": False,
            },
        ],
    }

    doc_ref.set(default_config)
