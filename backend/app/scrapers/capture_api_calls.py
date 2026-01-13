from playwright.sync_api import sync_playwright
import json

URL = "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures"

api_calls = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Interceptar todas las peticiones
    def handle_response(response):
        url = response.url
        # Filtrar solo peticiones a APIs
        if 'api' in url or 'json' in url:
            api_calls.append({
                'url': url,
                'status': response.status,
                'headers': dict(response.headers),
            })
            print(f"API Call: {url}")
            print(f"  Status: {response.status}")
            
            # Si es exitosa, intentar obtener el contenido
            if response.status == 200:
                try:
                    if 'json' in response.headers.get('content-type', ''):
                        data = response.json()
                        print(f"  ✓ JSON response")
                        
                        # Guardar
                        filename = url.split('/')[-1].split('?')[0] or 'response'
                        with open(f"api_call_{filename}.json", "w", encoding="utf-8") as f:
                            json.dump(data, f, indent=2, ensure_ascii=False)
                        print(f"  Guardado en api_call_{filename}.json")
                except Exception as e:
                    print(f"  Error procesando respuesta: {e}")
    
    page.on("response", handle_response)
    
    print("Navegando a la página y esperando peticiones API...")
    page.goto(URL, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(5000)
    
    browser.close()

print(f"\n\nTotal de peticiones API capturadas: {len(api_calls)}")

# Guardar todas las URLs de API
with open("api_urls.json", "w", encoding="utf-8") as f:
    json.dump(api_calls, f, indent=2)

print("URLs guardadas en api_urls.json")

# Mostrar las URLs únicas de API
unique_urls = set(call['url'] for call in api_calls if call['status'] == 200)
print(f"\nURLs de API exitosas ({len(unique_urls)}):")
for url in sorted(unique_urls):
    print(f"  - {url}")
