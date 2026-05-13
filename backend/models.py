from pydantic import BaseModel
from typing import List

class Room(BaseModel):
    id: int
    name: str
    location: str
    capacity: int

class RoomStatus(BaseModel):
    id: int
    name: str
    status: str

class Booking(BaseModel):
    start: str
    end: str
    division: str

class RoomSchedule(BaseModel):
    room: str
    bookings: List[Booking]

class BookingCreate(BaseModel):
    room_id: int
    start_time: str
    end_time: str
    division: str
    is_kt: int = 0

class ITTicketCreate(BaseModel):
    booking_id: int
    issue_type: str