from fastapi import APIRouter, HTTPException
from database import get_db_connection
from socket_manager import sio
from email_utils import send_booking_email

router = APIRouter()

# Book Room (Collision-Proof)
@router.post("/book")
async def book_room(data: dict):
    # Log incoming data for debugging
    print(f"DEBUG: Booking request received: {data}")
    
    try:
        room_id = int(data.get("room_id"))
        username = data.get("username")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        division = data.get("division")
        is_kt = 1 if data.get("is_kt") else 0
        kt_topic = data.get("kt_topic")
        kt_notes = data.get("kt_notes")
        cc_emails = data.get("cc_emails", "")
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid data format: {str(e)}")

    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor(dictionary=True)
        # Ensure autocommit is OFF for transaction
        conn.autocommit = False
        
        # Start transaction
        conn.start_transaction()

        # Step 1: Lock the ROOM record to prevent concurrent booking attempts for this specific room
        cursor.execute("SELECT id, name FROM rooms WHERE id = %s FOR UPDATE", (room_id,))
        room = cursor.fetchone()
        
        if not room:
            conn.rollback()
            raise HTTPException(status_code=404, detail=f"Room ID {room_id} not found")

        # Step 2: Check for ANY overlapping bookings
        cursor.execute("""
            SELECT id FROM bookings
            WHERE room_id = %s
            AND NOT (end_time <= %s OR start_time >= %s)
        """, (room_id, start_time, end_time))

        conflict = cursor.fetchone()
        if conflict:
            print(f"DEBUG: Conflict found with booking ID {conflict['id']}")
            conn.rollback()
            raise HTTPException(status_code=400, detail="Room already booked for this time slot")

        # Step 3: Insert the new booking
        cursor.execute("""
            INSERT INTO bookings (room_id, username, start_time, end_time, division, is_kt, kt_topic, kt_notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (room_id, username, start_time, end_time, division, is_kt, kt_topic, kt_notes))

        # Step 4: Get User Email for notification (Case-Insensitive)
        cursor.execute("SELECT email FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        user_row = cursor.fetchone()
        user_email = user_row["email"] if user_row else None

        conn.commit()
        print(f"DEBUG: Booking successful for {username} in room {room['name']}")

        # Step 5: Send Email Notification to User and IT Admins
        if user_email:
            send_booking_email(user_email, username, room['name'], start_time, end_time, room.get('amenities', 'WiFi, Projector'))

        # NEW: Notify all IT Admins
        cursor.execute("SELECT email FROM users WHERE role = 'admin'")
        admin_rows = cursor.fetchall()
        for admin in admin_rows:
            if admin['email'] and admin['email'] != user_email: # Don't send twice if admin booked it
                send_booking_email(admin['email'], f"New Booking Alert (User: {username})", room['name'], start_time, end_time, room.get('amenities', 'WiFi, Projector'))

        if cc_emails:
            cc_list = [e.strip() for e in cc_emails.split(',') if e.strip()]
            for cc in cc_list:
                # CC emails directly
                send_booking_email(cc, f"Team member ({username})", room['name'], start_time, end_time, room.get('amenities', 'WiFi, Projector'))

        # Emit the real-time refresh signal
        await sio.emit("refresh_bookings", {"message": "New booking added"})

        return {"message": "Booking successful"}
    
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"DEBUG: Booking Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()



# My Bookings (Enhanced with Room Names)
@router.get("/my-bookings/{username}")
def my_bookings(username: str):
    from database import execute_query
    return execute_query("""
        SELECT b.*, r.name as room_name 
        FROM bookings b 
        JOIN rooms r ON b.room_id = r.id 
        WHERE b.username=%s
        ORDER BY b.start_time DESC
    """, (username,), fetch=True)


# Delete Booking
@router.delete("/delete-booking/{booking_id}")
async def delete_booking(booking_id: int):
    from database import execute_query
    execute_query("DELETE FROM bookings WHERE id=%s", (booking_id,), commit=True)
    
    # Emit the real-time refresh signal
    await sio.emit("refresh_bookings", {"message": "Booking deleted"})
    
    return {"message": "Booking deleted"}


# Admin - All Bookings (Enhanced with User Roles)
@router.get("/all-bookings")
def all_bookings():
    from database import execute_query
    return execute_query("""
        SELECT b.*, u.role 
        FROM bookings b 
        LEFT JOIN users u ON LOWER(b.username) = LOWER(u.username)
    """, fetch=True)


# Private KT Library - Get all KT sessions for a specific division
@router.get("/kt-library/{division}")
def get_kt_library(division: str):
    from database import execute_query
    return execute_query("""
        SELECT b.id, b.room_id, b.username, b.start_time, b.end_time, b.division, b.kt_topic, b.kt_notes, r.name as room_name
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.is_kt = 1 AND b.division = %s
        ORDER BY b.start_time DESC
    """, (division,), fetch=True)
