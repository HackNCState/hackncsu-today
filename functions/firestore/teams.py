from firebase_functions import https_fn
from firebase_admin import firestore

from .models import Team


@https_fn.on_call()
def get_team_member_profiles(request: https_fn.CallableRequest) -> list[dict]:
    """Returns limited profile data for members of the caller's team."""

    if not request.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="Authentication is required.",
        )

    caller_id = request.auth.uid
    team_id = request.data.get("teamId", "")

    if not team_id:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Team ID is required.",
        )

    db = firestore.client()
    team_doc = db.collection("teams").document(team_id).get()

    if not team_doc.exists:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.NOT_FOUND,
            message="Team not found.",
        )

    team_data = team_doc.to_dict()
    member_ids = team_data.get("memberIds", [])

    if caller_id not in member_ids:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.PERMISSION_DENIED,
            message="You are not a member of this team.",
        )

    profiles = []
    for member_id in member_ids:
        user_doc = db.collection("users").document(member_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            profiles.append(
                {
                    "id": user_data.get("id", member_id),
                    "username": user_data.get("username", ""),
                    "firstName": user_data.get("firstName", ""),
                    "lastName": user_data.get("lastName", ""),
                    "role": user_data.get("role", "participant"),
                }
            )

    return profiles


@https_fn.on_call()
def submit_team_registration(request: https_fn.CallableRequest) -> None:
    """Submits a new team registration."""

    creator_id = request.auth.uid if request.auth else ""

    if not creator_id:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="Authentication is required to register a team.",
        )

    db = firestore.client()

    name = request.data.get("name", "").strip()

    if not name:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Team name is required.",
        )

    # Check if team registration is enabled
    event_config_ref = db.collection("event").document("main").get()
    event_config_data = event_config_ref.to_dict() if event_config_ref.exists else {}
    if not event_config_data.get("teamRegistrationEnabled", False):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.PERMISSION_DENIED,
            message="Team registration is currently closed.",
        )

    member_ids = request.data.get("members", [])

    if not isinstance(member_ids, list) or len(member_ids) < 2 or len(member_ids) > 4:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Team must have between 2 and 4 members.",
        )

    track = request.data.get("track", "").strip()

    if not track:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Track selection is required.",
        )

    challenges = request.data.get("challenges", [])
    if not isinstance(challenges, list):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Challenges must be a list.",
        )

    challenges = [str(c).strip() for c in challenges if str(c).strip()]

    # Validate challenge selections against event config categories

    event_config_doc = db.collection("event").document("main").get()
    event_config = event_config_doc.to_dict() if event_config_doc.exists else {}
    configured_challenges = event_config.get("challenges", [])
    configured_tracks = event_config.get("tracks", [])

    # Build a lookup of challenge name -> category
    challenge_category_map = {}
    for cc in configured_challenges:
        challenge_category_map[cc.get("name", "")] = cc.get("category", "default")

    # Validate all submitted challenges exist in config
    for c in challenges:
        if c not in challenge_category_map:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message=f"Unknown challenge: {c}",
            )

    # Validate at most 1 default-category challenge
    default_count = sum(
        1 for c in challenges if challenge_category_map.get(c, "default") == "default"
    )
    if default_count > 1:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Only one default challenge may be selected.",
        )

    # check if members are not already in a team (check their teamId field)

    users_ref = db.collection("users")
    member_docs = {}

    for member_id in member_ids:
        user_doc = users_ref.document(member_id).get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            member_docs[member_id] = user_data

            if user_data and user_data.get("teamId"):
                raise https_fn.HttpsError(
                    code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                    message=f"One of the provided users is already in a team.",
                )
        else:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.NOT_FOUND,
                message=f"User {member_id} not found.",
            )

    # Validate track university restrictions
    selected_track_config = next(
        (t for t in configured_tracks if t.get("name") == track), None
    )
    if selected_track_config:
        allowed_universities = selected_track_config.get("allowedUniversities", [])
        if allowed_universities:
            for member_id in member_ids:
                member_data = member_docs.get(member_id, {})
                member_university = (member_data.get("university") or "").strip()
                if member_university not in allowed_universities:
                    raise https_fn.HttpsError(
                        code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                        message=(
                            f"Your selected track is restricted to certain universities, "
                            f"and one or more of your team members are not from an eligible university. "
                            f"If you believe this is a mistake, please open a support ticket on the Discord."
                        ),
                    )

    teams_ref = db.collection("teams")
    team_doc_ref = teams_ref.document()

    team = Team(
        id=team_doc_ref.id,
        name=name,
        memberIds=member_ids,
        track=track,
        challenges=challenges,
        creatorId=creator_id,
        mentoringHelp=request.data.get("mentoringHelp", "").strip(),
        status="unverified",
    )

    team_doc_ref.set(team.__dict__)

    # Update creator's user document to include teamId
    # (the other members will be updated when the team is approved)

    # auto check "create_team" checklist item for creator

    creator_ref = users_ref.document(creator_id)
    creator_snapshot = creator_ref.get()
    creator_data = creator_snapshot.to_dict() if creator_snapshot.exists else None

    checklist_statuses = (
        creator_data.get("checklistItemStatuses", []) if creator_data else []
    )
    checklist_statuses = [
        status for status in checklist_statuses if status.get("id") != "create_team"
    ]
    checklist_statuses.append({"id": "create_team", "completed": True})

    creator_ref.update(
        {
            "teamId": team_doc_ref.id,
            "checklistItemStatuses": checklist_statuses,
        }
    )
