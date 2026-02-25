# app/services/email_service.py
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def _send_email(to_email: str, subject: str, body_html: str):
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(f"SMTP credentials not set. Logging email to {to_email} instead.")
            logger.info(f"Subject: {subject}\nBody: {body_html}")
            return True

        try:
            msg = MIMEMultipart()
            msg['From'] = settings.MAIL_FROM
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(body_html, 'html'))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @staticmethod
    async def send_weekly_report(user_email: str, stats: Dict[str, Any]):
        subject = "Your Weekly InterviewAce Performance Report"
        body = f"""
        <html>
            <body>
                <h2>Hi! Here is your InterviewAce summary for the week:</h2>
                <ul>
                    <li><b>Readiness Score:</b> {stats.get('readiness', 0)}%</li>
                    <li><b>Solved Problems:</b> {stats.get('solved', 0)}</li>
                    <li><b>Mocks Completed:</b> {stats.get('mocks', 0)}</li>
                    <li><b>Top Skill:</b> {stats.get('top_skill', 'N/A')}</li>
                </ul>
                <p><b>Focus for next week:</b> {stats.get('focus', 'Keep practicing!')}</p>
                <p>Keep grinding, you're doing great!</p>
            </body>
        </html>
        """
        return EmailService._send_email(user_email, subject, body)

    @staticmethod
    async def send_verification_email(user_email: str, token: str):
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        subject = "Verify your InterviewAce Account"
        body = f"""
        <html>
            <body>
                <h2>Welcome to InterviewAce!</h2>
                <p>Please click the link below to verify your email address:</p>
                <a href="{verify_url}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
            </body>
        </html>
        """
        return EmailService._send_email(user_email, subject, body)

    @staticmethod
    async def send_password_reset(user_email: str, token: str):
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        subject = "Reset your InterviewAce Password"
        body = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to proceed:</p>
                <a href="{reset_url}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </body>
        </html>
        """
        return EmailService._send_email(user_email, subject, body)

email_service = EmailService()

