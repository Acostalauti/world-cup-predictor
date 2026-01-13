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
    admin = models.User(id="user-admin", email="admin@example.com", name="Admin User", role="platform_admin", avatar="https://i.pravatar.cc/150?u=admin")
    player1 = models.User(id="user-1", email="alice@example.com", name="Alice Player", role="player", avatar="https://i.pravatar.cc/150?u=alice")
    player2 = models.User(id="user-2", email="bob@example.com", name="Bob Player", role="player", avatar="https://i.pravatar.cc/150?u=bob")
    group_admin = models.User(id="user-group-admin", email="group_admin@example.com", name="Group Admin", role="group_admin", avatar="https://i.pravatar.cc/150?u=group_admin")
    
    crud.create_user(db, admin, password="password123")
    crud.create_user(db, player1, password="password123")
    crud.create_user(db, player2, password="password123")
    crud.create_user(db, group_admin, password="password123")
    
    # Groups
    group1 = models.Group(
        id="group-1", name="World Cup 2026 Official", description="The official prediction group.",
        adminId="user-group-admin", playerCount=0, inviteCode="OFFICIAL", scoringSystem="classic",
        createdAt=datetime.now(), status="active"
    )
    group2 = models.Group(
        id="group-2", name="Office League", description="For the office crew.",
        adminId="user-1", playerCount=0, inviteCode="OFFICE01", scoringSystem="extended",
        createdAt=datetime.now(), status="active"
    )
    
    crud.create_group(db, group1)
    crud.create_group(db, group2)
    
    # Members
    crud.add_group_member(db, "group-1", "user-admin", is_admin=True, points=10)
    crud.add_group_member(db, "group-1", "user-group-admin", is_admin=True, points=0)
    crud.add_group_member(db, "group-1", "user-1", is_admin=False, points=5)
    crud.add_group_member(db, "group-2", "user-1", is_admin=True, points=0)
    crud.add_group_member(db, "group-2", "user-2", is_admin=False, points=0)

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
            id="match-1", homeTeam="USA", awayTeam="England", homeFlag="🇺🇸", awayFlag="🏴󠁧󠁢󠁥󠁮󠁧󠁿",
            date=datetime.now().date(), time="14:00", status="upcoming", homeScore=None, awayScore=None
        )
        crud.create_match(db, match1)

    print("Database seeding completed.")
