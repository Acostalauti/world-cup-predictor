#!/usr/bin/env python3
"""
Test database initialization with fixtures
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.db import db

if __name__ == "__main__":
    print("="*70)
    print("TESTING DATABASE INITIALIZATION")
    print("="*70)
    
    # Get all matches
    all_matches = db.get_matches()
    print(f"\n✅ Database contains {len(all_matches)} matches")
    
    if len(all_matches) == 0:
        print("❌ ERROR: No matches loaded in database!")
        sys.exit(1)
    
    # Show some statistics
    upcoming = db.get_matches(status="upcoming")
    print(f"   - Upcoming matches: {len(upcoming)}")
    
    # Show first 5 matches
    print("\n" + "="*70)
    print("FIRST 5 MATCHES IN DATABASE:")
    print("="*70)
    for i, match in enumerate(all_matches[:5]):
        print(f"\n{i+1}. Match #{match.matchNumber}: {match.homeTeam} {match.homeFlag} vs {match.awayFlag} {match.awayTeam}")
        print(f"   Date: {match.date} at {match.time}")
        print(f"   Venue: {match.stadium}, {match.city}")
        print(f"   Group: {match.group}")
    
    # Show group A matches
    group_a_matches = [m for m in all_matches if m.group == "Grupo A"]
    print("\n" + "="*70)
    print(f"GRUPO A MATCHES ({len(group_a_matches)} matches):")
    print("="*70)
    for match in group_a_matches[:6]:  # Show first 6
        print(f"  Match #{match.matchNumber}: {match.homeTeam} vs {match.awayTeam} on {match.date}")
    
    # Check other database components
    users = list(db.users.values())
    groups = list(db.groups.values())
    print("\n" + "="*70)
    print("OTHER DATABASE DATA:")
    print("="*70)
    print(f"  Users: {len(users)}")
    print(f"  Groups: {len(groups)}")
    
    print("\n" + "="*70)
    print("✅ DATABASE INITIALIZATION TEST PASSED!")
    print("="*70)
