from fastapi import APIRouter
from database import execute_query

router = APIRouter()

@router.get("/rooms")
def get_rooms():
    rooms = execute_query("SELECT * FROM rooms", fetch=True)
    print(f"DEBUG: Fetched {len(rooms) if rooms else 0} rooms from database")
    return rooms
 