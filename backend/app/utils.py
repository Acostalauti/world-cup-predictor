import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional

SECRET_KEY = "mock_secret_key_for_development_only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

import bcrypt

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Team flags mapping for World Cup 2026 teams
TEAM_FLAGS = {
    # CONCACAF
    "México": "🇲🇽", "EE. UU.": "🇺🇸", "USA": "🇺🇸", "Canadá": "🇨🇦", "Canada": "🇨🇦",
    "Costa Rica": "🇨🇷", "Jamaica": "🇯🇲", "Panamá": "🇵🇦", "Panama": "🇵🇦",
    "Honduras": "🇭🇳", "Haití": "🇭🇹", "Haiti": "🇭🇹", "Curazao": "🇨🇼",
    
    # CONMEBOL
    "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Brazil": "🇧🇷", "Uruguay": "🇺🇾",
    "Colombia": "🇨🇴", "Ecuador": "🇪🇨", "Paraguay": "🇵🇾", "Chile": "🇨🇱",
    "Perú": "🇵🇪", "Peru": "🇵🇪", "Bolivia": "🇧🇴", "Venezuela": "🇻🇪",
    
    # UEFA
    "España": "🇪🇸", "Spain": "🇪🇸", "Alemania": "🇩🇪", "Germany": "🇩🇪",
    "Francia": "🇫🇷", "France": "🇫🇷", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Portugal": "🇵🇹", "Países Bajos": "🇳🇱", "Netherlands": "🇳🇱",
    "Bélgica": "🇧🇪", "Belgium": "🇧🇪", "Italia": "🇮🇹", "Italy": "🇮🇹",
    "Croacia": "🇭🇷", "Croatia": "🇭🇷", "Suiza": "🇨🇭", "Switzerland": "🇨🇭",
    "Dinamarca": "🇩🇰", "Denmark": "🇩🇰", "Suecia": "🇸🇪", "Sweden": "🇸🇪",
    "Noruega": "🇳🇴", "Norway": "🇳🇴", "Polonia": "🇵🇱", "Poland": "🇵🇱",
    "Ucrania": "🇺🇦", "Ukraine": "🇺🇦", "Serbia": "🇷🇸", "Austria": "🇦🇹",
    "República Checa": "🇨🇿", "Czech Republic": "🇨🇿",
    "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "Irlanda": "🇮🇪", "Ireland": "🇮🇪", "Turquía": "🇹🇷", "Turkey": "🇹🇷",
    "Rumania": "🇷🇴", "Romania": "🇷🇴", "Grecia": "🇬🇷", "Greece": "🇬🇷",
    
    # AFC
    "Japón": "🇯🇵", "Japan": "🇯🇵", "República de Corea": "🇰🇷", "South Korea": "🇰🇷", "Korea": "🇰🇷",
    "Australia": "🇦🇺", "Irán": "🇮🇷", "Iran": "🇮🇷",
    "Arabia Saudí": "🇸🇦", "Saudi Arabia": "🇸🇦", "Catar": "🇶🇦", "Qatar": "🇶🇦",
    "Irak": "🇮🇶", "Iraq": "🇮🇶", "Emiratos Árabes Unidos": "🇦🇪", "UAE": "🇦🇪",
    "Uzbekistán": "🇺🇿", "Uzbekistan": "🇺🇿", "Jordania": "🇯🇴", "Jordan": "🇯🇴",
    "China": "🇨🇳", "Tailandia": "🇹🇭", "Thailand": "🇹🇭",
    
    # CAF
    "Senegal": "🇸🇳", "Marruecos": "🇲🇦", "Morocco": "🇲🇦",
    "Túnez": "🇹🇳", "Tunisia": "🇹🇳", "Argelia": "🇩🇿", "Algeria": "🇩🇿",
    "Egipto": "🇪🇬", "Egypt": "🇪🇬", "Nigeria": "🇳🇬", "Ghana": "🇬🇭",
    "Camerún": "🇨🇲", "Cameroon": "🇨🇲", "Costa de Marfil": "🇨🇮", "Ivory Coast": "🇨🇮",
    "Malí": "🇲🇱", "Mali": "🇲🇱", "Burkina Faso": "🇧🇫",
    "Sudáfrica": "🇿🇦", "South Africa": "🇿🇦",
    "Islas de Cabo Verde": "🇨🇻", "Cape Verde": "🇨🇻",
    
    # OFC
    "Nueva Zelanda": "🇳🇿", "New Zealand": "🇳🇿",
}

def get_team_flag(team_name: Optional[str]) -> str:
    """Get the flag emoji for a team name."""
    if team_name is None or team_name == "TBD":
        return "🏴"  # Black flag for TBD teams
    return TEAM_FLAGS.get(team_name, "🏳️")  # White flag as default

