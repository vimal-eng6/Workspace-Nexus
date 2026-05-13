from fastapi import APIRouter
from database import get_db_connection

router = APIRouter()

@router.get("/schedule")
def room_schedule():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT room_id, start_time, end_time, division FROM bookings")
    bookings = cursor.fetchall()
    # Group by room
    room_dict = {}
    for b in bookings:
        room_id, start, end, division = b
        if room_id not in room_dict:
            room_dict[room_id] = []
        room_dict[room_id].append({"start": str(start), "end": str(end), "division": division})
    # Format response
    cursor.execute("SELECT id, name FROM rooms")
    rooms = cursor.fetchall()
    result = []
    for r in rooms:
        result.append({"room": r[1], "bookings": room_dict.get(r[0], [])})
    return result