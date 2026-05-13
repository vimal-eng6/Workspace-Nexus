import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='Ranjith @123',
    database='office_sync'
)
cursor = conn.cursor()

try:
    cursor.execute('''
    ALTER TABLE bookings
    ADD COLUMN division VARCHAR(50),
    ADD COLUMN is_kt BOOLEAN DEFAULT FALSE,
    ADD COLUMN kt_topic VARCHAR(255),
    ADD COLUMN kt_notes TEXT;
    ''')
    conn.commit()
    print("Columns added successfully")
except Exception as e:
    print("Error:", e)

conn.close()
