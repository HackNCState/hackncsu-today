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
        "checklistItems": [
            {
                "id": "create_team",
                "title": "Form a team",
                "description": "You need to be in teams of 2-4 to submit a project, so make sure to form your team as soon as possible! "
                "Afterwards, one member should register the team in the Your Team section.",
                "autoCheck": True,
            },
            {
                "id": "approve_team",
                "title": "Check in with a mentor and get your team approved",
                "description": "After you've created your team, wait for the mentor check-in period. "
                "Once it starts, please meet with a mentor to discuss your project, "
                "pick up your shirt, and then complete approval with a staff member.",
                "autoCheck": True,
            },
            {
                "id": "create_github_repo",
                "title": "Create a GitHub repository",
                "description": "You'll need a [GitHub](https://github.com) repository for your project so your team can collaborate and track progress. "
                "Make sure it's set to public so judges can view it after you submit! If you're new to GitHub, check out this "
                "[resource](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories). "
                "Don't hesitate to ask a mentor or look stuff up if you need help.",
                "autoCheck": False,
            },
            {
                "id": "signup_devpost",
                "title": "Register on Devpost",
                "description": "Devpost is where you'll submit your project for judging. To do this, all team members should create a Devpost account and register "
                "at [hackncstate2026.devpost.com](https://hackncstate2026.devpost.com). You'll also be able to view your peers' projects from here. "
                "Get this out of the way early so you don't forget later!",
                "autoCheck": False,
            },
            {
                "id": "attend_workshop",
                "title": "Attend a workshop",
                "description": "Our workshops are a great way to learn new skills and technologies that can help you build your project. Each attendance will count "
                "as a raffle entry for prizes, so try to attend as many as you can! Refer to the schedule for workshop times and locations, and the Prizes section for more info on raffle prizes.",
                "autoCheck": True,
            },
            {
                "id": "draft_submission",
                "title": "Draft your Devpost submission",
                "description": "One member of your team should draft the Devpost submission for your project. "
                "From the project page, you'll be able to invite the other members of your team and periodically update your submission. "
                "It is good practice to draft your submission early and update it as you make progress on your project, since you won't be able to make changes after the submission deadline.",
                "autoCheck": False,
            },
            {
                "id": "submit_project",
                "title": "Submit your project",
                "description": "Submit your project on Devpost before the deadline. Changes pushed to your repository after submission will not be considered for judging, "
                "so make sure everything is ready beforehand! You may review judging criteria in the Resources section to ensure your project meets all requirements. "
                "**Remember, only one member needs to submit on behalf of the team.**",
                "autoCheck": False,
            },
        ],
    }

    doc_ref.set(default_config)
