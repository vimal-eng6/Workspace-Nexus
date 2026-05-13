import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# 1. Load the .env file
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def test_smtp_connection():
    print(f"--- 📧 SMTP DIAGNOSTICS ---")
    print(f"User: {SMTP_USER}")
    # Hide password for security in logs
    if SMTP_PASSWORD:
        print(f"Password: SET (Length: {len(SMTP_PASSWORD)})")
    else:
        print(f"Password: NOT SET")

    if not SMTP_USER or not SMTP_PASSWORD or "YOUR" in SMTP_PASSWORD:
        print("\n❌ ERROR: Email credentials are not set in .env file!")
        return

    subject = "Office Sync - Connection Test"
    body = "This is a diagnostic test from the Office Sync backend. If you see this, your SMTP settings are CORRECT! ✅"
    
    try:
        print("\nConnecting to server...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.set_debuglevel(1)  # 👈 This will show the real error from Google
        
        print("Starting TLS...")
        server.starttls()
        
        print(f"Logging in as {SMTP_USER}...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        print("Sending message...")
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = SMTP_USER # Send to self
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server.send_message(msg)
        server.quit()
        print("\n✅ SUCCESS! email sent to yourself.")
        
    except Exception as e:
        print(f"\n❌ FAILED to send email.")
        print(f"Error details: {str(e)}")
        if "Authentication failed" in str(e) or "Username and Password not accepted" in str(e):
            print("\n💡 TIP: Your Gmail password was rejected. Did you use an 'App Password' instead of your regular login password?")

if __name__ == "__main__":
    test_smtp_connection()
