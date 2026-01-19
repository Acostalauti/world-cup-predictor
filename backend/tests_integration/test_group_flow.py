def test_group_flow(client):
    # 1. Register two users: Admin and Player
    # Admin
    resp_admin = client.post("/api/auth/register", json={
        "email": "admin_group@example.com",
        "password": "password123",
        "name": "Group Admin"
    })
    assert resp_admin.status_code == 201
    admin_token = resp_admin.json()["token"]

    # Player
    resp_player = client.post("/api/auth/register", json={
        "email": "player_group@example.com",
        "password": "password123",
        "name": "Group Player"
    })
    assert resp_player.status_code == 201
    player_token = resp_player.json()["token"]

    # 2. Admin creates a group
    group_resp = client.post("/api/groups", json={
        "name": "Integration Group",
        "description": "Integration Test Group",
        "scoringSystem": "classic"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    
    assert group_resp.status_code == 201
    group_data = group_resp.json()
    group_id = group_data["id"]
    code = group_data["inviteCode"]
    assert group_data["name"] == "Integration Group"
    assert group_data["playerCount"] == 1 # Admin is automatically added

    # 3. Player joins the group using the code
    join_resp = client.post(f"/api/groups/join", json={
        "inviteCode": code
    }, headers={"Authorization": f"Bearer {player_token}"})
    
    assert join_resp.status_code == 200
    join_data = join_resp.json()
    assert join_data["name"] == "Integration Group"

    # 4. Verify player count is now 2
    # We can fetch the group list or details if available, 
    # but for now let's list groups as the player
    list_resp = client.get("/api/groups", headers={"Authorization": f"Bearer {player_token}"})
    assert list_resp.status_code == 200
    groups = list_resp.json()
    # Find our group
    target_group = next((g for g in groups if g["id"] == group_id), None)
    assert target_group is not None
    assert target_group["playerCount"] == 2
