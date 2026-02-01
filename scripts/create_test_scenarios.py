#!/usr/bin/env python3
"""
Create specific test scenarios for E2E testing.
Sets up edge cases like:
- Matches near deadline (< 1 hour)
- Live matches
- Matches in different stages/groups
"""

import sqlite3
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

DB_PATH = "backend/app.db"


def create_test_scenarios():
    """Create specific test scenarios"""

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now()

    print("🎬 Creating test scenarios...")

    # Scenario 1: Match happening in 30 minutes (deadline passed, not editable)
    deadline_30min = now + timedelta(minutes=30)
    cursor.execute("""
        SELECT id FROM matches 
        WHERE status = 'upcoming' 
        AND homeTeam NOT LIKE '%TBD%'
        LIMIT 1
    """)
    match = cursor.fetchone()
    if match:
        cursor.execute(
            """
            UPDATE matches
            SET date = ?,
                updatedAt = ?
            WHERE id = ?
        """,
            (deadline_30min.isoformat(), now.isoformat(), match[0]),
        )
        print(f"✅ Scenario 1: Match in 30 min (not editable) - Match ID: {match[0]}")

    # Scenario 2: Match happening in 2 hours (still editable)
    deadline_2hrs = now + timedelta(hours=2)
    cursor.execute(
        """
        SELECT id FROM matches 
        WHERE status = 'upcoming' 
        AND homeTeam NOT LIKE '%TBD%'
        AND id != ?
        LIMIT 1
    """,
        (match[0] if match else "",),
    )
    match2 = cursor.fetchone()
    if match2:
        cursor.execute(
            """
            UPDATE matches
            SET date = ?,
                updatedAt = ?
            WHERE id = ?
        """,
            (deadline_2hrs.isoformat(), now.isoformat(), match2[0]),
        )
        print(f"✅ Scenario 2: Match in 2 hours (editable) - Match ID: {match2[0]}")

    # Scenario 3: Create a LIVE match (status=live, happening now)
    cursor.execute(
        """
        SELECT id FROM matches 
        WHERE status = 'upcoming' 
        AND homeTeam NOT LIKE '%TBD%'
        AND id NOT IN (?, ?)
        LIMIT 1
    """,
        (match[0] if match else "", match2[0] if match2 else ""),
    )
    match3 = cursor.fetchone()
    if match3:
        # Set match as live with partial scores
        cursor.execute(
            """
            UPDATE matches
            SET status = 'live',
                date = ?,
                homeScore = 1,
                awayScore = 0,
                updatedAt = ?
            WHERE id = ?
        """,
            (now.isoformat(), now.isoformat(), match3[0]),
        )
        print(f"✅ Scenario 3: LIVE match (1-0 at halftime) - Match ID: {match3[0]}")

    # Scenario 4: Set up matches across different stages
    stages = ["Group Stage", "Round of 16", "Quarter-finals", "Semi-finals"]
    for stage in stages:
        # SQLite doesn't support LIMIT in UPDATE, use subquery
        cursor.execute(
            """
            UPDATE matches
            SET stage = ?
            WHERE id IN (
                SELECT id FROM matches
                WHERE stage IS NULL OR stage = ''
                LIMIT 5
            )
        """,
            (stage,),
        )
        if cursor.rowcount > 0:
            print(f"✅ Scenario 4: Set {cursor.rowcount} matches to '{stage}'")

    # Scenario 5: Ensure we have matches in different groups (A-H)
    groups = ["A", "B", "C", "D", "E", "F", "G", "H"]
    for group in groups:
        cursor.execute(
            """
            UPDATE matches
            SET "group" = ?
            WHERE id IN (
                SELECT id FROM matches
                WHERE stage = 'Group Stage' AND ("group" IS NULL OR "group" = '')
                LIMIT 4
            )
        """,
            (group,),
        )
        if cursor.rowcount > 0:
            print(f"✅ Scenario 5: Set {cursor.rowcount} matches to 'Group {group}'")

    # Scenario 6: Create matches happening today (for filtering)
    today = now.replace(hour=20, minute=0, second=0)
    cursor.execute("""
        SELECT id FROM matches 
        WHERE status = 'upcoming' 
        AND homeTeam NOT LIKE '%TBD%'
        LIMIT 3
    """)
    today_matches = cursor.fetchall()
    for i, m in enumerate(today_matches):
        match_time = today + timedelta(hours=i * 2)
        cursor.execute(
            """
            UPDATE matches
            SET date = ?,
                updatedAt = ?
            WHERE id = ?
        """,
            (match_time.isoformat(), now.isoformat(), m[0]),
        )
    if today_matches:
        print(f"✅ Scenario 6: Created {len(today_matches)} matches happening today")

    conn.commit()

    # Print summary
    cursor.execute("SELECT COUNT(*) FROM matches WHERE status = 'upcoming'")
    upcoming = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM matches WHERE status = 'live'")
    live = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM matches WHERE status = 'finished'")
    finished = cursor.fetchone()[0]

    print(f"\n📊 Match Status Summary:")
    print(f"   Upcoming: {upcoming}")
    print(f"   Live: {live}")
    print(f"   Finished: {finished}")

    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN points = 5 THEN 1 ELSE 0 END) as perfect,
            SUM(CASE WHEN points >= 3 THEN 1 ELSE 0 END) as good,
            SUM(points) as total_points
        FROM predictions
        WHERE userId = 'user-1'
    """)
    pred_stats = cursor.fetchone()

    print(f"\n📈 Alice's Prediction Stats:")
    print(f"   Total predictions: {pred_stats[0]}")
    print(f"   Perfect scores (5pts): {pred_stats[1]}")
    print(f"   Good predictions (3-5pts): {pred_stats[2]}")
    print(f"   Total points: {pred_stats[3]}")

    conn.close()

    print(f"\n🎉 Test scenarios created successfully!")


if __name__ == "__main__":
    create_test_scenarios()
