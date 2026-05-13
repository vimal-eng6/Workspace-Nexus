from fastapi import APIRouter
from database import get_db
from datetime import datetime

router = APIRouter()

@router.get("/room/status")
def room_status():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    now = datetime.now()

    query = """
    SELECT r.id, r.name,
    CASE 
        WHEN b.room_id IS NOT NULL THEN 'Occupied'
        ELSE 'Available'
    END AS status
    FROM rooms r
    LEFT JOIN bookings b
        ON r.id = b.room_id
        AND %s BETWEEN b.start_time AND b.end_time
    """

    cursor.execute(query, (now,))
    result = cursor.fetchall()

    return result