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


def test_predictions_detailed_returns_match_data(client, db):
    """Test that /predictions/detailed returns predictions with full match data"""
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
    user_id = response.json()["user"]["id"]

    # Create match
    future_date = datetime.utcnow() + timedelta(hours=3)
    match = sql_models.Match(
        id="test-match-1",
        homeTeam="Team A",
        awayTeam="Team B",
        date=future_date,
        status="upcoming",
        homeScore=None,
        awayScore=None,
        stage="Primera fase",
        group="Grupo A",
    )
    db.add(match)
    db.commit()

    # Create prediction
    response = client.post(
        "/api/predictions",
        json={"matchId": "test-match-1", "homeScore": 2, "awayScore": 1},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    # Get detailed predictions
    response = client.get(
        "/api/predictions/detailed",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    predictions = response.json()
    assert len(predictions) == 1

    # Verify prediction data
    pred = predictions[0]
    assert pred["matchId"] == "test-match-1"
    assert pred["homeScore"] == 2
    assert pred["awayScore"] == 1
    assert pred["userId"] == user_id

    # Verify match data is included
    assert "match" in pred
    assert pred["match"]["id"] == "test-match-1"
    assert pred["match"]["homeTeam"] == "Team A"
    assert pred["match"]["awayTeam"] == "Team B"
    assert pred["match"]["stage"] == "Primera fase"
    assert pred["match"]["group"] == "Grupo A"


def test_predictions_detailed_security(client, db):
    """Test that users can only see their own predictions"""
    # Register user 1
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user1@example.com",
            "password": "password123",
            "name": "User 1",
        },
    )
    token1 = response.json()["token"]
    user1_id = response.json()["user"]["id"]

    # Register user 2
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user2@example.com",
            "password": "password123",
            "name": "User 2",
        },
    )
    token2 = response.json()["token"]
    user2_id = response.json()["user"]["id"]

    # Create match
    future_date = datetime.utcnow() + timedelta(hours=3)
    match = sql_models.Match(
        id="test-match-2",
        homeTeam="Team C",
        awayTeam="Team D",
        date=future_date,
        status="upcoming",
    )
    db.add(match)
    db.commit()

    # User 1 creates prediction
    response = client.post(
        "/api/predictions",
        json={"matchId": "test-match-2", "homeScore": 3, "awayScore": 0},
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert response.status_code == 200

    # User 2 tries to get User 1's predictions - should fail
    response = client.get(
        f"/api/predictions/detailed?userId={user1_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 403  # Forbidden

    # User 2 gets their own predictions - should succeed but be empty
    response = client.get(
        "/api/predictions/detailed",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_predictions_detailed_filter_by_status(client, db):
    """Test filtering predictions by match status"""
    # Register user
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user@example.com",
            "password": "password123",
            "name": "Test User",
        },
    )
    token = response.json()["token"]
    user_id = response.json()["user"]["id"]

    # Create upcoming match
    future_date = datetime.utcnow() + timedelta(hours=3)
    match1 = sql_models.Match(
        id="test-match-upcoming",
        homeTeam="Team A",
        awayTeam="Team B",
        date=future_date,
        status="upcoming",
    )

    # Create finished match
    past_date = datetime.utcnow() - timedelta(hours=2)
    match2 = sql_models.Match(
        id="test-match-finished",
        homeTeam="Team C",
        awayTeam="Team D",
        date=past_date,
        status="finished",
        homeScore=2,
        awayScore=1,
    )

    db.add(match1)
    db.add(match2)
    db.commit()

    # Create predictions for both matches
    client.post(
        "/api/predictions",
        json={"matchId": "test-match-upcoming", "homeScore": 2, "awayScore": 1},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Manually create prediction for finished match (bypass deadline check)
    pred = sql_models.Prediction(
        id="pred-finished",
        matchId="test-match-finished",
        userId=user_id,
        homeScore=2,
        awayScore=1,
        points=5,
        pointsBreakdown="exact_result",
    )
    db.add(pred)
    db.commit()

    # Get all predictions
    response = client.get(
        "/api/predictions/detailed",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 2

    # Filter by upcoming
    response = client.get(
        "/api/predictions/detailed?status=upcoming",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    predictions = response.json()
    assert len(predictions) == 1
    assert predictions[0]["match"]["status"] == "upcoming"

    # Filter by finished
    response = client.get(
        "/api/predictions/detailed?status=finished",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    predictions = response.json()
    assert len(predictions) == 1
    assert predictions[0]["match"]["status"] == "finished"
    assert predictions[0]["points"] == 5
