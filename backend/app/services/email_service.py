import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

# Initialize SES client
def get_ses_client():
    if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SENDER_EMAIL]):
        print("WARNING: AWS credentials or SENDER_EMAIL missing in .env")
        return None
        
    return boto3.client(
        'ses',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )

def send_alert_email(to_email: str, subject: str, message: str) -> bool:
    """
    Sends an email alert using AWS SES.
    """
    client = get_ses_client()
    if not client:
        return False
        
    html_body = f"""
    <html>
    <head></head>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0f172a; margin: 0;">AquaGuard Alert</h2>
            </div>
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px;">{message}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px;">
                This is an automated message from the NSUT AquaGuard Command Center.<br>
                Please do not reply directly to this email.
            </p>
        </div>
    </body>
    </html>
    """

    try:
        response = client.send_email(
            Destination={
                'ToAddresses': [to_email],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': "UTF-8",
                        'Data': html_body,
                    },
                    'Text': {
                        'Charset': "UTF-8",
                        'Data': message,
                    },
                },
                'Subject': {
                    'Charset': "UTF-8",
                    'Data': subject,
                },
            },
            Source=SENDER_EMAIL,
        )
        print(f"Email successfully sent to {to_email}! Message ID: {response['MessageId']}")
        return True
    except ClientError as e:
        print(f"Failed to send email: {e.response['Error']['Message']}")
        return False

def broadcast_severity_alert(db, tank_code: str, severity: str, title: str, message: str):
    """Send an automated alert email to all registered users (Students)."""
    try:
        from app.models.user import User
        users = db.query(User).filter(User.email.isnot(None), User.role == 'student').all()
        for u in users:
            try:
                send_alert_email(
                    to_email=u.email,
                    subject=f"AquaGuard High Severity Alert: {title}",
                    message=f"System has detected a high severity water quality event.\\n\\nSeverity: {severity}\\nTank: {tank_code}\\n\\nDetails:\\n{message}"
                )
            except Exception as e:
                print(f"Failed to dispatch alert email to {u.email}: {e}")
    except Exception as e:
        print(f"Error broadcasting severity alert: {e}")
