from fastapi import APIRouter
from database import execute_query

router = APIRouter()

@router.get("/health")
def health_check():
    try:
        # Check database connection
        rooms_count = execute_query("SELECT COUNT(*) as count FROM rooms", fetch=True)
        return {
            "status": "healthy",
            "database": "connected",
            "rooms_in_db": rooms_count[0]['count'] if rooms_count else 0
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
