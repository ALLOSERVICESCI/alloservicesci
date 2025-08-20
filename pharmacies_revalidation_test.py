#!/usr/bin/env python3
"""
Focused test for Pharmacies nearby revalidation
Tests specific requirements from the review request
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Base URL from frontend environment
BASE_URL = "https://allo-services.preview.emergentagent.com/api"

def test_health_endpoint():
    """Test 1: Verify /api/health returns {status: ok}"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok':
                print("✅ Health endpoint: PASS - Returns {status: ok}")
                return True
            else:
                print(f"❌ Health endpoint: FAIL - Expected {{status: ok}}, got {data}")
                return False
        else:
            print(f"❌ Health endpoint: FAIL - Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint: FAIL - Exception: {str(e)}")
        return False

def test_pharmacies_nearby():
    """Test 2: Call /api/pharmacies/nearby with Abidjan coordinates"""
    try:
        params = {
            'lat': 5.35,
            'lng': -3.99,
            'max_km': 20
        }
        response = requests.get(f"{BASE_URL}/pharmacies/nearby", params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Pharmacies nearby: PASS - HTTP 200, JSON array with {len(data)} items")
                
                # Validate item shape if items exist
                if len(data) > 0:
                    sample_item = data[0]
                    required_fields = ['id', 'name', 'address', 'city', 'phone', 'location']
                    missing_fields = []
                    
                    for field in required_fields:
                        if field not in sample_item:
                            missing_fields.append(field)
                    
                    if missing_fields:
                        print(f"⚠️  Item validation: Missing fields in pharmacy items: {missing_fields}")
                        print(f"   Sample item keys: {list(sample_item.keys())}")
                    else:
                        print("✅ Item validation: All required fields present (id, name, address, city, phone, location)")
                else:
                    print("ℹ️  No pharmacy items returned (0+ items acceptable)")
                
                return True
            else:
                print(f"❌ Pharmacies nearby: FAIL - Expected JSON array, got {type(data)}")
                return False
        else:
            print(f"❌ Pharmacies nearby: FAIL - Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Pharmacies nearby: FAIL - Exception: {str(e)}")
        return False

def test_alerts_sanity():
    """Test 3: Optional sanity check for /api/alerts"""
    try:
        response = requests.get(f"{BASE_URL}/alerts", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Alerts sanity check: PASS - HTTP 200, JSON array with {len(data)} items")
                return True
            else:
                print(f"❌ Alerts sanity check: FAIL - Expected JSON array, got {type(data)}")
                return False
        else:
            print(f"❌ Alerts sanity check: FAIL - Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Alerts sanity check: FAIL - Exception: {str(e)}")
        return False

def test_useful_numbers_sanity():
    """Test 4: Optional sanity check for /api/useful-numbers"""
    try:
        response = requests.get(f"{BASE_URL}/useful-numbers", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Useful numbers sanity check: PASS - HTTP 200, JSON array with {len(data)} items")
                return True
            else:
                print(f"❌ Useful numbers sanity check: FAIL - Expected JSON array, got {type(data)}")
                return False
        else:
            print(f"❌ Useful numbers sanity check: FAIL - Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Useful numbers sanity check: FAIL - Exception: {str(e)}")
        return False

def main():
    """Run focused pharmacies revalidation tests"""
    print("🚀 Starting Pharmacies Nearby Revalidation Tests")
    print(f"Base URL: {BASE_URL}")
    print("=" * 60)
    
    results = []
    
    # Primary tests
    results.append(test_health_endpoint())
    results.append(test_pharmacies_nearby())
    
    # Optional sanity checks
    results.append(test_alerts_sanity())
    results.append(test_useful_numbers_sanity())
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 REVALIDATION TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 All revalidation tests PASSED!")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)