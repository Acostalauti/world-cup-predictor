import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Default to SQLite, but allow override via env var
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# SQLite needs specific connect_args to allow access from multiple threads
# (only necessary for SQLite)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_migrations():
    """
    Applies schema changes that create_all cannot handle (adding columns to
    existing tables). Safe to run on every startup — each statement is
    idempotent via IF NOT EXISTS / DO NOTHING guards.
    """
    is_sqlite = DATABASE_URL.startswith("sqlite")

    with engine.begin() as conn:
        if is_sqlite:
            # SQLite doesn't support IF NOT EXISTS on ALTER TABLE — check manually
            matches_cols = {row[1] for row in conn.execute(text("PRAGMA table_info(matches)"))}
            predictions_cols = {row[1] for row in conn.execute(text("PRAGMA table_info(predictions)"))}

            matches_additions = {
                "fifaMatchId": "TEXT UNIQUE",
                "manualOverride": "INTEGER DEFAULT 0",
                "updatedAt": "DATETIME",
            }
            predictions_additions = {
                "pointsBreakdown": "TEXT",
                "notified": "INTEGER DEFAULT 0",
                "updatedAt": "DATETIME",
            }
            for col, definition in matches_additions.items():
                if col not in matches_cols:
                    conn.execute(text(f'ALTER TABLE matches ADD COLUMN "{col}" {definition}'))
            for col, definition in predictions_additions.items():
                if col not in predictions_cols:
                    conn.execute(text(f'ALTER TABLE predictions ADD COLUMN "{col}" {definition}'))
        else:
            # PostgreSQL supports IF NOT EXISTS
            conn.execute(text("""
                ALTER TABLE matches
                    ADD COLUMN IF NOT EXISTS "fifaMatchId" VARCHAR UNIQUE,
                    ADD COLUMN IF NOT EXISTS "manualOverride" BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP
            """))
            conn.execute(text("""
                ALTER TABLE predictions
                    ADD COLUMN IF NOT EXISTS "pointsBreakdown" VARCHAR,
                    ADD COLUMN IF NOT EXISTS "notified" BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP
            """))

        # Migrate date column from DATE to TIMESTAMP if needed (PostgreSQL only)
        if not is_sqlite:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF (SELECT data_type FROM information_schema.columns
                        WHERE table_name='matches' AND column_name='date') = 'date' THEN
                        ALTER TABLE matches ALTER COLUMN date TYPE TIMESTAMP USING date::timestamp;
                    END IF;
                END $$
            """))

        # Backfill fifaMatchId from id for rows seeded before this migration
        conn.execute(text("""
            UPDATE matches SET "fifaMatchId" = id WHERE "fifaMatchId" IS NULL
        """))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
