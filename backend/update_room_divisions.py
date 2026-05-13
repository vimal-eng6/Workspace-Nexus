from database import execute_query

def update_room_divisions():
    try:
        # Assign rooms to the new divisions
        execute_query("UPDATE rooms SET division = 'Software' WHERE id % 3 = 1", commit=True)
        execute_query("UPDATE rooms SET division = 'SDS' WHERE id % 3 = 2", commit=True)
        execute_query("UPDATE rooms SET division = 'Tekla' WHERE id % 3 = 0", commit=True)
        print("Success: Room divisions updated to Software, SDS, and Tekla.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_room_divisions()
