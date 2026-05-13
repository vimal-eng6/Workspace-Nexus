from fastapi import APIRouter
from database import execute_query

router = APIRouter()

# Reports API
@router.get("/reports")
def get_reports():
    # Total bookings
    total_bookings = execute_query("SELECT COUNT(*) AS total_bookings FROM bookings", fetch=True)
    
    # Total IT tickets
    total_tickets = execute_query("SELECT COUNT(*) AS total_tickets FROM it_tickets", fetch=True)
    
    # Open tickets
    open_tickets = execute_query("SELECT COUNT(*) AS open_tickets FROM it_tickets WHERE status='Open'", fetch=True)
    
    # Closed tickets
    closed_tickets = execute_query("SELECT COUNT(*) AS closed_tickets FROM it_tickets WHERE status='Closed'", fetch=True)
    
    return {
        "total_bookings": total_bookings[0]["total_bookings"] if total_bookings else 0,
        "total_tickets": total_tickets[0]["total_tickets"] if total_tickets else 0,
        "open_tickets": open_tickets[0]["open_tickets"] if open_tickets else 0,
        "closed_tickets": closed_tickets[0]["closed_tickets"] if closed_tickets else 0
    }


# Room usage report
@router.get("/room-usage")
def room_usage():
    return execute_query("""
        SELECT room_id, COUNT(*) AS usage_count
        FROM bookings
        GROUP BY room_id
    """, fetch=True)