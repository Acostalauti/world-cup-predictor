#!/usr/bin/env python3
"""
Quick test script to verify fixture loading
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.scrapers.load_fixtures import load_fixtures_from_json
from pathlib import Path

if __name__ == "__main__":
    # Load fixtures
    current_dir = Path(__file__).parent / "app" / "scrapers"
    json_path = current_dir / "fixture_mundial_2026.json"
    
    print(f"Loading fixtures from: {json_path}")
    print(f"File exists: {json_path.exists()}")
    
    if not json_path.exists():
        print("ERROR: Fixture file not found!")
        sys.exit(1)
    
    matches = load_fixtures_from_json(str(json_path))
    
    print(f"\n✅ Loaded {len(matches)} matches from fixture file\n")
    print("="*70)
    print("FIRST MATCH:")
    print("="*70)
    print(f"  Match #{matches[0].matchNumber}: {matches[0].homeTeam} {matches[0].homeFlag} vs {matches[0].awayFlag} {matches[0].awayTeam}")
    print(f"  Date: {matches[0].date} at {matches[0].time}")
    print(f"  Venue: {matches[0].stadium}, {matches[0].city}")
    print(f"  Stage: {matches[0].stage}")
    print(f"  Group: {matches[0].group}")
    
    print("\n" + "="*70)
    print("LAST MATCH:")
    print("="*70)
    print(f"  Match #{matches[-1].matchNumber}: {matches[-1].homeTeam} {matches[-1].homeFlag} vs {matches[-1].awayFlag} {matches[-1].awayTeam}")
    print(f"  Date: {matches[-1].date} at {matches[-1].time}")
    print(f"  Venue: {matches[-1].stadium}, {matches[-1].city}")
    print(f"  Stage: {matches[-1].stage}")
    
    # Show some TBD teams
    tbd_matches = [m for m in matches if m.homeTeam == "TBD" or m.awayTeam == "TBD"]
    print("\n" + "="*70)
    print(f"⚠️  Found {len(tbd_matches)} matches with TBD teams (playoffs/qualifiers)")
    print("="*70)
    if tbd_matches:
        for i, match in enumerate(tbd_matches[:3]):  # Show first 3
            print(f"  Match #{match.matchNumber}: {match.homeTeam} vs {match.awayTeam}")
        if len(tbd_matches) > 3:
            print(f"  ... and {len(tbd_matches) - 3} more")
    
    print("\n" + "="*70)
    print("TESTING COMPLETE ✅")
    print("="*70)
