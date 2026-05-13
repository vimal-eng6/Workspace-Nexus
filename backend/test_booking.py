# test_booking.py
import requests

booking_data = {
    "room_id": 1,
    "start_time": "2026-03-23T10:00",
    "end_time": "2026-03-23T11:00",
    "division": "Steel",
    "is_kt": True
}

response = requests.post("http://127.0.0.1:8000/bookings/create", json=booking_data)
print("Create Booking Response:")
print(response.json())

response = requests.get("http://127.0.0.1:8000/bookings/")
print("\nAll Bookings:")
print(response.json())