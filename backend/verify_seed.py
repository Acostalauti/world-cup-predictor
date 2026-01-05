import httpx

def verify_seed():
    base_url = "http://localhost:8000"
    
    # Login as admin
    try:
        response = httpx.post(f"{base_url}/auth/login", json={"email": "admin@example.com", "password": "password123"})
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        token = response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")

        # Check Groups
        response = httpx.get(f"{base_url}/groups?filter=all", headers=headers)
        if response.status_code == 200:
            groups = response.json()
            print(f"Groups found: {len(groups)}")
            for g in groups:
                 print(f" - {g['name']}")
        else:
            print(f"Failed to list groups: {response.text}")

        # Check Matches
        response = httpx.get(f"{base_url}/matches", headers=headers)
        if response.status_code == 200:
            matches = response.json()
            print(f"Matches found: {len(matches)}")
            for m in matches:
                print(f" - {m['homeTeam']} vs {m['awayTeam']}")
        else:
             print(f"Failed to list matches: {response.text}")

    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    verify_seed()
