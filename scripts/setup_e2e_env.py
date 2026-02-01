#!/usr/bin/env python3
"""
Master script to set up complete E2E test environment.
Runs all seeding scripts in correct order.
"""

import subprocess
import sys


def run_script(script_name: str, args: list = None):
    """Run a script and handle errors"""
    cmd = [sys.executable, f"scripts/{script_name}"]
    if args:
        cmd.extend(args)

    print(f"\n{'=' * 60}")
    print(f"Running: {script_name}")
    print(f"{'=' * 60}")

    result = subprocess.run(cmd, capture_output=False)

    if result.returncode != 0:
        print(f"❌ Error running {script_name}")
        sys.exit(1)

    print(f"✅ {script_name} completed successfully")


def main():
    print("🚀 Setting up E2E test environment...")
    print("This will:")
    print("  1. Create 15 predictions for alice@example.com")
    print("  2. Mark 10 matches as finished with scores")
    print("  3. Calculate points for predictions")
    print("  4. Create test scenarios (live matches, edge cases)")
    print()

    # Step 1: Seed predictions
    run_script("seed_predictions.py", ["--count", "15"])

    # Step 2: Update match statuses to finished
    run_script("update_match_status.py", ["--count", "10"])

    # Step 3: Create test scenarios
    run_script("create_test_scenarios.py")

    print("\n" + "=" * 60)
    print("🎉 E2E TEST ENVIRONMENT READY!")
    print("=" * 60)
    print()
    print("📋 Next steps:")
    print("  1. Start backend: cd backend && uv run uvicorn app.main:app --reload")
    print("  2. Start frontend: cd frontend && npm run dev")
    print("  3. Login as: alice@example.com / password123")
    print("  4. Test features:")
    print("     - Ver Partidos page (109 matches, 15 predictions)")
    print("     - Mis Predicciones page (15 predictions, 21 points total)")
    print("     - NotificationCenter (10 unread notifications)")
    print("     - Filters (status, stage, group)")
    print()
    print("📊 Test Data Summary:")
    print("  - User: alice@example.com (user-1)")
    print("  - Predictions: 15 total")
    print("  - Finished matches: 10 (with points)")
    print("  - Live matches: 1")
    print("  - Upcoming matches: 98")
    print("  - Total points: 21")
    print("  - Perfect predictions: 2 (5pts each)")
    print("  - Unread notifications: 10")
    print()


if __name__ == "__main__":
    main()
