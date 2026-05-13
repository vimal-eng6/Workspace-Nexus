from database import execute_query

def remove_specific_rooms():
    room_names = [
        "Madras Boardroom",
        "Hosur Tech Hub",
        "Marina Meeting Room",
        "Industrial Plaza"
    ]
    
    try:
        for name in room_names:
            # Get the room ID first
            room = execute_query("SELECT id FROM rooms WHERE name = %s", (name,), fetch=True)
            if room:
                room_id = room[0]['id']
                # 1. Delete all bookings for this room first
                execute_query("DELETE FROM bookings WHERE room_id = %s", (room_id,), commit=True)
                # 2. Delete the room
                execute_query("DELETE FROM rooms WHERE id = %s", (room_id,), commit=True)
                print(f"Successfully removed: {name}")
            else:
                print(f"Room not found: {name}")
                
        print("\nCleanup complete.")
    except Exception as e:
        print(f"Error during removal: {e}")

if __name__ == "__main__":
    remove_specific_rooms()
