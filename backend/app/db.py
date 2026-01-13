from typing import List, Optional, Dict
import uuid
from datetime import datetime
from .models import User, Group, Match, Prediction, GroupMember

class MockDB:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.groups: Dict[str, Group] = {}
        self.matches: Dict[str, Match] = {}
        self.predictions: Dict[str, Prediction] = {}
        self.group_members: Dict[str, List[GroupMember]] = {} # keyed by group_id
        self.passwords: Dict[str, str] = {} # user_id -> hashed_password

        # Seed some data if needed
        self.seed_data()

    def seed_data(self):
        # Users
        admin = User(id="user-admin", email="admin@example.com", name="Admin User", role="platform_admin", avatar="https://i.pravatar.cc/150?u=admin")
        player1 = User(id="user-1", email="alice@example.com", name="Alice Player", role="player", avatar="https://i.pravatar.cc/150?u=alice")
        player2 = User(id="user-2", email="bob@example.com", name="Bob Player", role="player", avatar="https://i.pravatar.cc/150?u=bob")
        group_admin = User(id="user-group-admin", email="group_admin@example.com", name="Group Admin", role="group_admin", avatar="https://i.pravatar.cc/150?u=group_admin")
        
        self.create_user(admin)
        self.create_user(player1)
        self.create_user(player2)
        self.create_user(group_admin)
        
        # Passwords (hashed ideally, plain for now as per previous hack)
        self.passwords["user-admin"] = "password123"
        self.passwords["user-1"] = "password123"
        self.passwords["user-2"] = "password123"
        self.passwords["user-group-admin"] = "password123"

        # Groups
        group1 = Group(
            id="group-1", name="World Cup 2026 Official", description="The official prediction group.",
            adminId="user-group-admin", playerCount=0, inviteCode="OFFICIAL", scoringSystem="classic",
            createdAt=datetime.now(), status="active"
        )
        group2 = Group(
            id="group-2", name="Office League", description="For the office crew.",
            adminId="user-1", playerCount=0, inviteCode="OFFICE01", scoringSystem="extended",
            createdAt=datetime.now(), status="active"
        )
        
        self.create_group(group1)
        self.create_group(group2)
        
        # Members
        self.add_group_member("group-1", GroupMember(userId="user-admin", name="Admin User", email="admin@example.com", joinedAt=datetime.now(), points=10, isAdmin=True))
        self.add_group_member("group-1", GroupMember(userId="user-group-admin", name="Group Admin", email="group_admin@example.com", joinedAt=datetime.now(), points=0, isAdmin=True))
        self.add_group_member("group-1", GroupMember(userId="user-1", name="Alice Player", email="alice@example.com", joinedAt=datetime.now(), points=5, isAdmin=False))
        self.add_group_member("group-2", GroupMember(userId="user-1", name="Alice Player", email="alice@example.com", joinedAt=datetime.now(), points=0, isAdmin=True))
        self.add_group_member("group-2", GroupMember(userId="user-2", name="Bob Player", email="bob@example.com", joinedAt=datetime.now(), points=0, isAdmin=False))

        # Matches - Load from FIFA fixture JSON
        try:
            from pathlib import Path
            from .scrapers.load_fixtures import load_fixtures_from_json
            
            # Get the path to the fixture JSON file
            scrapers_dir = Path(__file__).parent / "scrapers"
            json_path = scrapers_dir / "fixture_mundial_2026.json"
            
            if json_path.exists():
                matches = load_fixtures_from_json(str(json_path))
                for match in matches:
                    self.create_match(match)
                print(f"✅ Loaded {len(matches)} World Cup 2026 matches from fixture file")
            else:
                print(f"⚠️  Fixture file not found at {json_path}, no matches loaded")
        except Exception as e:
            print(f"⚠️  Error loading fixtures: {e}")
            # Fallback to a few sample matches if fixture loading fails
            match1 = Match(
                id="match-1", homeTeam="USA", awayTeam="England", homeFlag="🇺🇸", awayFlag="🏴󠁧󠁢󠁥󠁮󠁧󠁿",
                date=datetime.now().date(), time="14:00", status="upcoming", homeScore=None, awayScore=None
            )
            self.create_match(match1)

        # Predictions for player1 (Alice) and player2 (Bob)
        # from .models import Prediction
        
        # No default predictions seeded
        pass
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    def create_user(self, user: User) -> User:
        self.users[user.id] = user
        return user

    def get_user(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)

    def create_group(self, group: Group) -> Group:
        self.groups[group.id] = group
        self.group_members[group.id] = []
        return group
    
    def get_group(self, group_id: str) -> Optional[Group]:
        return self.groups.get(group_id)

    def get_groups(self) -> List[Group]:
        return list(self.groups.values())

    def add_group_member(self, group_id: str, member: GroupMember):
        if group_id not in self.group_members:
            self.group_members[group_id] = []
        self.group_members[group_id].append(member)
        # Update player count
        if group_id in self.groups:
            self.groups[group_id].playerCount = len(self.group_members[group_id])

    def get_group_members(self, group_id: str) -> List[GroupMember]:
        return self.group_members.get(group_id, [])

    def create_match(self, match: Match) -> Match:
        self.matches[match.id] = match
        return match

    def get_match(self, match_id: str) -> Optional[Match]:
        return self.matches.get(match_id)

    def get_matches(self, status: Optional[str] = None) -> List[Match]:
        if status:
            return [m for m in self.matches.values() if m.status == status]
        return list(self.matches.values())

    def update_match(self, match_id: str, **kwargs) -> Optional[Match]:
        match = self.matches.get(match_id)
        if match:
            updated_data = match.model_dump()
            updated_data.update(kwargs)
            updated_match = Match(**updated_data)
            self.matches[match_id] = updated_match
            return updated_match
        return None

    def create_prediction(self, prediction: Prediction) -> Prediction:
        # Check if exists to update or create
        existing = self.get_prediction(prediction.matchId, prediction.userId)
        if existing:
            # Update
             self.predictions[existing.id] = prediction
             return prediction
        self.predictions[prediction.id] = prediction
        return prediction

    def get_prediction(self, match_id: str, user_id: str) -> Optional[Prediction]:
        for p in self.predictions.values():
            if p.matchId == match_id and p.userId == user_id:
                return p
        return None

db = MockDB()
