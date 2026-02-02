"""
Google OAuth configuration and utilities
"""

from authlib.integrations.starlette_client import OAuth
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OAuth client
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile",
    },
)

# Allowed email domains
ALLOWED_DOMAINS = os.getenv("ALLOWED_EMAIL_DOMAINS", "").split(",")


def validate_email_domain(email: str) -> bool:
    """
    Validate if email belongs to allowed Google Workspace domains

    Args:
        email: Email address to validate

    Returns:
        True if email domain is in ALLOWED_DOMAINS, False otherwise
    """
    if not email or "@" not in email:
        return False

    domain = email.split("@")[-1].lower().strip()
    return domain in [d.strip() for d in ALLOWED_DOMAINS]
