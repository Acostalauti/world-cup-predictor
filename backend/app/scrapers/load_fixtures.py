"""
Load World Cup 2026 fixtures from JSON file into the database.
"""
import json
from datetime import datetime
from pathlib import Path
from app.models import Match
from app.utils import get_team_flag

def load_fixtures_from_json(json_path: str) -> list[Match]:
    """
    Load fixtures from the FIFA fixture JSON file.
    
    Args:
        json_path: Path to the fixture_mundial_2026.json file
        
    Returns:
        List of Match objects
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        fixtures = json.load(f)
    
    matches = []
    for fixture in fixtures:
        # Handle null team names
        home_team = fixture.get("home_team") or "TBD"
        away_team = fixture.get("away_team") or "TBD"
        
        # Parse the date from ISO format
        date_str = fixture.get("date")
        if date_str:
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
            time_str = datetime.fromisoformat(date_str.replace('Z', '+00:00')).strftime("%H:%M")
        else:
            date_obj = None
            time_str = None
        
        # Determine match status (1 = upcoming in the JSON)
        match_status_code = fixture.get("match_status", 1)
        if match_status_code == 1:
            status = "upcoming"
        elif match_status_code == 2:
            status = "live"
        else:
            status = "finished"
        
        # Create Match object
        match = Match(
            id=fixture.get("match_id", f"match-{fixture.get('match_number')}"),
            homeTeam=home_team,
            awayTeam=away_team,
            homeFlag=get_team_flag(home_team),
            awayFlag=get_team_flag(away_team),
            date=date_obj,
            time=time_str,
            status=status,
            homeScore=fixture.get("home_score"),
            awayScore=fixture.get("away_score"),
            matchNumber=fixture.get("match_number"),
            stage=fixture.get("stage"),
            group=fixture.get("group"),
            stadium=fixture.get("stadium"),
            city=fixture.get("city")
        )
        matches.append(match)
    
    return matches


if __name__ == "__main__":
    # Load fixtures
    current_dir = Path(__file__).parent
    json_path = current_dir / "fixture_mundial_2026.json"
    
    matches = load_fixtures_from_json(str(json_path))
    
    print(f"✅ Loaded {len(matches)} matches from fixture file")
    print(f"\nFirst match:")
    print(f"  {matches[0].homeTeam} {matches[0].homeFlag} vs {matches[0].awayFlag} {matches[0].awayTeam}")
    print(f"  Date: {matches[0].date} at {matches[0].time}")
    print(f"  Venue: {matches[0].stadium}, {matches[0].city}")
    print(f"  Group: {matches[0].group}")
    
    print(f"\nLast match:")
    print(f"  {matches[-1].homeTeam} {matches[-1].homeFlag} vs {matches[-1].awayFlag} {matches[-1].awayTeam}")
    print(f"  Date: {matches[-1].date} at {matches[-1].time}")
    print(f"  Venue: {matches[-1].stadium}, {matches[-1].city}")
    
    # Show some TBD teams
    tbd_matches = [m for m in matches if m.homeTeam == "TBD" or m.awayTeam == "TBD"]
    print(f"\n⚠️  Found {len(tbd_matches)} matches with TBD teams (playoffs/qualifiers)")
    if tbd_matches:
        print(f"  Example: Match #{tbd_matches[0].matchNumber} - {tbd_matches[0].homeTeam} vs {tbd_matches[0].awayTeam}")
