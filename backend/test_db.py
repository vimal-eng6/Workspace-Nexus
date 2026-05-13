from database import get_db_connection

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rooms")
    rooms = cursor.fetchall()
    print(rooms)
    conn.close()
except Exception as e:
    print("DB ERROR:", e)