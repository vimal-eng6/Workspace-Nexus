import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv('./backend/.env')

try:
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = conn.cursor(dictionary=True)
    
    print("--- User Tables Check ---")
    cursor.execute("DESCRIBE users")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Testing Profile Update (Simulation) ---")
    username = "ranjith"
    email = "test@example.com"
    division = "Software"
    
    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if user:
        print(f"User {username} exists. Updating profile...")
        cursor.execute(
            "UPDATE users SET email = %s, division = %s WHERE username = %s",
            (email, division, username)
        )
        conn.commit()
        print("Success!")
    else:
        print(f"User {username} NOT found. Please register first.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
