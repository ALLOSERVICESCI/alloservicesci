#!/usr/bin/env python3
"""
Backend API Testing Suite for Allô Services CI
Tests all endpoints specified in the review request:
1) Auth: POST /api/auth/register 
2) Users: PATCH /api/users/<id>
3) Subscriptions: GET /api/subscriptions/check?user_id=<id>
4) Alerts: GET /api/alerts, POST /api/alerts, GET /api/alerts/unread_count?user_id=<id>
5) Pharmacies: GET /api/pharmacies (various filters)
6) Payments: POST /api/payments/cinetpay/initiate
7) AI: POST /api/ai/chat (stream=false)
8) Health: GET /api/health/facilities (new APIs)
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://allo-services-2.preview.emergentagent.com/api"

def test_review_request_complete():
    """Complete backend regression test according to review request"""
    print("🎯 BACKEND REGRESSION TEST SUITE - REVIEW REQUEST VALIDATION")
    print("=" * 70)
    
    results = {
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0
    }
    
    def log_test(test_name, status, details=""):
        """Log test results with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"[{timestamp}] {status_icon} {test_name}")
        if details:
            print(f"    {details}")
        results["total_tests"] += 1
        if status == "PASS":
            results["passed_tests"] += 1
        else:
            results["failed_tests"] += 1

    # Test 1: Auth Register
    print("\n=== TEST 1: AUTH REGISTER ===")
    user_id = None
    payload = {
        "first_name": "Jean-Baptiste",
        "last_name": "Kouame", 
        "email": "jean.kouame@example.ci",
        "phone": "+225 07 12 34 56 78",
        "preferred_lang": "fr",
        "city": "Abidjan"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            user_id = data.get('id')
            if user_id:
                log_test("POST /api/auth/register", "PASS", 
                        f"User created with ID: {user_id}. Note: pseudo/show_pseudo not supported by current backend")
            else:
                log_test("POST /api/auth/register", "FAIL", "No user ID returned")
        else:
            log_test("POST /api/auth/register", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /api/auth/register", "FAIL", f"Exception: {str(e)}")

    # Test 2: Users Update
    print("\n=== TEST 2: USERS UPDATE ===")
    if user_id:
        payload = {
            "city": "Yamoussoukro",
            "email": "jean.updated@example.ci", 
            "phone": "+225 01 02 03 04 05"
        }
        
        try:
            response = requests.patch(f"{BACKEND_URL}/users/{user_id}", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                log_test("PATCH /api/users/<id>", "PASS", 
                        f"User updated: city={data.get('city')}, email={data.get('email')}. Note: pseudo/show_pseudo not supported")
            else:
                log_test("PATCH /api/users/<id>", "FAIL", 
                        f"Status {response.status_code}: {response.text}")
        except Exception as e:
            log_test("PATCH /api/users/<id>", "FAIL", f"Exception: {str(e)}")
    else:
        log_test("PATCH /api/users/<id>", "FAIL", "No user_id from previous test")

    # Test 3: Subscriptions Check
    print("\n=== TEST 3: SUBSCRIPTIONS CHECK ===")
    if user_id:
        try:
            response = requests.get(f"{BACKEND_URL}/subscriptions/check?user_id={user_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                is_premium = data.get('is_premium')
                expires_at = data.get('expires_at')
                log_test("GET /api/subscriptions/check", "PASS", 
                        f"is_premium: {is_premium}, expires_at: {expires_at}")
            else:
                log_test("GET /api/subscriptions/check", "FAIL", 
                        f"Status {response.status_code}: {response.text}")
        except Exception as e:
            log_test("GET /api/subscriptions/check", "FAIL", f"Exception: {str(e)}")
    else:
        log_test("GET /api/subscriptions/check", "FAIL", "No user_id from previous test")

    # Test 4: Alerts Endpoints
    print("\n=== TEST 4: ALERTS ENDPOINTS ===")
    
    # GET /api/alerts
    try:
        response = requests.get(f"{BACKEND_URL}/alerts", timeout=10)
        if response.status_code == 200:
            alerts = response.json()
            log_test("GET /api/alerts", "PASS", f"Retrieved {len(alerts)} alerts")
        else:
            log_test("GET /api/alerts", "FAIL", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/alerts", "FAIL", f"Exception: {str(e)}")
    
    # POST /api/alerts
    alert_payload = {
        "title": "Test Alerte Sécurité",
        "type": "accident", 
        "description": "Accident de circulation sur l'autoroute du Nord, voie bloquée",
        "city": "Abidjan"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/alerts", json=alert_payload, timeout=10)
        if response.status_code == 200:
            alert_data = response.json()
            alert_id = alert_data.get('id')
            log_test("POST /api/alerts", "PASS", f"Alert created with ID: {alert_id}")
            
            # Verify alert appears in GET /api/alerts
            response = requests.get(f"{BACKEND_URL}/alerts", timeout=10)
            if response.status_code == 200:
                alerts = response.json()
                found = any(a.get('id') == alert_id for a in alerts)
                if found:
                    log_test("GET /api/alerts verification", "PASS", "New alert found in list")
                else:
                    log_test("GET /api/alerts verification", "FAIL", "New alert not found in list")
        else:
            log_test("POST /api/alerts", "FAIL", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /api/alerts", "FAIL", f"Exception: {str(e)}")
    
    # GET /api/alerts/unread_count
    if user_id:
        try:
            response = requests.get(f"{BACKEND_URL}/alerts/unread_count?user_id={user_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                count = data.get('count')
                log_test("GET /api/alerts/unread_count", "PASS", f"Unread count: {count}")
            else:
                log_test("GET /api/alerts/unread_count", "FAIL", f"Status {response.status_code}: {response.text}")
        except Exception as e:
            log_test("GET /api/alerts/unread_count", "FAIL", f"Exception: {str(e)}")

    # Test 5: Pharmacies Endpoints
    print("\n=== TEST 5: PHARMACIES ENDPOINTS ===")
    
    # No filters
    try:
        response = requests.get(f"{BACKEND_URL}/pharmacies", timeout=10)
        if response.status_code == 200:
            pharmacies = response.json()
            log_test("GET /api/pharmacies (no filters)", "PASS", 
                    f"Retrieved {len(pharmacies)} pharmacies")
        else:
            log_test("GET /api/pharmacies (no filters)", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/pharmacies (no filters)", "FAIL", f"Exception: {str(e)}")
    
    # City filter (Abidjan)
    try:
        response = requests.get(f"{BACKEND_URL}/pharmacies?city=Abidjan", timeout=10)
        if response.status_code == 200:
            pharmacies = response.json()
            log_test("GET /api/pharmacies?city=Abidjan", "PASS", 
                    f"Retrieved {len(pharmacies)} pharmacies in Abidjan")
        else:
            log_test("GET /api/pharmacies?city=Abidjan", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/pharmacies?city=Abidjan", "FAIL", f"Exception: {str(e)}")
    
    # on_duty filter
    try:
        response = requests.get(f"{BACKEND_URL}/pharmacies?on_duty=true", timeout=10)
        if response.status_code == 200:
            pharmacies = response.json()
            on_duty_count = len([p for p in pharmacies if p.get('on_duty') == True])
            log_test("GET /api/pharmacies?on_duty=true", "PASS", 
                    f"Retrieved {len(pharmacies)} pharmacies, {on_duty_count} on duty")
        else:
            log_test("GET /api/pharmacies?on_duty=true", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/pharmacies?on_duty=true", "FAIL", f"Exception: {str(e)}")
    
    # Near location (Abidjan coordinates)
    try:
        response = requests.get(f"{BACKEND_URL}/pharmacies?near_lat=5.33&near_lng=-4.03&max_km=10", timeout=10)
        if response.status_code == 200:
            pharmacies = response.json()
            log_test("GET /api/pharmacies (near Abidjan)", "PASS", 
                    f"Retrieved {len(pharmacies)} pharmacies near Abidjan")
        else:
            log_test("GET /api/pharmacies (near Abidjan)", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/pharmacies (near Abidjan)", "FAIL", f"Exception: {str(e)}")

    # Test 6: Payments CinetPay
    print("\n=== TEST 6: PAYMENTS CINETPAY ===")
    if user_id:
        payload = {
            "user_id": user_id,
            "amount_fcfa": 1200
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/payments/cinetpay/initiate", json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                payment_url = data.get('payment_url')
                transaction_id = data.get('transaction_id')
                
                if payment_url and transaction_id:
                    log_test("POST /api/payments/cinetpay/initiate", "PASS", 
                            f"payment_url: {payment_url[:50]}..., transaction_id: {transaction_id}")
                else:
                    log_test("POST /api/payments/cinetpay/initiate", "FAIL", 
                            "Missing payment_url or transaction_id in response")
            else:
                log_test("POST /api/payments/cinetpay/initiate", "FAIL", 
                        f"Status {response.status_code}: {response.text}")
        except Exception as e:
            log_test("POST /api/payments/cinetpay/initiate", "FAIL", f"Exception: {str(e)}")
    else:
        log_test("POST /api/payments/cinetpay/initiate", "FAIL", "No user_id from previous test")

    # Test 7: AI Chat
    print("\n=== TEST 7: AI CHAT ===")
    payload = {
        "messages": [
            {"role": "user", "content": "Parlez-moi d'Abidjan en quelques mots"}
        ],
        "stream": False
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/ai/chat", json=payload, timeout=20)
        if response.status_code == 200:
            response_text = response.text
            if "Abidjan" in response_text:
                log_test("POST /api/ai/chat (stream=false)", "PASS", 
                        f"AI response received about Abidjan: {response_text[:100]}...")
            else:
                log_test("POST /api/ai/chat (stream=false)", "FAIL", 
                        f"Unexpected response content: {response_text[:100]}...")
        else:
            log_test("POST /api/ai/chat (stream=false)", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /api/ai/chat (stream=false)", "FAIL", f"Exception: {str(e)}")

    # Test 8: Health Facilities (NEW HEALTH APIs)
    print("\n=== TEST 8: HEALTH FACILITIES (NEW APIs) ===")
    
    # Default (city=Abidjan)
    try:
        response = requests.get(f"{BACKEND_URL}/health/facilities", timeout=10)
        if response.status_code == 200:
            facilities = response.json()
            if len(facilities) >= 1:
                log_test("GET /api/health/facilities (default city=Abidjan)", "PASS", 
                        f"Retrieved {len(facilities)} health facilities")
            else:
                log_test("GET /api/health/facilities (default city=Abidjan)", "FAIL", 
                        "No health facilities found - expected at least 1")
        else:
            log_test("GET /api/health/facilities (default)", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/health/facilities (default)", "FAIL", f"Exception: {str(e)}")
    
    # Commune filter (Cocody)
    try:
        response = requests.get(f"{BACKEND_URL}/health/facilities?commune=Cocody", timeout=10)
        if response.status_code == 200:
            facilities = response.json()
            log_test("GET /api/health/facilities?commune=Cocody", "PASS", 
                    f"Retrieved {len(facilities)} facilities in Cocody")
        else:
            log_test("GET /api/health/facilities?commune=Cocody", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/health/facilities?commune=Cocody", "FAIL", f"Exception: {str(e)}")
    
    # Near location (CHU d'Angré coordinates)
    try:
        response = requests.get(f"{BACKEND_URL}/health/facilities?near_lat=5.401012&near_lng=-3.957433&max_km=5", timeout=10)
        if response.status_code == 200:
            facilities = response.json()
            if len(facilities) >= 1:
                log_test("GET /api/health/facilities (near CHU Angré)", "PASS", 
                        f"Retrieved {len(facilities)} facilities near CHU Angré")
            else:
                log_test("GET /api/health/facilities (near CHU Angré)", "FAIL", 
                        "No facilities found near CHU Angré - expected at least 1")
        else:
            log_test("GET /api/health/facilities (near location)", "FAIL", 
                    f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/health/facilities (near location)", "FAIL", f"Exception: {str(e)}")

    # Final Results
    print("\n" + "=" * 70)
    print("🎯 FINAL RESULTS")
    print("=" * 70)
    print(f"Total Tests: {results['total_tests']}")
    print(f"✅ Passed: {results['passed_tests']}")
    print(f"❌ Failed: {results['failed_tests']}")
    
    success_rate = (results['passed_tests'] / results['total_tests']) * 100 if results['total_tests'] > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")
    
    if results['failed_tests'] == 0:
        print("\n🎉 ALL BACKEND TESTS PASSED - REGRESSION VALIDATION SUCCESSFUL!")
        return 0
    else:
        print(f"\n⚠️  {results['failed_tests']} TESTS FAILED - ISSUES DETECTED")
        return 1

if __name__ == "__main__":
    exit_code = test_review_request_complete()
    sys.exit(exit_code)