import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='Ranjith @123',
    database='office_sync'
)
cursor = conn.cursor(dictionary=True)

with open('db_schema.txt', 'w') as f:
    try:
        cursor.execute('DESCRIBE rooms')
        f.write('Rooms:\n')
        for row in cursor.fetchall():
            f.write(str(row) + '\n')
    except Exception as e:
        f.write('Error DESCRIBE rooms: ' + str(e) + '\n')

    try:
        cursor.execute('DESCRIBE it_tickets')
        f.write('\nIT Tickets:\n')
        for row in cursor.fetchall():
            f.write(str(row) + '\n')
    except Exception as e:
        f.write('Error DESCRIBE it_tickets: ' + str(e) + '\n')

    try:
        cursor.execute('DESCRIBE bookings')
        f.write('\nBookings:\n')
        for row in cursor.fetchall():
            f.write(str(row) + '\n')
    except Exception as e:
        f.write('Error DESCRIBE bookings: ' + str(e) + '\n')

conn.close()
