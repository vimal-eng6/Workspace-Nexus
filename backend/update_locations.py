from database import execute_query

def update_locations():
    try:
        # Assign rooms to Hosur
        execute_query("UPDATE rooms SET location = 'Hosur' WHERE id % 2 = 1", commit=True)
        # Assign rooms to Chennai
        execute_query("UPDATE rooms SET location = 'Chennai' WHERE id % 2 = 0", commit=True)
        print("Success: Locations updated to Hosur and Chennai.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_locations()
