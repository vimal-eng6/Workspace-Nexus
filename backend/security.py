from fastapi import HTTPException, Header, Depends
from database import execute_query
from constants import ROLE_ADMIN

def get_current_user_role(username: str):
    """Verifies user exists and returns their role from the DB"""
    user = execute_query("SELECT role FROM users WHERE username = %s", (username,), fetch=True)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user[0].get('role', '').lower()

def require_admin(username: str):
    """Dependency to enforce Admin-only access"""
    role = get_current_user_role(username)
    if role != ROLE_ADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: This action requires IT Admin privileges."
        )
    return True
