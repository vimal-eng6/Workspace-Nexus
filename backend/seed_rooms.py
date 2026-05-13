import os
import mysql.connector
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# DB Config
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "office_sync")
}

def seed_rooms():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Rooms Data
        rooms = [
            ("Conference Room A", "Chennai", 12),
            ("Innovation Lab", "Chennai", 8),
            ("Board Room", "Bangalore", 15),
            ("Focus Room 1", "Bangalore", 4),
            ("Huddle Space", "Chennai", 6),
            ("Development Hub", "Bangalore", 20)
        ]

        print("--- Seeding Rooms ---")
        for name, location, capacity in rooms:
            # Check if exists
            cursor.execute("SELECT id FROM rooms WHERE name = %s AND location = %s", (name, location))
            if cursor.fetchone():
                print(f"Skipped: {name} ({location}) already exists.")
            else:
                cursor.execute(
                    "INSERT INTO rooms (name, location, capacity) VALUES (%s, %s, %s)",
                    (name, location, capacity)
                )
                print(f"Added: {name} ({location})")

        conn.commit()
        print("\n✅ Seed complete! Your Office Sync is now ready for use.")
        
    except Exception as e:
        print(f"❌ Error seeding rooms: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    seed_rooms()
