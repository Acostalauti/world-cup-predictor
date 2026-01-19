from app.database import SessionLocal
from app import crud, sql_models, utils
import sys

def reset_admin():
    db = SessionLocal()
    try:
        email = "admin@example.com"
        password = "password123"
        
        user = db.query(sql_models.User).filter(sql_models.User.email == email).first()
        if not user:
            print(f"User {email} not found in database. Seed it first.")
            return

        print(f"Resetting password for {email}...")
        user.password_hash = utils.get_password_hash(password)
        db.commit()
        print(f"Successfully updated password for {email} to '{password}'")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
