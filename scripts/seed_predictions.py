#!/usr/bin/env python3
"""
Seed predictions for test user (alice@example.com)
Creates diverse predictions across different matches for E2E testing.
"""

import sqlite3
import uuid
from datetime import datetime
import random
import sys
from pathlib import Path

# Add backend to path for database connection
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

DB_PATH = "backend/app.db"
ALICE_USER_ID = "user-1"  # alice@example.com


def create_predictions(num_predictions: int = 20):
    """Create predictions for alice user"""

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get matches that don't have TBD teams (more realistic)
    cursor.execute(
        """
        SELECT id, homeTeam, awayTeam, date 
        FROM matches 
        WHERE homeTeam NOT LIKE '%TBD%' 
          AND awayTeam NOT LIKE '%TBD%'
        ORDER BY date
        LIMIT ?
    """,
        (num_predictions,),
    )

    matches = cursor.fetchall()

    if not matches:
        print("❌ No matches found in database")
        conn.close()
        return

    # Delete existing predictions for alice to start fresh
    cursor.execute("DELETE FROM predictions WHERE userId = ?", (ALICE_USER_ID,))
    deleted = cursor.rowcount
    print(f"🗑️  Deleted {deleted} existing predictions for alice")

    predictions_created = 0

    for match in matches:
        match_id, home_team, away_team, match_date = match

        # Generate realistic scores (0-4 goals, weighted towards lower scores)
        weights = [30, 35, 20, 10, 5]  # Probability distribution for 0-4 goals
        home_score = random.choices(range(5), weights=weights)[0]
        away_score = random.choices(range(5), weights=weights)[0]

        prediction_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        cursor.execute(
            """
            INSERT INTO predictions (
                id, matchId, userId, homeScore, awayScore, 
                points, pointsBreakdown, notified, createdAt, updatedAt
            )
            VALUES (?, ?, ?, ?, ?, NULL, NULL, 0, ?, ?)
        """,
            (prediction_id, match_id, ALICE_USER_ID, home_score, away_score, now, now),
        )

        predictions_created += 1
        print(
            f"✅ Created prediction: {home_team} {home_score}-{away_score} {away_team} (Match: {match_date})"
        )

    conn.commit()
    conn.close()

    print(
        f"\n🎉 Successfully created {predictions_created} predictions for alice@example.com"
    )
    print(f"📊 User ID: {ALICE_USER_ID}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed predictions for alice user")
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of predictions to create (default: 20)",
    )

    args = parser.parse_args()

    print(f"🌱 Seeding {args.count} predictions for alice@example.com...")
    create_predictions(args.count)
