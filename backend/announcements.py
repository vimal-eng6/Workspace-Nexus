from fastapi import APIRouter, HTTPException
from database import get_db_connection, execute_query
from datetime import datetime

router = APIRouter()

# Auto-create table when router is imported
conn = get_db_connection()
if conn:
    try:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                author VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
    except Exception as e:
        print(f"Error creating announcements table: {e}")
    finally:
        conn.close()

@router.get("/announcements")
def get_announcements():
    announcements = execute_query("SELECT * FROM announcements ORDER BY created_at DESC", fetch=True)
    return announcements or []

from security import require_admin

@router.post("/announcements")
def create_announcement(data: dict):
    title = data.get("title")
    content = data.get("content")
    author = data.get("author")
    
    if not all([title, content, author]):
         raise HTTPException(status_code=400, detail="Missing required fields")
    
    # 🛡️ Professional RBAC Check
    require_admin(author)
         
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO announcements (title, content, author, created_at) VALUES (%s, %s, %s, %s)",
            (title, content, author, datetime.now())
        )
        conn.commit()
        return {"message": "Announcement created"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
