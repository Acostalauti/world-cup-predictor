def test_auth_flow(client):
    # 1. Register a new user
    response = client.post("/api/auth/register", json={
        "email": "integration@example.com",
        "password": "password123",
        "name": "Integration User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "integration@example.com"
    token = data["token"]

    # 2. Login with the registered user
    response = client.post("/api/auth/login", json={
        "email": "integration@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    login_data = response.json()
    assert "token" in login_data
    assert login_data["token"] != ""

    # 3. Verify "Me" endpoint using the token
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    me_data = response.json()
    assert me_data["email"] == "integration@example.com"
    assert me_data["name"] == "Integration User"
