from fastapi import APIRouter, HTTPException
from database import execute_query

router = APIRouter()

# Create IT Ticket
@router.post("/it-ticket")
def create_ticket(data: dict):
    booking_id = data.get("booking_id")
    issue_type = data.get("issue_type")
    description = data.get("description", "")

    execute_query("""
        INSERT INTO it_tickets (booking_id, issue_type, description, status)
        VALUES (%s, %s, %s, 'Open')
    """, (booking_id, issue_type, description), commit=True)

    return {"message": "Ticket created"}


# View My Tickets
@router.get("/my-tickets/{username}")
def my_tickets(username: str):
    return execute_query("""
        SELECT t.id, t.booking_id, t.issue_type, t.description, t.status, 
               b.start_time, b.end_time, r.name as room_name
        FROM it_tickets t
        LEFT JOIN bookings b ON t.booking_id = b.id
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.username = %s OR b.username IS NULL
    """, (username,), fetch=True)


# Admin - All Tickets (with Room and Time Info)
@router.get("/all-tickets")
def all_tickets():
    return execute_query("""
        SELECT t.id, t.booking_id, t.issue_type, t.description, t.status, t.admin_comment,
               b.start_time, b.end_time, r.name as room_name, b.username as booked_by
        FROM it_tickets t
        LEFT JOIN bookings b ON t.booking_id = b.id
        LEFT JOIN rooms r ON b.room_id = r.id
        ORDER BY FIELD(t.status, 'Open', 'In Progress', 'Resolved', 'Unresolvable', 'Closed') ASC, b.start_time ASC
    """, fetch=True)


from security import require_admin

# Update Ticket Status and Add Comment
@router.post("/update-ticket/{ticket_id}")
@router.post("/update-ticket/{ticket_id}/")
def update_ticket(ticket_id: int, data: dict):
    username = data.get("username")
    status = data.get("status")
    admin_comment = data.get("admin_comment")

    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    # 🛡️ Professional RBAC Check
    require_admin(username)

    execute_query("""
        UPDATE it_tickets 
        SET status=%s, admin_comment=%s 
        WHERE id=%s
    """, (status, admin_comment, ticket_id), commit=True)

    return {"message": "Ticket updated successfully"}


# Send Message in Ticket (Real-time Support Chat)
@router.post("/tickets/{ticket_id}/messages")
async def send_ticket_message(ticket_id: int, data: dict):
    from socket_manager import sio
    sender = data.get("sender_username")
    message = data.get("message_text")
    
    if not sender or not message:
        raise HTTPException(status_code=400, detail="Missing sender or message")

    execute_query("""
        INSERT INTO ticket_messages (ticket_id, sender_username, message_text)
        VALUES (%s, %s, %s)
    """, (ticket_id, sender, message), commit=True)

    # Broadcast to all clients in real-time
    await sio.emit("new_ticket_message", {
        "ticket_id": ticket_id,
        "sender_username": sender,
        "message_text": message,
        "created_at": "Just now" # UI will update correctly on refresh
    })

    return {"message": "Message sent"}


# Get Ticket Messages History
@router.get("/tickets/{ticket_id}/messages")
def get_ticket_messages(ticket_id: int):
    return execute_query("""
        SELECT * FROM ticket_messages WHERE ticket_id = %s ORDER BY created_at ASC
    """, (ticket_id,), fetch=True)


# Edit Ticket Message
@router.put("/tickets/messages/{message_id}")
async def update_ticket_message(message_id: int, data: dict):
    from socket_manager import sio
    new_text = data.get("message_text")
    
    if not new_text:
        raise HTTPException(status_code=400, detail="Message text is required")

    execute_query("""
        UPDATE ticket_messages SET message_text = %s WHERE id = %s
    """, (new_text, message_id), commit=True)

    # Broadcast update
    await sio.emit("message_updated", {
        "id": message_id,
        "message_text": new_text
    })

    return {"message": "Message updated"}


# Delete Ticket Message
@router.delete("/tickets/messages/{message_id}")
async def delete_ticket_message(message_id: int):
    from socket_manager import sio
    
    execute_query("DELETE FROM ticket_messages WHERE id = %s", (message_id,), commit=True)

    # Broadcast deletion
    await sio.emit("message_deleted", {
        "id": message_id
    })

    return {"message": "Message deleted"}