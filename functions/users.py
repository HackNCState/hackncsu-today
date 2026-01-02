from firebase_functions import https_fn
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter


@https_fn.on_call()
def search_users(req: https_fn.CallableRequest) -> dict:
    """
    Search for users by username (Discord name).
    Returns a list of users with minimal info (id, username).
    """
    query_text = req.data.get("query", "").strip()

    if not query_text or len(query_text) < 2:
        return {"users": []}

    db = firestore.client()
    users_ref = db.collection("users")

    # Perform a "starts with" query
    # Note: This is case-sensitive. For case-insensitive, we'd need a separate lowercase field.
    # Assuming discord usernames are handled or we just search exactly as typed for now.
    query = (
        users_ref.where(filter=FieldFilter("username", ">=", query_text))
        .where(filter=FieldFilter("username", "<=", query_text + "\uf8ff"))
        .limit(10)
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
                # Add avatar if available in the future
            }
        )

    return {"users": users}
