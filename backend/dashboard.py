from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def dashboard_home():
    return {"message": "Dashboard endpoint"}