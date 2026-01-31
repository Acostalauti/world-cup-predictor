"""
Test Data Generator

Crea matches de prueba con diferentes estados para poder testear
el sistema de puntos sin tener que esperar a partidos reales.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import sql_models
import uuid


def create_test_matches(db: Session):
    """
    Crea 5 matches de prueba con diferentes estados:
    - 2 matches finalizados (para testear cálculo de puntos)
    - 1 match en 3 horas (puede predecir)
    - 1 match mañana (puede predecir)
    - 1 match en 30 min (deadline pasado, no puede predecir)
    """

    # Check if test matches already exist
    existing = (
        db.query(sql_models.Match)
        .filter(sql_models.Match.id.like("test-match-%"))
        .first()
    )

    if existing:
        print("⚠️  Test matches already exist, skipping...")
        return

    now = datetime.utcnow()

    test_matches = [
        # Match 1: Finalizado ayer - Argentina ganó 2-1
        sql_models.Match(
            id="test-match-1",
            homeTeam="Argentina",
            awayTeam="Brasil",
            homeFlag="🇦🇷",
            awayFlag="🇧🇷",
            date=now - timedelta(days=1),
            time="20:00",
            status="finished",
            homeScore=2,
            awayScore=1,
            stadium="MetLife Stadium",
            city="New York",
            stage="Final",
            matchNumber=999,
            fifaMatchId="test-fifa-1",
            manualOverride=True,
        ),
        # Match 2: Finalizado hace 2 horas - Empate 1-1
        sql_models.Match(
            id="test-match-2",
            homeTeam="España",
            awayTeam="Francia",
            homeFlag="🇪🇸",
            awayFlag="🇫🇷",
            date=now - timedelta(hours=2),
            time="18:00",
            status="finished",
            homeScore=1,
            awayScore=1,
            stadium="AT&T Stadium",
            city="Dallas",
            stage="Semifinal",
            matchNumber=998,
            fifaMatchId="test-fifa-2",
            manualOverride=True,
        ),
        # Match 3: En 3 horas - Puede predecir
        sql_models.Match(
            id="test-match-3",
            homeTeam="México",
            awayTeam="USA",
            homeFlag="🇲🇽",
            awayFlag="🇺🇸",
            date=now + timedelta(hours=3),
            time="21:00",
            status="upcoming",
            homeScore=None,
            awayScore=None,
            stadium="Azteca Stadium",
            city="Mexico City",
            stage="Cuartos de Final",
            matchNumber=997,
            fifaMatchId="test-fifa-3",
        ),
        # Match 4: Mañana - Puede predecir
        sql_models.Match(
            id="test-match-4",
            homeTeam="Alemania",
            awayTeam="Inglaterra",
            homeFlag="🇩🇪",
            awayFlag="🏴󠁧󠁢󠁥󠁮󠁧󠁿",
            date=now + timedelta(days=1),
            time="16:00",
            status="upcoming",
            homeScore=None,
            awayScore=None,
            stadium="SoFi Stadium",
            city="Los Angeles",
            stage="Octavos de Final",
            matchNumber=996,
            fifaMatchId="test-fifa-4",
        ),
        # Match 5: En 30 minutos - Deadline pasado!
        sql_models.Match(
            id="test-match-5",
            homeTeam="Portugal",
            awayTeam="Holanda",
            homeFlag="🇵🇹",
            awayFlag="🇳🇱",
            date=now + timedelta(minutes=30),
            time="20:30",
            status="upcoming",
            homeScore=None,
            awayScore=None,
            stadium="Levi's Stadium",
            city="San Francisco",
            stage="Cuartos de Final",
            matchNumber=995,
            fifaMatchId="test-fifa-5",
        ),
    ]

    for match in test_matches:
        db.add(match)

    db.commit()
    print(f"✅ Created {len(test_matches)} test matches:")
    print("  - test-match-1: Argentina 2-1 Brasil (FINISHED)")
    print("  - test-match-2: España 1-1 Francia (FINISHED)")
    print("  - test-match-3: México vs USA (in 3 hours - can predict)")
    print("  - test-match-4: Alemania vs Inglaterra (tomorrow - can predict)")
    print("  - test-match-5: Portugal vs Holanda (in 30 min - DEADLINE PASSED)")


def create_test_predictions(db: Session):
    """
    Crea predicciones de prueba para los matches finalizados
    para poder testear el cálculo de puntos.
    """

    # Check if test predictions already exist
    existing = (
        db.query(sql_models.Prediction)
        .filter(sql_models.Prediction.id.like("test-pred-%"))
        .first()
    )

    if existing:
        print("⚠️  Test predictions already exist, skipping...")
        return

    # Get users
    users = db.query(sql_models.User).limit(3).all()
    if len(users) < 3:
        print("⚠️  Need at least 3 users to create test predictions")
        return

    # Match 1: Argentina 2-1 Brasil (FINISHED)
    # User 1: Predicción exacta (5 puntos)
    # User 2: Ganador + diferencia (4 puntos)
    # User 3: Solo ganador (3 puntos)

    test_predictions = [
        # User 1: Exacto!
        sql_models.Prediction(
            id="test-pred-1",
            matchId="test-match-1",
            userId=users[0].id,
            homeScore=2,
            awayScore=1,
            points=None,  # Se calculará después
            pointsBreakdown=None,
            notified=False,
            createdAt=datetime.utcnow() - timedelta(days=2),
        ),
        # User 2: Ganador + diff (predice 3-2, real 2-1)
        sql_models.Prediction(
            id="test-pred-2",
            matchId="test-match-1",
            userId=users[1].id,
            homeScore=3,
            awayScore=2,
            points=None,
            pointsBreakdown=None,
            notified=False,
            createdAt=datetime.utcnow() - timedelta(days=2),
        ),
        # User 3: Solo ganador (predice 1-0, real 2-1)
        sql_models.Prediction(
            id="test-pred-3",
            matchId="test-match-1",
            userId=users[2].id,
            homeScore=1,
            awayScore=0,
            points=None,
            pointsBreakdown=None,
            notified=False,
            createdAt=datetime.utcnow() - timedelta(days=2),
        ),
        # Match 2: España 1-1 Francia (EMPATE)
        # User 1: Predice empate pero diferente score (3 pts)
        sql_models.Prediction(
            id="test-pred-4",
            matchId="test-match-2",
            userId=users[0].id,
            homeScore=2,
            awayScore=2,
            points=None,
            pointsBreakdown=None,
            notified=False,
            createdAt=datetime.utcnow() - timedelta(hours=4),
        ),
        # User 2: Predice ganador incorrecto (0 pts)
        sql_models.Prediction(
            id="test-pred-5",
            matchId="test-match-2",
            userId=users[1].id,
            homeScore=2,
            awayScore=0,
            points=None,
            pointsBreakdown=None,
            notified=False,
            createdAt=datetime.utcnow() - timedelta(hours=4),
        ),
    ]

    for pred in test_predictions:
        db.add(pred)

    db.commit()
    print(f"✅ Created {len(test_predictions)} test predictions for finished matches")


if __name__ == "__main__":
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        create_test_matches(db)
        create_test_predictions(db)
        print("\n✅ Test data generation completed!")
        print("\nYou can now test the points calculation system with:")
        print("  python -m app.services.match_updater")
    finally:
        db.close()
