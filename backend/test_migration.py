from app.database import SessionLocal
from app import sql_models

def verify_migration():
    db = SessionLocal()
    try:
        print("Verifying migration...")
        
        # Check Users
        users_count = db.query(sql_models.User).count()
        print(f"Users count: {users_count}")
        assert users_count >= 4, "Should have at least 4 seeded users"
        
        # Check Groups
        groups_count = db.query(sql_models.Group).count()
        print(f"Groups count: {groups_count}")
        assert groups_count >= 2, "Should have seeded groups"
        
        # Check Matches
        matches_count = db.query(sql_models.Match).count()
        print(f"Matches count: {matches_count}")
        assert matches_count > 0, "Should have loaded matches"
        
        admin = db.query(sql_models.User).filter(sql_models.User.email == "admin@example.com").first()
        assert admin is not None, "Admin user not found"
        print(f"Found admin: {admin.id}")
        
        print("✅ Migration verification passed!")
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_migration()
