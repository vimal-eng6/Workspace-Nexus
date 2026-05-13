from fastapi import APIRouter, HTTPException
from database import get_db_connection, execute_query

router = APIRouter()

# REGISTER API
@router.post("/register")
def register(data: dict):
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    division = data.get("division", "General")
    role = data.get("role", "user")
    
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        print(f"DEBUG: Registering user {username} ({email}) with role {role}")
        cursor.execute(
            "INSERT INTO users (username, email, password, division, role) VALUES (%s, %s, %s, %s, %s)",
            (username, email, password, division, role)
        )
        conn.commit()
        return {"message": "Registration successful"}
    except Exception as e:
        conn.rollback()
        print(f"DEBUG: Registration Error: {e}")
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")
    finally:
        conn.close()

# LOGIN API
@router.post("/login")
def login(data: dict):
    username = data.get("username")
    password = data.get("password")

    user = execute_query(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (username, password),
        fetch=True
    )

    if user and len(user) > 0:
        found_user = user[0]
        print(f"DEBUG: Login successful for {username}")
        return {
            "message": "Login successful", 
            "division": found_user.get("division"), 
            "username": found_user.get("username"),
            "role": found_user.get("role")
        }
    else:
        print(f"DEBUG: Login failed for {username}")
        # Return 401 instead of 200 with error message to be more standard
        raise HTTPException(status_code=401, detail="Invalid username or password")

from email_utils import send_booking_email

# TEST EMAIL
@router.post("/test-email")
def test_email(data: dict):
    username = data.get("username")
    email = data.get("email")
    try:
        send_booking_email(email, username, "Test Room", "Now", "Soon", "WiFi, Coffee")
        return {"message": "Test email sent! Check your inbox."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GET USER PROFILE
@router.get("/user/profile/{username}")
def get_profile(username: str):
    user = execute_query("SELECT id, username, email, division, role FROM users WHERE username=%s", (username,), fetch=True)
    if user and len(user) > 0:
        return user[0]
    raise HTTPException(status_code=404, detail="User not found")

# UPDATE PROFILE (Bulletproof: handles various methods and slashes)
@router.api_route("/update-profile", methods=["GET", "POST", "PUT", "DELETE"])
@router.api_route("/update-profile/", methods=["GET", "POST", "PUT", "DELETE"])
def update_profile(data: dict = None):
    if not data:
        # If it's a GET or query-based request, we might find data there or error out gracefully
        raise HTTPException(status_code=400, detail="Profile update requires a JSON body. Use POST or PUT.")
    
    username = data.get("username")
    email = data.get("email")
    division = data.get("division")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET email = %s, division = %s WHERE username = %s",
            (email, division, username)
        )
        conn.commit()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# GET ALL USERS (Directory)
@router.get("/users")
def get_all_users():
    users = execute_query("SELECT id, username, email, division, role FROM users ORDER BY username ASC", fetch=True)
    return users or []
