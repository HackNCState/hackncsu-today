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
            {
                "name": "Track 1",
                "description": "Sample elite ball track",
                "fullDescription": "",
                "allowedUniversities": [],
            },
            {
                "name": "Track 2",
                "description": "Sample great ball track",
                "fullDescription": "",
                "allowedUniversities": [],
            },
            {
                "name": "Track 3",
                "description": "Sample poke ball track",
                "fullDescription": "",
                "allowedUniversities": [],
            },
        ],
        "challenges": [
            {
                "name": "Sample Challenge 1",
                "description": "This is a sample challenge description.",
                "fullDescription": "",
                "category": "default",
            },
            {
                "name": "MLH Best Use of AI",
                "description": "Build a project that uses AI in a creative way.",
                "fullDescription": "",
                "category": "mlh",
            },
            {
                "name": "MLH Best Domain Name",
                "description": "Register a domain name for your project.",
                "fullDescription": "",
                "category": "mlh",
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
                "id": "create_github_repo",
                "title": "Create a GitHub repository",
                "description": "Create a shared [GitHub](https://github.com) repo so your team can collaborate and track progress. "
                "Set it to public so judges can view it after submission. New to GitHub? Check out this "
                "[resource](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories) or ask a mentor for help.",
                "autoCheck": False,
            },
            {
                "id": "signup_devpost",
                "title": "Register on Devpost",
                "description": "Devpost is where projects are submitted for judging. Each team member should create an account and register for the hackathon at "
                "[hackncstate2026.devpost.com](https://hackncstate2026.devpost.com). Register early so you're ready to submit later.",
                "autoCheck": False,
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
                "id": "attend_workshop",
                "title": "Attend a workshop",
                "description": "Workshops are a fun way to learn new skills that can help your project. Each workshop you attend counts as a raffle entry. "
                "The more workshops you attend, the better your chances of winning prizes! "
                "Check the schedule for times and locations, and see the Prizes section for raffle details.",
                "autoCheck": True,
            },
            {
                "id": "sponsors_attend",
                "title": "Check out our sponsors",
                "description": "Our sponsors are tabling in Talley Ballroom and would love to meet you. "
                "Stop by to learn about their companies and what they do—and feel free to pick up some swag.",
                "autoCheck": False,
            },
            {
                "id": "draft_submission",
                "title": "Draft your Devpost submission",
                "description": "One team member should create the draft Devpost submission. "
                "From the project page, invite teammates and update the submission as you make progress. "
                "Draft early so you’re not rushed before the deadline.",
                "autoCheck": False,
            },
            {
                "id": "submit_project",
                "title": "Submit your project",
                "description": "Submit your project on Devpost before the deadline. "
                "Any repository changes after submission won’t be judged, so make sure everything is ready first. "
                "Review the judging criteria in Resources if needed. "
                "**Only one team member needs to submit.**",
                "autoCheck": False,
            },
            {
                "id": "project_demo",
                "title": "Prepare a project demo",
                "description": "You'll need to demo your project during the judging period. You get to decide how you want to present it, but "
                "make sure it's under 5 minutes. Practice your demo to ensure it fits within the time limit and highlights your project's strengths.",
                "autoCheck": False,
            },
        ],
        "activities": [
            {
                "name": "lunch_day_1",
                "eligibleForRaffle": False,
            },
            {
                "name": "dinner_day_1",
                "eligibleForRaffle": False,
            },
            {
                "name": "breakfast_day_2",
                "eligibleForRaffle": False,
            },
            {
                "name": "lunch_day_2",
                "eligibleForRaffle": False,
            },
            {
                "name": "career_fair_friday",
                "eligibleForRaffle": True,
            },
        ],
    }

    doc_ref.set(default_config)
