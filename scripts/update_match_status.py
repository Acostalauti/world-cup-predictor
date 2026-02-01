#!/usr/bin/env python3
"""
Update match statuses and scores to create finished matches.
This triggers the points calculation system for testing predictions.
"""

import sqlite3
from datetime import datetime
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

DB_PATH = "backend/app.db"

# Realistic match results (homeTeam, awayTeam, homeScore, awayScore)
REALISTIC_RESULTS = [
    ("Argentina", "Brasil", 2, 1),
    ("España", "Francia", 3, 1),
    ("Portugal", "Holanda", 1, 1),
    ("México", "USA", 0, 2),
    ("Alemania", "Inglaterra", 2, 2),
    ("México", "Sudáfrica", 1, 0),
    ("EE. UU.", "Paraguay", 2, 1),
    ("Catar", "Suiza", 0, 3),
    ("Brasil", "Marruecos", 3, 0),
    ("Haití", "Escocia", 1, 2),
]


def update_match_status(num_matches: int = 10):
    """
    Mark matches as finished with realistic scores.
    Prioritizes matches that have predictions for better testing.
    """

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get matches that have predictions (more interesting for testing)
    cursor.execute(
        """
        SELECT DISTINCT m.id, m.homeTeam, m.awayTeam, m.date
        FROM matches m
        INNER JOIN predictions p ON p.matchId = m.id
        WHERE m.status = 'upcoming'
        ORDER BY m.date
        LIMIT ?
    """,
        (num_matches,),
    )

    matches = cursor.fetchall()

    if not matches:
        print("⚠️  No matches with predictions found")
        # Fallback: get any upcoming matches
        cursor.execute(
            """
            SELECT id, homeTeam, awayTeam, date
            FROM matches
            WHERE status = 'upcoming'
            ORDER BY date
            LIMIT ?
        """,
            (num_matches,),
        )
        matches = cursor.fetchall()

    if not matches:
        print("❌ No upcoming matches found in database")
        conn.close()
        return

    updated = 0
    now = datetime.now().isoformat()

    for match in matches:
        match_id, home_team, away_team, match_date = match

        # Try to find a realistic result for this matchup
        result = None
        for preset in REALISTIC_RESULTS:
            if preset[0] == home_team and preset[1] == away_team:
                result = preset
                break

        # If no preset found, generate random realistic scores
        if result:
            home_score = result[2]
            away_score = result[3]
        else:
            import random

            # Weighted towards lower scores (more realistic)
            weights = [25, 30, 25, 15, 5]  # 0-4 goals
            home_score = random.choices(range(5), weights=weights)[0]
            away_score = random.choices(range(5), weights=weights)[0]

        # Update match to finished with scores
        cursor.execute(
            """
            UPDATE matches
            SET status = 'finished',
                homeScore = ?,
                awayScore = ?,
                updatedAt = ?,
                manualOverride = 1
            WHERE id = ?
        """,
            (home_score, away_score, now, match_id),
        )

        updated += 1
        print(
            f"✅ Finished: {home_team} {home_score}-{away_score} {away_team} (Match ID: {match_id})"
        )

    conn.commit()

    # Now trigger points calculation by checking predictions
    cursor.execute("""
        SELECT p.id, p.matchId, p.homeScore, p.awayScore,
               m.homeScore as actualHome, m.awayScore as actualAway,
               m.homeTeam, m.awayTeam
        FROM predictions p
        INNER JOIN matches m ON p.matchId = m.id
        WHERE m.status = 'finished' AND p.points IS NULL
    """)

    predictions_to_update = cursor.fetchall()

    if predictions_to_update:
        print(
            f"\n📊 Found {len(predictions_to_update)} predictions to calculate points for..."
        )

        for pred in predictions_to_update:
            (
                pred_id,
                match_id,
                pred_home,
                pred_away,
                actual_home,
                actual_away,
                home_team,
                away_team,
            ) = pred

            # Calculate points (same logic as backend)
            points = 0
            breakdown = "no_match"

            # Exact result = 5 points
            if pred_home == actual_home and pred_away == actual_away:
                points = 5
                breakdown = "exact_result"
            else:
                # Determine predicted and actual winner
                pred_winner = (
                    "home"
                    if pred_home > pred_away
                    else ("away" if pred_away > pred_home else "draw")
                )
                actual_winner = (
                    "home"
                    if actual_home > actual_away
                    else ("away" if actual_away > actual_home else "draw")
                )

                # Correct winner + goal difference = 3 points
                if pred_winner == actual_winner and abs(pred_home - pred_away) == abs(
                    actual_home - actual_away
                ):
                    points = 3
                    breakdown = "winner_and_goal_diff"
                # Correct winner only = 1 point
                elif pred_winner == actual_winner:
                    points = 1
                    breakdown = "winner_only"
                # One correct score = 2 points
                elif pred_home == actual_home or pred_away == actual_away:
                    points = 2
                    breakdown = "one_score_correct"

            # Update prediction with points
            cursor.execute(
                """
                UPDATE predictions
                SET points = ?,
                    pointsBreakdown = ?,
                    notified = 0,
                    updatedAt = ?
                WHERE id = ?
            """,
                (points, breakdown, now, pred_id),
            )

            print(
                f"   📈 {home_team} vs {away_team}: Prediction {pred_home}-{pred_away} | Actual {actual_home}-{actual_away} → {points} pts ({breakdown})"
            )

    conn.commit()
    conn.close()

    print(f"\n🎉 Successfully updated {updated} matches to 'finished' status")
    if predictions_to_update:
        print(f"📊 Calculated points for {len(predictions_to_update)} predictions")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Update matches to finished status with scores"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=10,
        help="Number of matches to mark as finished (default: 10)",
    )

    args = parser.parse_args()

    print(f"🏁 Marking {args.count} matches as finished...")
    update_match_status(args.count)
