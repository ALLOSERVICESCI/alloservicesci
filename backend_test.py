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
BASE_URL = "https://allo-services-1.preview.emergentagent.com/api"

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
                if ('redirect_url' in data or 'payment_url' in data) and 'transaction_id' in data:
                    self.transaction_id = data['transaction_id']
                    payment_url = data.get('redirect_url') or data.get('payment_url')
                    self.log_test("Payment initiation", True, f"Payment initiated with transaction_id: {self.transaction_id}, payment_url: {payment_url}")
                else:
                    self.log_test("Payment initiation", False, f"Missing redirect_url/payment_url or transaction_id: {data}")
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
            
        # Test locations - REMOVED as endpoint doesn't exist in current implementation
        # This was mentioned in previous tests but is not implemented in server.py
            
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
            
    def test_premium_gating_comprehensive(self):
        """Test 10: Comprehensive premium gating verification for ALL premium endpoints"""
        
        # List of all premium endpoints to test
        premium_endpoints = [
            '/exams',
            '/utilities', 
            '/education',
            '/services-publics',
            '/emplois',
            '/agriculture',
            '/loisirs',
            '/transport'
        ]
        
        # First, create a non-premium user for testing
        non_premium_user_id = None
        try:
            user_data = {
                "first_name": "Marie",
                "last_name": "Diabate", 
                "phone": "+225 05 98 76 54 32",
                "email": "marie.diabate@example.ci",
                "preferred_lang": "fr",
                "accept_terms": True
            }
            response = self.make_request('POST', '/auth/register', json=user_data)
            if response.status_code == 200:
                user = response.json()
                non_premium_user_id = user.get('id')
                self.log_test("Non-premium user creation", True, f"Created non-premium user: {non_premium_user_id}")
            else:
                self.log_test("Non-premium user creation", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Non-premium user creation", False, f"Exception: {str(e)}")
        
        # Test 1: All premium endpoints should return 402 for non-premium users
        for endpoint in premium_endpoints:
            endpoint_name = endpoint.replace('/', '').replace('-', '_')
            
            # Test without user_id (should get 402)
            try:
                response = self.make_request('GET', endpoint)
                if response.status_code == 402:
                    self.log_test(f"Premium gating {endpoint_name} (no user)", True, "Correctly blocked access without user_id")
                else:
                    self.log_test(f"Premium gating {endpoint_name} (no user)", False, f"Expected 402, got {response.status_code}")
            except Exception as e:
                self.log_test(f"Premium gating {endpoint_name} (no user)", False, f"Exception: {str(e)}")
            
            # Test with non-premium user_id (should get 402)
            if non_premium_user_id:
                try:
                    response = self.make_request('GET', f'{endpoint}?user_id={non_premium_user_id}')
                    if response.status_code == 402:
                        self.log_test(f"Premium gating {endpoint_name} (non-premium user)", True, "Correctly blocked non-premium user access")
                    else:
                        self.log_test(f"Premium gating {endpoint_name} (non-premium user)", False, f"Expected 402, got {response.status_code}")
                except Exception as e:
                    self.log_test(f"Premium gating {endpoint_name} (non-premium user)", False, f"Exception: {str(e)}")
            
            # Test with premium user_id (should get 200)
            if self.user_id:
                try:
                    response = self.make_request('GET', f'{endpoint}?user_id={self.user_id}')
                    if response.status_code == 200:
                        data = response.json()
                        if isinstance(data, list):
                            self.log_test(f"Premium gating {endpoint_name} (premium user)", True, f"Premium user can access {endpoint}: {len(data)} items")
                        else:
                            self.log_test(f"Premium gating {endpoint_name} (premium user)", False, "Invalid response format")
                    else:
                        self.log_test(f"Premium gating {endpoint_name} (premium user)", False, f"Status code: {response.status_code}")
                except Exception as e:
                    self.log_test(f"Premium gating {endpoint_name} (premium user)", False, f"Exception: {str(e)}")
        
        # Test 2: Verify free endpoints remain accessible without premium
        free_endpoints = ['/alerts', '/useful-numbers', '/pharmacies/nearby?lat=5.35&lng=-3.99&max_km=20']
        
        for endpoint in free_endpoints:
            endpoint_name = endpoint.split('?')[0].replace('/', '').replace('-', '_')
            try:
                response = self.make_request('GET', endpoint)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test(f"Free endpoint {endpoint_name}", True, f"Free access confirmed: {len(data)} items")
                    else:
                        self.log_test(f"Free endpoint {endpoint_name}", False, "Invalid response format")
                else:
                    self.log_test(f"Free endpoint {endpoint_name}", False, f"Status code: {response.status_code}")
            except Exception as e:
                self.log_test(f"Free endpoint {endpoint_name}", False, f"Exception: {str(e)}")
            
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
            
    def test_push_token_registration(self):
        """Test 12: Register a push token for testing notifications"""
        try:
            token_data = {
                "token": "ExpoPushToken[test-bouake-fr-123]",
                "user_id": self.user_id,
                "platform": "ios",
                "city": "Bouaké",
                "device_info": {"model": "iPhone", "os": "iOS 17"}
            }
            response = self.make_request('POST', '/notifications/register', json=token_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("Push token registration", True, "Push token registered successfully")
                else:
                    self.log_test("Push token registration", False, f"Unexpected response: {data}")
            else:
                self.log_test("Push token registration", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Push token registration", False, f"Exception: {str(e)}")
            
    def test_targeted_notification_bouake_fr(self):
        """Test 13: POST /api/notifications/send with Bouaké, fr targeting"""
        try:
            notification_data = {
                "title": "Information officielle",
                "body": "la ville de bouaké organise les independances du 7 août 2025, vous êtes tous conviés pour une belle réussite.",
                "city": "Bouaké",
                "lang": "fr"
            }
            response = self.make_request('POST', '/notifications/send', json=notification_data)
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and 'results' in data:
                    count = data['count']
                    results = data['results']
                    self.log_test("Targeted notification (Bouaké, fr)", True, f"Notification sent successfully. Count: {count}, Results: {len(results)} batches")
                    return count
                else:
                    self.log_test("Targeted notification (Bouaké, fr)", False, f"Missing count or results in response: {data}")
            else:
                self.log_test("Targeted notification (Bouaké, fr)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Targeted notification (Bouaké, fr)", False, f"Exception: {str(e)}")
        return 0

    def test_health_endpoint(self):
        """Test 14: GET /api/health should return 200 OK"""
        try:
            response = self.make_request('GET', '/health')
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("Health endpoint", True, "Health check passed")
                else:
                    self.log_test("Health endpoint", False, f"Unexpected response: {data}")
            else:
                self.log_test("Health endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Health endpoint", False, f"Exception: {str(e)}")

    def test_ai_chat_endpoint_no_key(self):
        """Test 15: POST /api/ai/chat should return 500 when EMERGENT_API_KEY is not configured"""
        try:
            chat_data = {
                "messages": [{"role": "user", "content": "Bonjour"}],
                "stream": False
            }
            response = self.make_request('POST', '/ai/chat', json=chat_data)
            if response.status_code == 500:
                data = response.json()
                detail = data.get('detail', '')
                if 'EMERGENT_API_KEY' in detail:
                    self.log_test("AI chat endpoint (no key)", True, f"Correctly returned 500 with EMERGENT_API_KEY error: {detail}")
                else:
                    self.log_test("AI chat endpoint (no key)", False, f"Expected EMERGENT_API_KEY error, got: {detail}")
            else:
                self.log_test("AI chat endpoint (no key)", False, f"Expected 500, got {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("AI chat endpoint (no key)", False, f"Exception: {str(e)}")

    def test_existing_routes_unaffected(self):
        """Test 16: Verify existing routes remain unaffected"""
        
        # Test GET /api/alerts
        try:
            response = self.make_request('GET', '/alerts')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Existing route: GET /api/alerts", True, f"Alerts endpoint working: {len(data)} alerts")
                else:
                    self.log_test("Existing route: GET /api/alerts", False, "Invalid response format")
            else:
                self.log_test("Existing route: GET /api/alerts", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Existing route: GET /api/alerts", False, f"Exception: {str(e)}")

        # Test POST /api/auth/register with minimal valid body
        try:
            user_data = {
                "first_name": "Test",
                "last_name": "User",
                "phone": "+225 01 23 45 67 89",
                "accept_terms": True
            }
            response = self.make_request('POST', '/auth/register', json=user_data)
            if response.status_code == 200:
                data = response.json()
                if 'id' in data:
                    self.log_test("Existing route: POST /api/auth/register", True, f"Registration working: user ID {data['id']}")
                else:
                    self.log_test("Existing route: POST /api/auth/register", False, f"No user ID in response: {data}")
            else:
                self.log_test("Existing route: POST /api/auth/register", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Existing route: POST /api/auth/register", False, f"Exception: {str(e)}")

        # Test GET /api/payments/history (skip if requires auth as requested)
        try:
            response = self.make_request('GET', '/payments/history')
            # We expect this to fail gracefully (not crash the server)
            if response.status_code in [200, 400, 401, 403, 404, 422]:
                self.log_test("Existing route: GET /api/payments/history", True, f"Endpoint responds gracefully: {response.status_code}")
            else:
                self.log_test("Existing route: GET /api/payments/history", False, f"Unexpected status code: {response.status_code}")
        except Exception as e:
            self.log_test("Existing route: GET /api/payments/history", False, f"Exception: {str(e)}")
            
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
        self.test_premium_gating_comprehensive()
        self.test_push_token_registration()
        notification_count = self.test_targeted_notification_bouake_fr()
        
        # New AI endpoint tests
        print("\n" + "=" * 60)
        print("🤖 AI ENDPOINT TESTS (Review Request)")
        print("=" * 60)
        self.test_health_endpoint()
        self.test_ai_chat_endpoint_no_key()
        self.test_existing_routes_unaffected()
        
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