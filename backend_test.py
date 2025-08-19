#!/usr/bin/env python3
"""
Backend API Testing Suite for Allô Services CI
Tests all backend endpoints according to the test plan
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Base URL from frontend environment
BASE_URL = "https://allo-ci.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.user_id = None
        self.transaction_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise
            
    def test_seed_endpoint(self):
        """Test 1: POST /api/seed expect {status: ok}"""
        try:
            response = self.make_request('POST', '/seed')
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("Seed endpoint", True, "Database seeded successfully")
                else:
                    self.log_test("Seed endpoint", False, f"Unexpected response: {data}")
            else:
                self.log_test("Seed endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Seed endpoint", False, f"Exception: {str(e)}")
            
    def test_categories(self):
        """Test 2: GET /api/categories expect 11+ slugs"""
        try:
            response = self.make_request('GET', '/categories')
            if response.status_code == 200:
                categories = response.json()
                if isinstance(categories, list) and len(categories) >= 11:
                    slugs = [cat.get('slug') for cat in categories]
                    self.log_test("Categories endpoint", True, f"Found {len(categories)} categories with slugs: {slugs}")
                else:
                    self.log_test("Categories endpoint", False, f"Expected 11+ categories, got {len(categories) if isinstance(categories, list) else 'invalid response'}")
            else:
                self.log_test("Categories endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Categories endpoint", False, f"Exception: {str(e)}")
            
    def test_user_registration(self):
        """Test 3: POST /api/auth/register with minimal fields, save user_id"""
        try:
            user_data = {
                "first_name": "Jean",
                "last_name": "Kouassi",
                "phone": "+225 07 12 34 56 78",
                "email": "jean.kouassi@example.ci",
                "preferred_lang": "fr",
                "accept_terms": True
            }
            response = self.make_request('POST', '/auth/register', json=user_data)
            if response.status_code == 200:
                user = response.json()
                if 'id' in user:
                    self.user_id = user['id']
                    self.log_test("User registration", True, f"User registered with ID: {self.user_id}")
                else:
                    self.log_test("User registration", False, f"No user ID in response: {user}")
            else:
                self.log_test("User registration", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("User registration", False, f"Exception: {str(e)}")
            
    def test_subscription_check_initial(self):
        """Test 4: GET /api/subscriptions/check?user_id={id} expect is_premium=false"""
        if not self.user_id:
            self.log_test("Initial subscription check", False, "No user_id available")
            return
            
        try:
            response = self.make_request('GET', f'/subscriptions/check?user_id={self.user_id}')
            if response.status_code == 200:
                data = response.json()
                if data.get('is_premium') == False:
                    self.log_test("Initial subscription check", True, "User is not premium initially")
                else:
                    self.log_test("Initial subscription check", False, f"Expected is_premium=false, got {data.get('is_premium')}")
            else:
                self.log_test("Initial subscription check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Initial subscription check", False, f"Exception: {str(e)}")
            
    def test_payment_initiate(self):
        """Test 5: POST /api/payments/cinetpay/initiate with user id, expect redirect_url and transaction_id"""
        if not self.user_id:
            self.log_test("Payment initiation", False, "No user_id available")
            return
            
        try:
            payment_data = {
                "user_id": self.user_id,
                "amount_fcfa": 1200
            }
            response = self.make_request('POST', '/payments/cinetpay/initiate', json=payment_data)
            if response.status_code == 200:
                data = response.json()
                if 'redirect_url' in data and 'transaction_id' in data:
                    self.transaction_id = data['transaction_id']
                    self.log_test("Payment initiation", True, f"Payment initiated with transaction_id: {self.transaction_id}")
                else:
                    self.log_test("Payment initiation", False, f"Missing redirect_url or transaction_id: {data}")
            else:
                self.log_test("Payment initiation", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Payment initiation", False, f"Exception: {str(e)}")
            
    def test_payment_validate(self):
        """Test 6: POST /api/payments/cinetpay/validate with success true, expect status paid"""
        if not self.transaction_id:
            self.log_test("Payment validation", False, "No transaction_id available")
            return
            
        try:
            validate_data = {
                "transaction_id": self.transaction_id,
                "success": True
            }
            response = self.make_request('POST', '/payments/cinetpay/validate', json=validate_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'paid':
                    self.log_test("Payment validation", True, "Payment validated successfully")
                else:
                    self.log_test("Payment validation", False, f"Expected status=paid, got {data.get('status')}")
            else:
                self.log_test("Payment validation", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Payment validation", False, f"Exception: {str(e)}")
            
    def test_subscription_check_premium(self):
        """Test 7: GET /api/subscriptions/check again expect is_premium=true"""
        if not self.user_id:
            self.log_test("Premium subscription check", False, "No user_id available")
            return
            
        try:
            response = self.make_request('GET', f'/subscriptions/check?user_id={self.user_id}')
            if response.status_code == 200:
                data = response.json()
                if data.get('is_premium') == True:
                    self.log_test("Premium subscription check", True, "User is now premium")
                else:
                    self.log_test("Premium subscription check", False, f"Expected is_premium=true, got {data.get('is_premium')}")
            else:
                self.log_test("Premium subscription check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Premium subscription check", False, f"Exception: {str(e)}")
            
    def test_free_endpoints(self):
        """Test 8: GET free endpoints: /api/useful-numbers, /api/locations, /api/pharmacies/nearby"""
        
        # Test useful numbers
        try:
            response = self.make_request('GET', '/useful-numbers')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Useful numbers endpoint", True, f"Found {len(data)} useful numbers")
                else:
                    self.log_test("Useful numbers endpoint", False, "No useful numbers returned")
            else:
                self.log_test("Useful numbers endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Useful numbers endpoint", False, f"Exception: {str(e)}")
            
        # Test locations
        try:
            response = self.make_request('GET', '/locations')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Locations endpoint", True, f"Found {len(data)} locations")
                else:
                    self.log_test("Locations endpoint", False, "No locations returned")
            else:
                self.log_test("Locations endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Locations endpoint", False, f"Exception: {str(e)}")
            
        # Test pharmacies nearby
        try:
            response = self.make_request('GET', '/pharmacies/nearby?lat=5.35&lng=-3.99&max_km=20')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Pharmacies nearby endpoint", True, f"Found {len(data)} pharmacies")
                else:
                    self.log_test("Pharmacies nearby endpoint", False, "Invalid response format")
            else:
                self.log_test("Pharmacies nearby endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Pharmacies nearby endpoint", False, f"Exception: {str(e)}")
            
    def test_alerts_endpoints(self):
        """Test 9: POST /api/alerts (sample flood) then GET /api/alerts"""
        
        # Create alert
        try:
            alert_data = {
                "title": "Inondation à Yopougon - Test",
                "type": "flood",
                "description": "Routes impraticables suite aux fortes pluies. Évitez le secteur.",
                "city": "Abidjan",
                "lat": 5.35,
                "lng": -3.99,
                "images_base64": []
            }
            response = self.make_request('POST', '/alerts', json=alert_data)
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('type') == 'flood':
                    self.log_test("Create alert", True, f"Alert created with ID: {data['id']}")
                else:
                    self.log_test("Create alert", False, f"Invalid alert response: {data}")
            else:
                self.log_test("Create alert", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create alert", False, f"Exception: {str(e)}")
            
        # List alerts
        try:
            response = self.make_request('GET', '/alerts')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("List alerts", True, f"Found {len(data)} alerts")
                else:
                    self.log_test("List alerts", False, "No alerts returned")
            else:
                self.log_test("List alerts", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("List alerts", False, f"Exception: {str(e)}")
            
    def test_premium_gating(self):
        """Test 10: Verify premium gating: GET /api/exams without user_id expect 402; then with user_id expect 200"""
        
        # Test without user_id (should get 402)
        try:
            response = self.make_request('GET', '/exams')
            if response.status_code == 402:
                self.log_test("Premium gating (no user)", True, "Correctly blocked non-premium access")
            else:
                self.log_test("Premium gating (no user)", False, f"Expected 402, got {response.status_code}")
        except Exception as e:
            self.log_test("Premium gating (no user)", False, f"Exception: {str(e)}")
            
        # Test with premium user_id (should get 200)
        if not self.user_id:
            self.log_test("Premium gating (with user)", False, "No user_id available")
            return
            
        try:
            response = self.make_request('GET', f'/exams?user_id={self.user_id}')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Premium gating (with user)", True, f"Premium user can access exams: {len(data)} items")
                else:
                    self.log_test("Premium gating (with user)", False, "Invalid response format")
            else:
                self.log_test("Premium gating (with user)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Premium gating (with user)", False, f"Exception: {str(e)}")
            
    def test_utilities_endpoint(self):
        """Test 11: GET /api/utilities with user_id expect 200"""
        if not self.user_id:
            self.log_test("Utilities endpoint", False, "No user_id available")
            return
            
        try:
            response = self.make_request('GET', f'/utilities?user_id={self.user_id}')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Utilities endpoint", True, f"Found {len(data)} utility services")
                else:
                    self.log_test("Utilities endpoint", False, "Invalid response format")
            else:
                self.log_test("Utilities endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Utilities endpoint", False, f"Exception: {str(e)}")
            
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Backend API Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run tests in the specified sequence
        self.test_seed_endpoint()
        self.test_categories()
        self.test_user_registration()
        self.test_subscription_check_initial()
        self.test_payment_initiate()
        self.test_payment_validate()
        self.test_subscription_check_premium()
        self.test_free_endpoints()
        self.test_alerts_endpoints()
        self.test_premium_gating()
        self.test_utilities_endpoint()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed < total:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)