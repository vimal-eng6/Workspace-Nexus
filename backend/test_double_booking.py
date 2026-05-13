import requests
import concurrent.futures

url = "http://localhost:8000/book"
data = {
    "room_id": 1,
    "username": "tester",
    "start_time": "2026-05-01T10:00:00",
    "end_time": "2026-05-01T11:00:00",
    "division": "Software",
    "is_kt": False
}

def make_request(i):
    print(f"Request {i} sending...")
    try:
        response = requests.post(url, json=data)
        return response.json()
    except Exception as e:
        return {"message": f"Error: {e}"}

if __name__ == "__main__":
    print("--- DOUBLE BOOKING COLLISION TEST ---")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        # Send two requests at the exact same time
        results = list(executor.map(make_request, [1, 2]))

    print("\n--- RESULTS ---")
    for i, res in enumerate(results):
        print(f"Result {i+1}: {res.get('message', 'No message')}")
