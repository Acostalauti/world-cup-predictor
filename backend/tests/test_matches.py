import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta
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


@pytest.fixture
def client(test_client):
    return test_client


def test_matches_includes_editable_field(client, db):
    """Test that GET /api/matches includes editable field"""
    # Register user
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user@example.com",
            "password": "password123",
            "name": "Test User",
        },
    )
    assert response.status_code == 201
    token = response.json()["token"]

    # Create upcoming match (2 hours from now - should be editable)
    future_date = datetime.utcnow() + timedelta(hours=2)
    match = sql_models.Match(
        id="test-match-1",
        homeTeam="Team A",
        awayTeam="Team B",
        date=future_date,
        status="upcoming",
        homeScore=None,
        awayScore=None,
    )
    db.add(match)
    db.commit()

    # Get matches
    response = client.get("/api/matches", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    matches = response.json()
    assert len(matches) == 1
    assert "editable" in matches[0]
    assert matches[0]["editable"] is True  # Should be editable (2h away)


def test_editable_false_after_deadline(client, db):
    """Test that editable=False when match is less than 1h away"""
    # Register user
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user2@example.com",
            "password": "password123",
            "name": "Test User 2",
        },
    )
    token = response.json()["token"]

    # Create match 30 minutes from now (within 1h deadline)
    near_date = datetime.utcnow() + timedelta(minutes=30)
    match = sql_models.Match(
        id="test-match-2",
        homeTeam="Team C",
        awayTeam="Team D",
        date=near_date,
        status="upcoming",
        homeScore=None,
        awayScore=None,
    )
    db.add(match)
    db.commit()

    # Get matches
    response = client.get("/api/matches", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    matches = response.json()
    assert len(matches) == 1
    assert matches[0]["editable"] is False  # Should NOT be editable


def test_editable_false_if_finished(client, db):
    """Test that editable=False for finished matches"""
    # Register user
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user3@example.com",
            "password": "password123",
            "name": "Test User 3",
        },
    )
    token = response.json()["token"]

    # Create finished match
    past_date = datetime.utcnow() - timedelta(hours=2)
    match = sql_models.Match(
        id="test-match-3",
        homeTeam="Team E",
        awayTeam="Team F",
        date=past_date,
        status="finished",
        homeScore=2,
        awayScore=1,
    )
    db.add(match)
    db.commit()

    # Get matches
    response = client.get("/api/matches", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

    matches = response.json()
    assert len(matches) == 1
    assert matches[0]["editable"] is False  # Should NOT be editable
    assert matches[0]["status"] == "finished"
