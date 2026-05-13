import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import get_db_connection, execute_query
import socketio
from socket_manager import sio
from auth import router as auth_router
from booking import router as booking_router
from it_tickets import router as tickets_router
from reports import router as reports_router
from rooms import router as rooms_router
from health import router as health_router
from notifications import router as notifications_router
from announcements import router as announcements_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes - Priority defined by inclusion order
app.include_router(auth_router)
app.include_router(booking_router)
app.include_router(tickets_router)
app.include_router(reports_router)
app.include_router(rooms_router)
app.include_router(health_router)
app.include_router(notifications_router)
app.include_router(announcements_router)

# Define the directory for the React build folder (Unified SPA mode)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Priority: .env value, then default to ../frontend/dist
default_frontend = os.path.join(BASE_DIR, "..", "frontend", "dist")
FRONTEND_PATH = os.getenv("FRONTEND_PATH", default_frontend)
# Resolve relative path if provided in .env
if not os.path.isabs(FRONTEND_PATH):
    FRONTEND_PATH = os.path.abspath(os.path.join(BASE_DIR, FRONTEND_PATH))


# Mount static files (JS, CSS, etc.)
if os.path.exists(FRONTEND_PATH):
    app.mount("/assets", StaticFiles(directory=f"{FRONTEND_PATH}/assets"), name="static")

@app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def serve_frontend(full_path: str):
    # This serves the React index.html for any route that is not an API
    # so that client-side routing works on refresh
    index_file = os.path.join(FRONTEND_PATH, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Office Sync API Running", "note": "Frontend files not found in dist folder."}

# Wrap the FastAPI app with the Socket.io ASGI app
app = socketio.ASGIApp(sio, other_asgi_app=app)