from firebase_functions import https_fn
from firebase_admin import firestore

from .models import Team


@https_fn.on_call()
def submit_team_registration(request: https_fn.CallableRequest) -> None:
    """Submits a new team registration."""

    creator_id = request.auth.uid if request.auth else ""

    if not creator_id:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="Authentication is required to register a team.",
        )

    name = request.data.get("name", "").strip()

    if not name:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Team name is required.",
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
    if not isinstance(challenges, list) or len(challenges) > 1:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Only one challenge may be selected.",
        )

    challenges = [str(c).strip() for c in challenges if str(c).strip()]

    # check if members are not already in a team (check their teamId field)

    db = firestore.client()

    users_ref = db.collection("users")

    for member_id in member_ids:
        user_doc = users_ref.document(member_id).get()

        if user_doc.exists:
            user_data = user_doc.to_dict()

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

    creator_ref = users_ref.document(creator_id)
    creator_ref.update({"teamId": team_doc_ref.id})
