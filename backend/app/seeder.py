from sqlalchemy.orm import Session
from . import sql_models, models, crud, utils
import uuid
from datetime import datetime
from pathlib import Path


def seed_data(db: Session):
    # Check if data already exists
    if db.query(sql_models.User).first():
        print("Database already seeded.")
        return

    print("Seeding database...")

    # Users
    admin1 = models.User(
        id="user-admin-1",
        email="admin@example.com",
        name="Main Admin",
        role="admin",
        avatar="https://i.pravatar.cc/150?u=admin1",
    )
    admin2 = models.User(
        id="user-admin-2",
        email="admin2@example.com",
        name="Second Admin",
        role="admin",
        avatar="https://i.pravatar.cc/150?u=admin2",
    )
    player1 = models.User(
        id="user-1",
        email="alice@example.com",
        name="Alice Player",
        role="player",
        avatar="https://i.pravatar.cc/150?u=alice",
    )
    player2 = models.User(
        id="user-2",
        email="bob@example.com",
        name="Bob Player",
        role="player",
        avatar="https://i.pravatar.cc/150?u=bob",
    )
    player3 = models.User(
        id="user-3",
        email="charlie@example.com",
        name="Charlie Player",
        role="player",
        avatar="https://i.pravatar.cc/150?u=charlie",
    )

    crud.create_user(db, admin1, password="admin123")
    crud.create_user(db, admin2, password="admin123")
    crud.create_user(db, player1, password="password123")
    crud.create_user(db, player2, password="password123")
    crud.create_user(db, player3, password="password123")

    # Matches - Load from FIFA fixture JSON
    try:
        from .scrapers.load_fixtures import load_fixtures_from_json

        scrapers_dir = Path(__file__).parent / "scrapers"
        json_path = scrapers_dir / "fixture_mundial_2026.json"

        if json_path.exists():
            matches = load_fixtures_from_json(str(json_path))
            for match in matches:
                crud.create_match(db, match)
            print(f"✅ Loaded {len(matches)} World Cup 2026 matches from fixture file")
        else:
            print(f"⚠️  Fixture file not found at {json_path}, no matches loaded")
    except Exception as e:
        print(f"⚠️  Error loading fixtures: {e}")
        # Fallback
        match1 = models.Match(
            id="match-1",
            homeTeam="USA",
            awayTeam="England",
            homeFlag="🇺🇸",
            awayFlag="🏴󠁧󠁢󠁥󠁮󠁧󠁿",
            date=datetime.now().date(),
            time="14:00",
            status="upcoming",
            homeScore=None,
            awayScore=None,
        )
        crud.create_match(db, match1)

    print("Database seeding completed.")
