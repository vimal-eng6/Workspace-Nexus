import socketio

# Create a Socket.IO server
# async_mode='asgi' is needed for FastAPI/Uvicorn integration
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
