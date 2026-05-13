import mysql.connector

try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="0000",
        database="office_sync"
    )
    cursor = db.cursor()
    cursor.execute("DESCRIBE bookings")
    for row in cursor.fetchall():
        print(row)
except Exception as e:
    print(e)
