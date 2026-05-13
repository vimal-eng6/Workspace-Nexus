import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling, Error

# Load env variables
load_dotenv()

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "0000", # Testing this password
    "database": "office_sync"
}

try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="test_pool",
        pool_size=1,
        **DB_CONFIG
    )
    print("Connection successful with password '0000'")
    conn = connection_pool.get_connection()
    conn.close()
except Error as e:
    print(f"Connection failed with password '0000': {e}")
