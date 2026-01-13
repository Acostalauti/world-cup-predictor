import json
import requests
from datetime import datetime
from typing import Dict, List, Optional

import pandas as pd


# API oficial de FIFA para partidos del Mundial 2026
FIFA_API_URL = "https://api.fifa.com/api/v3/calendar/matches"
FIFA_SEASON_ID = "285023"  # ID de la temporada de la Copa Mundial 2026


def get_team_name(team_dict: Optional[Dict]) -> Optional[str]:
    """
    Extrae el nombre del equipo del diccionario.
    """
    if not team_dict or not isinstance(team_dict, dict):
        return None
    
    # Intentar múltiples campos posibles para el nombre del equipo
    for key in ["TeamName", "Name", "ShortName", "Abbreviation", "Code"]:
        name = team_dict.get(key)
        if isinstance(name, list) and len(name) > 0:
            # Si es una lista, tomar el primer elemento
            name = name[0].get("Description") if isinstance(name[0], dict) else name[0]
        if name:
            return str(name)
    
    return None


def get_stadium_info(stadium_dict: Optional[Dict]) -> tuple[Optional[str], Optional[str]]:
    """
    Extrae nombre del estadio y ciudad del diccionario.
    Retorna (stadium_name, city_name)
    """
    if not stadium_dict or not isinstance(stadium_dict, dict):
        return None, None
    
    stadium_name = None
    city_name = None
    
    # Buscar nombre del estadio
    for key in ["Name", "StadiumName"]:
        if stadium_dict.get(key):
            val = stadium_dict[key]
            if isinstance(val, list) and len(val) > 0:
                stadium_name = val[0].get("Description") if isinstance(val[0], dict) else val[0]
            else:
                stadium_name = val
            break
    
    # Buscar ciudad
    city_info = stadium_dict.get("CityName") or stadium_dict.get("City")
    if city_info:
        if isinstance(city_info, list) and len(city_info) > 0:
            city_name = city_info[0].get("Description") if isinstance(city_info[0], dict) else city_info[0]
        else:
            city_name = city_info
    
    return stadium_name, city_name


def normalize_match(match: Dict) -> Dict:
    """
    Normaliza un partido de la API de FIFA a un formato estándar.
    """
    # Equipos
    home_team = get_team_name(match.get("Home"))
    away_team = get_team_name(match.get("Away"))
    
    # Estadio y ciudad
    stadium_name, city_name = get_stadium_info(match.get("Stadium"))
    
    # Fecha y hora (formato ISO)
    date_str = match.get("Date")
    kickoff_parsed = None
    if date_str:
        try:
            kickoff_parsed = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except Exception:
            pass
    
    # Fase/Ronda
    stage_name = None
    stage = match.get("StageName")
    if stage and isinstance(stage, list) and len(stage) > 0:
        stage_name = stage[0].get("Description") if isinstance(stage[0], dict) else stage[0]
    
    # Grupo
    group_name = None
    group = match.get("GroupName")
    if group and isinstance(group, list) and len(group) > 0:
        group_name = group[0].get("Description") if isinstance(group[0], dict) else group[0]
    
    return {
        "match_id": match.get("IdMatch") or match.get("MatchId"),
        "match_number": match.get("MatchNumber"),
        "stage": stage_name,
        "group": group_name,
        "date": date_str,
        "kickoff_parsed": kickoff_parsed,
        "home_team": home_team,
        "away_team": away_team,
        "stadium": stadium_name,
        "city": city_name,
        "home_score": match.get("HomeTeamScore"),
        "away_score": match.get("AwayTeamScore"),
        "match_status": match.get("MatchStatus"),
    }


def scrape_fifa_fixture(language: str = "es", max_matches: int = 500) -> pd.DataFrame:
    """
    Obtiene los partidos del Mundial 2026 desde la API oficial de FIFA.
    
    Args:
        language: Código de idioma (es, en, etc.)
        max_matches: Número máximo de partidos a obtener
    
    Returns:
        DataFrame con los fixtures del Mundial 2026
    """
    params = {
        "language": language,
        "count": max_matches,
        "idSeason": FIFA_SEASON_ID,
    }
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }
    
    print(f"Obteniendo fixtures desde la API de FIFA...")
    response = requests.get(FIFA_API_URL, params=params, headers=headers, timeout=30)
    response.raise_for_status()
    
    data = response.json()
    
    # Los partidos están en el campo "Results"
    matches = data.get("Results", [])
    
    if not matches:
        raise RuntimeError("No se encontraron partidos en la respuesta de la API")
    
    print(f"Se encontraron {len(matches)} partidos")
    
    # Normalizar todos los partidos
    rows = [normalize_match(match) for match in matches]
    
    # Crear DataFrame
    df = pd.DataFrame(rows)
    
    # Ordenar por fecha
    df = df.sort_values("date", na_position="last").reset_index(drop=True)
    
    return df


if __name__ == "__main__":
    df = scrape_fifa_fixture(language="es")

    # Guardar fixture
    df.to_csv("fixture_mundial_2026.csv", index=False, encoding="utf-8")
    df.to_json("fixture_mundial_2026.json", orient="records", force_ascii=False, indent=2)

    print(f"\nOK -> fixture_mundial_2026.csv / fixture_mundial_2026.json")
    print(f"Total de partidos: {len(df)}")
    print("\n=== Primeros 10 partidos ===")
    print(df.head(10).to_string())