# backend/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_no_data():
    """Test that login fails without credentials."""
    response = client.post("/api/auth/login", json={})
    # Depending on implementation, might be 422 (validation) or 401
    assert response.status_code in [401, 422]

def test_signup_validation():
    """Test that signup requires valid data."""
    response = client.post("/api/auth/register", json={
        "email": "invalid-email",
        "password": "short"
    })
    assert response.status_code in [400, 422]
