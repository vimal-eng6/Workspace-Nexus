# test_it_ticket.py
import requests

ticket_data = {
    "booking_id": 1,
    "issue_type": "Projector Setup",
    "status": "Open"
}

response = requests.post("http://127.0.0.1:8000/tickets/create", json=ticket_data)
print("Create Ticket Response:")
print(response.json())

response = requests.get("http://127.0.0.1:8000/tickets/")
print("\nAll Tickets:")
print(response.json())