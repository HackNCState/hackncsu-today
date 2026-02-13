from firebase_functions import https_fn
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter


@https_fn.on_call()
def search_users(request: https_fn.CallableRequest) -> list[dict]:
    """Searches for users by username (Discord name)."""

    query_text = request.data.get("query", "").strip()

    if not query_text or len(query_text) < 2:
        return []

    db = firestore.client()
    users_ref = db.collection("users")

    query = (
        users_ref.where(filter=FieldFilter("usernameLower", ">=", query_text.lower()))
        .where(filter=FieldFilter("usernameLower", "<=", query_text.lower() + "\uf8ff"))
        .limit(5)
    )

    results = query.stream()

    users = []
    for doc in results:
        data = doc.to_dict()
        # Only return necessary public info
        users.append(
            {
                "id": doc.id,
                "username": data.get("username", "Unknown"),
            }
        )

    return users
