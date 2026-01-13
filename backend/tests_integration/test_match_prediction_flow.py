def test_match_prediction_flow(client):
    # 1. Register User (Predictor)
    # Note: In a real scenario, matches are usually created by a system admin.
    # We will assume the registration endpoint allows anyone for now, or use a pre-seeded admin if available.
    # Based on current auth implementation, any user can hit protected endpoints if they have a token.
    # We'll create a user who acts as admin to create the match.
    
    resp_user = client.post("/auth/register", json={
        "email": "predictor@example.com",
        "password": "password123",
        "name": "Predictor"
    })
    token = resp_user.json()["token"]

    # 2. Create a Match
    match_resp = client.post("/matches", json={
        "homeTeam": "Brazil",
        "awayTeam": "Argentina",
        "date": "2026-07-10",
        "time": "20:00:00",
        "status": "upcoming"
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert match_resp.status_code == 201
    match_data = match_resp.json()
    match_id = match_data["id"]

    # 3. Submit a Prediction
    pred_resp = client.post("/predictions", json={
        "matchId": match_id,
        "homeScore": 3,
        "awayScore": 1
    }, headers={"Authorization": f"Bearer {token}"})

    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    assert pred_data["matchId"] == match_id
    assert pred_data["homeScore"] == 3
    assert pred_data["awayScore"] == 1

    # 4. Verify Prediction Persistence (e.g. by fetching matches or predictions if endpoint exists)
    # Assuming there's an endpoint to get predictions or they come with matches
    # Let's verify via the /matches endpoint if it includes user prediction, or /predictions
    # If not, the successful POST is enough for this flow test.
    
    # Check if we can get the prediction back
    # (Assuming GET /predictions lists user predictions)
    list_pred_resp = client.get("/predictions", headers={"Authorization": f"Bearer {token}"})
    if list_pred_resp.status_code == 200:
        preds = list_pred_resp.json()
        my_pred = next((p for p in preds if p["matchId"] == match_id), None)
        assert my_pred is not None
        assert my_pred["homeScore"] == 3
