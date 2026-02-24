"""
Email service — sends password reset emails via SMTP.
Reads config from environment variables.
Supports: Gmail, Outlook, custom SMTP SERVER.
"""
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ── Config (set these in your .env) ──────────────────────────────
SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")         # your@gmail.com
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")     # App Password (not regular Gmail pw)
SMTP_FROM     = os.getenv("SMTP_FROM", SMTP_USER)
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _html_reset_email(name: str, reset_url: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f23; margin: 0; padding: 20px; }}
    .container {{ max-width: 560px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d50; }}
    .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 24px; font-weight: 800; }}
    .header p {{ color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }}
    .body {{ padding: 36px 40px; }}
    .body p {{ color: #c8c8e0; font-size: 15px; line-height: 1.7; margin: 0 0 20px; }}
    .body strong {{ color: #e0e0f8; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important;
            text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700;
            font-size: 16px; margin: 8px 0 24px; }}
    .note {{ background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 8px;
             padding: 12px 16px; font-size: 13px; color: #9999cc; }}
    .footer {{ padding: 20px 40px; border-top: 1px solid #2d2d50; text-align: center; }}
    .footer p {{ color: #666690; font-size: 12px; margin: 0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 InterviewAce</h1>
      <p>Your AI-powered interview coach</p>
    </div>
    <div class="body">
      <p>Hi <strong>{name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>30 minutes</strong>.</p>
      <div style="text-align:center; margin: 28px 0;">
        <a href="{reset_url}" class="btn">Reset My Password</a>
      </div>
      <div class="note">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </div>
    </div>
    <div class="footer">
      <p>© 2025 InterviewAce · Built by Leela Sankar Reddy</p>
    </div>
  </div>
</body>
</html>
"""


def send_reset_email(to_email: str, name: str, reset_token: str) -> bool:
    """
    Send a password-reset email.
    Returns True on success, False on failure (so the API never crashes due to email errors).
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        # Email not configured — skip silently in dev
        print(f"[EMAIL] SMTP not configured. Reset URL: {FRONTEND_URL}/reset-password?token={reset_token}")
        return False

    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "🔑 Reset Your InterviewAce Password"
    msg["From"]    = f"InterviewAce <{SMTP_FROM}>"
    msg["To"]      = to_email

    # Plain-text fallback
    text = f"Hi {name},\n\nReset your InterviewAce password here (valid 30 min):\n{reset_url}\n\nIf you didn't request this, ignore this email."
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(_html_reset_email(name, reset_url), "html"))

    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls(context=ctx)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())
        print(f"[EMAIL] Reset email sent to {to_email}")
        return True
    except Exception as exc:
        print(f"[EMAIL] Failed to send to {to_email}: {exc}")
        return False
