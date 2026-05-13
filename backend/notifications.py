from fastapi import APIRouter, HTTPException
from database import execute_query

router = APIRouter()

# Get all notifications for a user
@router.get("/notifications/{username}")
def get_notifications(username: str):
    return execute_query(
        "SELECT * FROM notifications WHERE username = %s ORDER BY created_at DESC",
        (username,),
        fetch=True
    )

# Mark notification read (Bulletproof)
@router.api_route("/notifications/read/{notification_id}", methods=["GET", "POST", "PUT", "DELETE"])
@router.api_route("/notifications/read/{notification_id}/", methods=["GET", "POST", "PUT", "DELETE"])
def mark_as_read(notification_id: int):
    execute_query(
        "UPDATE notifications SET is_read = TRUE WHERE id = %s",
        (notification_id,),
        commit=True
    )
    return {"message": "Notification updated"}

# Get unread count
@router.get("/notifications/unread-count/{username}")
def get_unread_count(username: str):
    res = execute_query(
        "SELECT COUNT(*) as count FROM notifications WHERE username = %s AND is_read = FALSE",
        (username,),
        fetch=True
    )
    return res[0] if res else {"count": 0}
