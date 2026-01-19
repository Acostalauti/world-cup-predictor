import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app import sql_models

# Use in-memory SQLite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function", autouse=True)
def test_client(db):
    def override_get_db():
        yield db
    
    from app.main import app
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

# Use test_client fixture for all tests
@pytest.fixture
def client(test_client):
    return test_client

def test_register_and_login(client):
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

def test_get_me(client):
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

def test_create_group(client):
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

def test_create_match(client):
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

def test_prediction(client):
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
