#!/usr/bin/env python3
"""
Backend Sanity Test Suite - Post Code Removal
Testing specific endpoints as requested in review:
1) GET /api/ → 200
2) GET /api/alerts → 200 + list array
3) GET /api/alerts/unread_count → 200 + count
4) GET /api/subscriptions/check?user_id=dummy → 200
5) POST /api/ai/export/docx with small content → 200 + docx content-type
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend configuration
BACKEND_URL = "https://allo-ia-portal.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

def log_test(test_name, status, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_icon = "✅" if status == "PASS" else "❌"
    print(f"[{timestamp}] {status_icon} {test_name}")
    if details:
        print(f"    {details}")

def test_api_root():
    """Test 1: GET /api/ → 200"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "paths" in data:
                log_test("GET /api/", "PASS", f"Status: {response.status_code}, Message: {data.get('message', '')}")
                return True
            else:
                log_test("GET /api/", "FAIL", f"Status: {response.status_code}, Missing expected fields in response")
                return False
        else:
            log_test("GET /api/", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/", "FAIL", f"Exception: {str(e)}")
        return False

def test_alerts_list():
    """Test 2: GET /api/alerts → 200 + list array"""
    try:
        response = requests.get(f"{API_BASE}/alerts", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("GET /api/alerts", "PASS", f"Status: {response.status_code}, Alerts count: {len(data)}")
                return True
            else:
                log_test("GET /api/alerts", "FAIL", f"Status: {response.status_code}, Response is not a list")
                return False
        else:
            log_test("GET /api/alerts", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/alerts", "FAIL", f"Exception: {str(e)}")
        return False

def test_alerts_unread_count():
    """Test 3: GET /api/alerts/unread_count → 200 + count"""
    try:
        response = requests.get(f"{API_BASE}/alerts/unread_count", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "count" in data and isinstance(data["count"], int):
                log_test("GET /api/alerts/unread_count", "PASS", f"Status: {response.status_code}, Count: {data['count']}")
                return True
            else:
                log_test("GET /api/alerts/unread_count", "FAIL", f"Status: {response.status_code}, Missing or invalid 'count' field")
                return False
        else:
            log_test("GET /api/alerts/unread_count", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/alerts/unread_count", "FAIL", f"Exception: {str(e)}")
        return False

def test_subscriptions_check():
    """Test 4: GET /api/subscriptions/check?user_id=dummy → 200"""
    try:
        response = requests.get(f"{API_BASE}/subscriptions/check?user_id=dummy", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "is_premium" in data:
                log_test("GET /api/subscriptions/check", "PASS", f"Status: {response.status_code}, is_premium: {data.get('is_premium')}")
                return True
            else:
                log_test("GET /api/subscriptions/check", "FAIL", f"Status: {response.status_code}, Missing 'is_premium' field")
                return False
        else:
            log_test("GET /api/subscriptions/check", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/subscriptions/check", "FAIL", f"Exception: {str(e)}")
        return False

def test_ai_export_docx():
    """Test 5: POST /api/ai/export/docx with small content → 200 + docx content-type"""
    try:
        payload = {
            "content": "Test document content for sanity check",
            "title": "Backend Sanity Test"
        }
        response = requests.post(f"{API_BASE}/ai/export/docx", json=payload, timeout=15)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            content_length = len(response.content)
            
            expected_content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            
            if expected_content_type in content_type and content_length > 0:
                log_test("POST /api/ai/export/docx", "PASS", 
                        f"Status: {response.status_code}, Content-Type: {content_type}, Size: {content_length} bytes")
                return True
            else:
                log_test("POST /api/ai/export/docx", "FAIL", 
                        f"Status: {response.status_code}, Wrong content-type: {content_type} or empty content")
                return False
        else:
            log_test("POST /api/ai/export/docx", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/ai/export/docx", "FAIL", f"Exception: {str(e)}")
        return False

def main():
    """Run all backend sanity tests"""
    print("=" * 60)
    print("BACKEND SANITY TEST SUITE - POST CODE REMOVAL")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    tests = [
        ("API Root", test_api_root),
        ("Alerts List", test_alerts_list),
        ("Alerts Unread Count", test_alerts_unread_count),
        ("Subscriptions Check", test_subscriptions_check),
        ("AI Export DOCX", test_ai_export_docx),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - Backend sanity check successful!")
        return 0
    else:
        print("⚠️  SOME TESTS FAILED - Backend issues detected!")
        return 1

if __name__ == "__main__":
    sys.exit(main())