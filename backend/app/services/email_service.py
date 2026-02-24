# app/services/email_service.py
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_weekly_report(user_email: str, stats: Dict[str, Any]):
        """
        Stub for sending weekly progress reports.
        In production, this would use SendGrid/SES or an SMTP server.
        """
        logger.info(f"Generating weekly report for {user_email}")
        report_body = f"""
        Hi! Here is your InterviewAce summary for the week:
        - Readiness Score: {stats.get('readiness', 0)}%
        - Solved Problems: {stats.get('solved', 0)}
        - Mocks Completed: {stats.get('mocks', 0)}
        - Top Skill: {stats.get('top_skill', 'N/A')}
        Focus for next week: {stats.get('focus', 'Keep practicing!')}
        """
        # Actual email sending logic would go here
        logger.info(f"Mock email sent to {user_email}:\n{report_body}")
        return True

    @staticmethod
    async def send_verification_email(user_email: str, token: str):
        logger.info(f"Sending verification email to {user_email} with token {token}")
        return True

    @staticmethod
    async def send_password_reset(user_email: str, token: str):
        logger.info(f"Sending password reset to {user_email} with token {token}")
        return True

email_service = EmailService()
