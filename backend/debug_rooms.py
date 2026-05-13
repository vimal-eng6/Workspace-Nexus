import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "office_sync")
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT COUNT(*) as count FROM rooms")
    room_count = cursor.fetchone()['count']
    print(f"Total Rooms: {room_count}")
    
    cursor.execute("SELECT * FROM rooms")
    rooms = cursor.fetchall()
    for room in rooms:
        print(room)
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
