import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling, Error

# Load env variables
load_dotenv()

# DB Config
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "office_sync")
}

# Create Connection Pool
connection_pool = None
try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="office_sync_pool",
        pool_size=10,
        **DB_CONFIG
    )
except Error as e:
    print(f"Error creating connection pool: {e}")

def get_db_connection():
    try:
        return connection_pool.get_connection()
    except Error as e:
        print(f"Error getting connection from pool: {e}")
        return None

# Helper for executing queries safely
def execute_query(query, params=None, fetch=False, commit=False):
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        result = None
        if fetch:
            result = cursor.fetchall()
        
        if commit:
            conn.commit()
            
        cursor.close()
        return result
    except Error as e:
        print(f"Database error: {e}")
        return None
    finally:
        conn.close()