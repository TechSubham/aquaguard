import os
from html import escape
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from sqlalchemy import func

load_dotenv()

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")


def _theme_for_subject(subject: str, message: str) -> dict:
    content = f"{subject} {message}".upper()
    if "WELCOME" in content:
        return {
            "label": "Account Ready",
            "accent": "#0284C7",
            "accent_soft": "#E0F2FE",
            "hero": "Welcome to AquaGuard",
            "summary": "Your campus water safety portal is ready.",
        }
    if "RESOLVED" in content:
        return {
            "label": "Resolved",
            "accent": "#059669",
            "accent_soft": "#D1FAE5",
            "hero": "Your report is resolved",
            "summary": "Facilities has completed action on your water-quality report.",
        }
    if "CRITICAL" in content:
        return {
            "label": "Critical Alert",
            "accent": "#DC2626",
            "accent_soft": "#FEE2E2",
            "hero": "Critical water-quality alert",
            "summary": "AquaGuard detected a condition that needs immediate attention.",
        }
    if "WARNING" in content or "ANOMALY" in content:
        return {
            "label": "Sensor Advisory",
            "accent": "#D97706",
            "accent_soft": "#FEF3C7",
            "hero": "Sensor anomaly detected",
            "summary": "AquaGuard found unusual sensor behavior for a monitored tank.",
        }
    return {
        "label": "AquaGuard Alert",
        "accent": "#0284C7",
        "accent_soft": "#E0F2FE",
        "hero": "AquaGuard update",
        "summary": "There is a new update from the AquaGuard Command Center.",
    }


def _message_to_html(message: str) -> str:
    paragraphs = [part.strip() for part in message.split("\n\n") if part.strip()]
    if not paragraphs:
        return ""

    html_blocks = []
    for paragraph in paragraphs:
        lines = [line.strip() for line in paragraph.split("\n") if line.strip()]
        if len(lines) > 1 and all(":" in line for line in lines):
            items = []
            for line in lines:
                key, value = line.split(":", 1)
                items.append(
                    f"""
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 700; width: 110px;">{escape(key.strip())}</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700;">{escape(value.strip())}</td>
                    </tr>
                    """
                )
            html_blocks.append(
                f"""
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 4px 0 12px;">
                    {''.join(items)}
                </table>
                """
            )
        elif len(lines) > 1:
            heading = lines[0] if lines[0].endswith(":") else ""
            items = lines[1:] if heading else lines
            heading_html = (
                f'<p style="margin: 0 0 10px; color: #0f172a; font-size: 15px; font-weight: 800;">{escape(heading.rstrip(":"))}</p>'
                if heading
                else ""
            )
            html_blocks.append(
                f"""
                {heading_html}
                <ul style="margin: 0 0 14px; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.7;">
                    {''.join(f"<li>{escape(item)}</li>" for item in items)}
                </ul>
                """
            )
        else:
            html_blocks.append(
                f"""
                <p style="margin: 0 0 14px; color: #334155; font-size: 15px; line-height: 1.7;">
                    {escape(paragraph).replace(chr(10), "<br>")}
                </p>
                """
            )
    return "".join(html_blocks)

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

    theme = _theme_for_subject(subject, message)
    message_html = _message_to_html(message)
    safe_subject = escape(subject)
    safe_summary = escape(theme["summary"])

    html_body = f"""
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
            {safe_summary}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f1f5f9; padding: 28px 12px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; overflow: hidden; border-radius: 28px; background: #ffffff; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.10);">
                        <tr>
                            <td style="padding: 0; background: linear-gradient(135deg, #0f172a 0%, #0369a1 56%, #06b6d4 100%);">
                                <div style="padding: 28px 30px 30px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td>
                                                <div style="display: inline-block; width: 44px; height: 44px; border-radius: 14px; background: rgba(255,255,255,0.14); text-align: center; line-height: 44px; color: #7dd3fc; font-weight: 900; font-size: 14px;">AG</div>
                                                <div style="margin-top: 16px; color: #bae6fd; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;">AquaGuard NSUT</div>
                                                <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 28px; line-height: 1.2; font-weight: 900;">{escape(theme["hero"])}</h1>
                                                <p style="margin: 10px 0 0; color: #dbeafe; font-size: 14px; line-height: 1.6;">{safe_summary}</p>
                                            </td>
                                            <td align="right" valign="top" style="width: 150px;">
                                                <span style="display: inline-block; border-radius: 999px; background: rgba(255,255,255,0.16); color: #ffffff; padding: 8px 12px; font-size: 12px; font-weight: 800;">{escape(theme["label"])}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 28px 30px 8px;">
                                <div style="border-left: 5px solid {theme["accent"]}; background: {theme["accent_soft"]}; border-radius: 18px; padding: 18px 18px 4px;">
                                    {message_html}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 30px 30px;">
                                <div style="border: 1px solid #e2e8f0; border-radius: 18px; padding: 16px; background: #f8fafc;">
                                    <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">
                                        <strong style="color: #0f172a;">Subject:</strong> {safe_subject}
                                    </p>
                                    <p style="margin: 10px 0 0; color: #64748b; font-size: 12px; line-height: 1.6;">
                                        This is an automated message from the NSUT AquaGuard Command Center. Please do not reply directly to this email.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    text_body = f"""
    {theme["hero"]}

    {theme["summary"]}

    {subject}

    {message}

    This is an automated message from the NSUT AquaGuard Command Center.
    Please do not reply directly to this email.
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
                        'Data': text_body,
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

def broadcast_severity_alert(db, tank_code: str, severity: str, title: str, message: str, roles=("student",)):
    """Send an automated alert email to registered users matching the supplied roles."""
    try:
        from app.models.user import User
        target_roles = [role.lower() for role in roles]
        users = (
            db.query(User)
            .filter(User.email.isnot(None), func.lower(User.role).in_(target_roles))
            .all()
        )
        severity_label = severity.title() if severity else "Water Quality"
        for u in users:
            try:
                send_alert_email(
                    to_email=u.email,
                    subject=f"AquaGuard {severity_label} Alert: {title}",
                    message=(
                        f"AquaGuard detected a water-quality event that may affect your campus supply.\n\n"
                        f"Severity: {severity}\n"
                        f"Tank: {tank_code}\n\n"
                        f"What happened:\n{message}\n\n"
                        "Recommended action:\nPlease follow AquaGuard advisories in the student portal and use alternate safe drinking points if instructed."
                    )
                )
            except Exception as e:
                print(f"Failed to dispatch alert email to {u.email}: {e}")
    except Exception as e:
        print(f"Error broadcasting severity alert: {e}")
