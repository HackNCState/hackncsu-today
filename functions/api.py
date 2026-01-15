import json
from firebase_functions import https_fn
from firebase_functions.params import SecretParam, StringParam
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import ArrayUnion

ORGANIZER_API_TOKEN = SecretParam(
    name="ORGANIZER_API_TOKEN",
    description="API token for organizer access",
)

EVENTS_LIST = StringParam(
    name="EVENTS_LIST",
    description="Comma-separated list of event IDs mapped to event names (e.g. '1:breakfast,2:dinner')",
)


@https_fn.on_request(secrets=[ORGANIZER_API_TOKEN])
def participant(request: https_fn.Request) -> https_fn.Response:
    """Returns participant data for the given UUID /participant/{uuid} endpoint."""

    if (
        not request.authorization
        or request.authorization.token != ORGANIZER_API_TOKEN.value
    ):
        return https_fn.Response("Unauthorized", status=401)

    path_segments = request.path.split("/")
    if len(path_segments) < 2 or not path_segments[1]:
        print(path_segments)
        return https_fn.Response("Bad Request: Missing UUID", status=400)

    participant_uuid = path_segments[1]

    db = firestore.client()
    users_ref = db.collection("users")

    query = users_ref.where(
        filter=FieldFilter("rfidUUID", "==", participant_uuid)
    ).limit(1)
    results = query.stream()

    user_data = None
    for doc in results:
        user_data = doc.to_dict()
        break

    if user_data:
        return https_fn.Response(
            json.dumps(user_data),
            status=200,
            headers={"Content-Type": "application/json"},
        )

    return https_fn.Response("User not found", status=404)


@https_fn.on_request(secrets=[ORGANIZER_API_TOKEN])
def set_user_attended(request: https_fn.Request) -> https_fn.Response:
    """Sets a user as attended for a specific eventId passed in body."""
    if request.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405)

    if (
        not request.authorization
        or request.authorization.token != ORGANIZER_API_TOKEN.value
    ):
        return https_fn.Response("Unauthorized", status=401)

    path_segments = request.path.split("/")
    if len(path_segments) < 2 or not path_segments[1]:
        return https_fn.Response("Bad Request: Missing UUID", status=400)

    participant_uuid = path_segments[1]

    try:
        data = request.get_json()
        event_id = data.get("eventId")
    except Exception:
        return https_fn.Response("Bad Request: Invalid JSON", status=400)

    if event_id is None:
        return https_fn.Response("Bad Request: Missing eventId", status=400)

    # Parse EVENTS_LIST
    raw_list = EVENTS_LIST.value
    events_map = {}
    if raw_list:
        for pair in raw_list.split(","):
            parts = pair.split(":")
            if len(parts) == 2:
                events_map[parts[0].strip()] = parts[1].strip()

    event_name = events_map.get(str(event_id))
    if not event_name:
        return https_fn.Response("Event not found", status=404)

    db = firestore.client()
    users_ref = db.collection("users")

    query = users_ref.where(
        filter=FieldFilter("rfidUUID", "==", participant_uuid)
    ).limit(1)
    results = list(query.stream())

    if not results:
        return https_fn.Response("User not found", status=404)

    user_doc = results[0]
    user_data = user_doc.to_dict()
    attended_events = user_data.get("attendedEvents", [])

    if event_name in attended_events:
        return https_fn.Response("User already attended event", status=420)

    user_doc.reference.update({"attendedEvents": ArrayUnion([event_name])})

    return https_fn.Response("OK", status=200)
