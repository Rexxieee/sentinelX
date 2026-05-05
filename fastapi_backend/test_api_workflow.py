import requests
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_workflow():
    print("--- Starting API Workflow Test ---")
    
    # 1. Register
    ts = int(time.time())
    username = f"admin_{ts}"
    reg_data = {
        "username": username,
        "email": f"eng_{ts}@sentinelx.com",
        "password": "SecurePassword123",
        "role": "admin"
    }
    print(f"Registering user: {reg_data['username']}...")
    resp = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    print(f"Register Status: {resp.status_code}")
    
    # 2. Login
    login_data = {
        "username": username,
        "password": "SecurePassword123"
    }
    print(f"Logging in...")
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code}, {resp.json()}")
        return

    token = resp.json().get("access_token")
    print(f"Login Status: {resp.status_code}, Token obtained: {token[:10]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Check DB Health
    print("Checking DB Health...")
    resp = requests.get("http://localhost:8000/health/db", headers=headers)
    print(f"DB Health: {resp.status_code}, Response: {resp.json()}")
    
    # 4. Alert Rules Testing
    print("Testing Alert Rules...")
    rule_data = {
        "name": "SQL Injection Pattern",
        "condition_logic": {"field": "payload", "operator": "contains", "value": "SELECT"},
        "severity": "critical"
    }
    resp = requests.post(f"{BASE_URL}/alert-rules/", json=rule_data, headers=headers)
    print(f"Create Rule: {resp.status_code}")
    rule_id = resp.json().get("id")
    
    resp = requests.get(f"{BASE_URL}/alert-rules/", headers=headers)
    print(f"List Rules Count: {len(resp.json())}")
    
    # 5. Fetch Recent Events
    print("Fetching recent events...")
    time.sleep(2) 
    resp = requests.get(f"{BASE_URL}/events/recent", headers=headers)
    print(f"Events Status: {resp.status_code}")
    
    # 6. Danger Zone Testing (Reset)
    print("Testing Danger Zone Reset...")
    resp = requests.delete(f"{BASE_URL}/alert-rules/", headers=headers)
    print(f"Reset Rules Status: {resp.status_code}")
    
    resp = requests.delete(f"{BASE_URL}/incidents/reset", headers=headers)
    print(f"Reset System Data (Flush Cache) Status: {resp.status_code}")
    
    print("--- Test Complete ---")

if __name__ == "__main__":
    try:
        test_workflow()
    except Exception as e:
        print(f"Test failed: {e}")
