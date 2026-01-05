from fastapi.testclient import TestClient
from app.main import app
from app.db import db
import pytest

client = TestClient(app)

# Reset DB before tests (or use a fixture if we had a proper setup, simple clear for now)
@pytest.fixture(autouse=True)
def run_around_tests():
    db.users.clear()
    db.groups.clear()
    db.matches.clear()
    db.predictions.clear()
    db.group_members.clear()
    db.passwords.clear()
    yield

def test_register_and_login():
    # Register
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "test@example.com"
    token = data["token"]

    # Login
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "token" in response.json()

def test_get_me():
    # Register
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User"
    })
    token = response.json()["token"]
    
    # Get Me
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_create_group():
    # Register
    response = client.post("/auth/register", json={
        "email": "admin@example.com",
        "password": "password123",
        "name": "Admin User"
    })
    token = response.json()["token"]
    
    # Create Group
    response = client.post("/groups", json={
        "name": "Test Group",
        "description": "A test group",
        "scoringSystem": "classic"
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Group"
    assert data["playerCount"] == 1
    assert data["isMember"] == True
    assert data["isAdmin"] == True

def test_create_match():
    # Register
    response = client.post("/auth/register", json={
        "email": "admin@example.com",
        "password": "password123",
        "name": "Admin User"
    })
    token = response.json()["token"]
    
    # Create Match
    response = client.post("/matches", json={
        "homeTeam": "Team A",
        "awayTeam": "Team B",
        "date": "2026-06-15",
        "status": "upcoming"
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert response.status_code == 201
    data = response.json()
    assert data["homeTeam"] == "Team A"
    match_id = data["id"]
    
    # List matches
    response = client.get("/matches", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_prediction():
    # Register
    response = client.post("/auth/register", json={
        "email": "user@example.com",
        "password": "password123",
        "name": "User"
    })
    token = response.json()["token"]
    
    # Create Match first (mock admin check skipped in current impl or we allow it)
    response = client.post("/matches", json={
        "homeTeam": "Team A",
        "awayTeam": "Team B",
        "date": "2026-06-15",
        "status": "upcoming"
    }, headers={"Authorization": f"Bearer {token}"})
    match_id = response.json()["id"]
    
    # Create Prediction
    response = client.post("/predictions", json={
        "matchId": match_id,
        "homeScore": 2,
        "awayScore": 1
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["homeScore"] == 2
    assert data["matchId"] == match_id
