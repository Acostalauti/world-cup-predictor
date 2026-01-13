import requests
import json

# Intentar diferentes endpoints de la API de FIFA
base_url = "https://cxm-api.fifa.com/fifaplusweb/api"

endpoints_to_try = [
    "/fixtures",
    "/matches",
    "/calendar/fixtures/17",  # 17 might be the tournament ID
    "/calendar/17",
    "/tournaments/mens/worldcup/canadamexicousa2026/matches",
    "/tournaments/17/matches",
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}

print("Probando endpoints de la API de FIFA...\n")

for endpoint in endpoints_to_try:
    url = base_url + endpoint
    print(f"Intentando: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"  ✓ JSON válido recibido")
                print(f"  Claves: {list(data.keys()) if isinstance(data, dict) else 'Es una lista'}")
                
                # Guardar el primero que funcione
                with open(f"fifa_api_response_{endpoint.replace('/', '_')}.json", "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"  Guardado en fifa_api_response_{endpoint.replace('/', '_')}.json")
                
                # Si encontramos datos de matches/fixtures, mostrar un ejemplo
                if isinstance(data, dict):
                    for key in ['matches', 'fixtures', 'data', 'results']:
                        if key in data and data[key]:
                            print(f"  Encontrado campo '{key}' con datos")
                            break
                
            except json.JSONDecodeError:
                print(f"  ✗ No es JSON válido")
        elif response.status_code == 404:
            print(f"  ✗ No encontrado")
        else:
            print(f"  ? Otro código de estado")
            
    except requests.exceptions.Timeout:
        print(f"  ✗ Timeout")
    except requests.exceptions.RequestException as e:
        print(f"  ✗ Error: {e}")
    
    print()

print("\nProbando también con la estructura de la URL que viste:")
# Basado en la URL que el usuario proporcionó
api_url = "https://cxm-api.fifa.com/fifaplusweb/api/calendar/matches?idCompetition=17"
print(f"Intentando: {api_url}")

try:
    response = requests.get(api_url, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ JSON válido recibido")
        
        with open("fifa_api_calendar_matches.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Guardado en fifa_api_calendar_matches.json")
        
except Exception as e:
    print(f"Error: {e}")
