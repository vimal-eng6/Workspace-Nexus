import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Configuration from .env
SMTP_SERVER = os.getenv("SMTP_HOST", "smtp.zoho.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "support@caldimengg.in")
SMTP_PASSWORD = os.getenv("SMTP_PASS", "mQMcfPvYcegd")
SMTP_SECURE = os.getenv("SMTP_SECURE", "true").lower() == "true"

from database import execute_query

def send_booking_email(to_email, username, room_name, start_time, end_time, amenities):
    subject = f"Booking Confirmation: {room_name}"
    body = f"""
    Hello {username},

    Your booking for {room_name} has been confirmed.

    Details:
    - Room: {room_name}
    - Amenities: {amenities}
    - Start Time: {start_time}
    - End Time: {end_time}

    Thank you for using Office Sync!
    """

    print(f"DEBUG: Saving notification for {username}...")
    
    # 1. Save to internal Notifications Table (Always works!)
    try:
        execute_query(
            "INSERT INTO notifications (username, subject, body) VALUES (%s, %s, %s)",
            (username, subject, body),
            commit=True
        )
    except Exception as e:
        print(f"DEBUG: Failed to save internal notification: {e}")

    # 2. Try to send real SMTP email
    try:
        msg = MIMEMultipart()
        msg['From'] = os.getenv("SMTP_FROM", SMTP_USER)
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"DEBUG: Email sent successfully to {to_email}!")
    except Exception as e:
        print(f"DEBUG: SMTP Error: {e}")
