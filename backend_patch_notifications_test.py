#!/usr/bin/env python3
"""
Backend API Testing Suite for New Features: PATCH users and Notifications Segmentation
Tests specific features requested in the review
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Base URL from frontend environment
BASE_URL = "https://allo-premium.preview.emergentagent.com/api"

class NewFeaturesTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.user_id = None
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

    def test_user_registration_with_city_lang(self):
        """Test A1: Register user with preferred_lang=en and city=Abidjan"""
        try:
            user_data = {
                "first_name": "Kofi",
                "last_name": "Asante", 
                "phone": "+225 05 67 89 01 23",
                "email": "kofi.asante@example.ci",
                "preferred_lang": "en",
                "city": "Abidjan",
                "accept_terms": True
            }
            response = self.make_request('POST', '/auth/register', json=user_data)
            if response.status_code == 200:
                user = response.json()
                if 'id' in user and user.get('preferred_lang') == 'en' and user.get('city') == 'Abidjan':
                    self.user_id = user['id']
                    self.log_test("User registration with city/lang", True, f"User registered with ID: {self.user_id}, lang: {user.get('preferred_lang')}, city: {user.get('city')}")
                else:
                    self.log_test("User registration with city/lang", False, f"Missing expected fields in response: {user}")
            else:
                self.log_test("User registration with city/lang", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("User registration with city/lang", False, f"Exception: {str(e)}")

    def test_patch_user_update(self):
        """Test A2: PATCH user to preferred_lang=es and city=Yamoussoukro"""
        if not self.user_id:
            self.log_test("PATCH user update", False, "No user_id available")
            return
            
        try:
            update_data = {
                "preferred_lang": "es",
                "city": "Yamoussoukro"
            }
            response = self.make_request('PATCH', f'/users/{self.user_id}', json=update_data)
            if response.status_code == 200:
                user = response.json()
                if user.get('preferred_lang') == 'es' and user.get('city') == 'Yamoussoukro':
                    self.log_test("PATCH user update", True, f"User updated successfully - lang: {user.get('preferred_lang')}, city: {user.get('city')}")
                else:
                    self.log_test("PATCH user update", False, f"Fields not updated correctly: lang={user.get('preferred_lang')}, city={user.get('city')}")
            else:
                self.log_test("PATCH user update", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("PATCH user update", False, f"Exception: {str(e)}")

    def test_subscription_check_sanity(self):
        """Test A3: GET /api/subscriptions/check still works (sanity check)"""
        if not self.user_id:
            self.log_test("Subscription check sanity", False, "No user_id available")
            return
            
        try:
            response = self.make_request('GET', f'/subscriptions/check?user_id={self.user_id}')
            if response.status_code == 200:
                data = response.json()
                if 'is_premium' in data:
                    self.log_test("Subscription check sanity", True, f"Subscription check working - is_premium: {data.get('is_premium')}")
                else:
                    self.log_test("Subscription check sanity", False, f"Missing is_premium field: {data}")
            else:
                self.log_test("Subscription check sanity", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Subscription check sanity", False, f"Exception: {str(e)}")

    def test_push_token_registration(self):
        """Test B1: Register push token with user_id"""
        if not self.user_id:
            self.log_test("Push token registration", False, "No user_id available")
            return
            
        try:
            token_data = {
                "token": "ExpoPushToken[test-123]",
                "user_id": self.user_id,
                "platform": "ios",
                "city": "Yamoussoukro"  # Should match updated user city
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

    def test_notifications_send_matching(self):
        """Test B2: Send notification with matching city/lang (should target >=1 token)"""
        try:
            notification_data = {
                "title": "Hello",
                "body": "World",
                "city": "Yamoussoukro",
                "lang": "es"
            }
            response = self.make_request('POST', '/notifications/send', json=notification_data)
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and data['count'] >= 1:
                    self.log_test("Notifications send (matching)", True, f"Notification sent to {data['count']} tokens")
                else:
                    self.log_test("Notifications send (matching)", False, f"Expected count >= 1, got {data.get('count')}")
            else:
                self.log_test("Notifications send (matching)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Notifications send (matching)", False, f"Exception: {str(e)}")

    def test_notifications_send_non_matching(self):
        """Test B3: Send notification with non-matching city/lang (should return count possibly 0 but API 200)"""
        try:
            notification_data = {
                "title": "Hello2",
                "body": "World2", 
                "city": "Abidjan",
                "lang": "fr"
            }
            response = self.make_request('POST', '/notifications/send', json=notification_data)
            if response.status_code == 200:
                data = response.json()
                if 'count' in data:
                    self.log_test("Notifications send (non-matching)", True, f"Notification API returned 200 with count: {data['count']} (expected 0 or low)")
                else:
                    self.log_test("Notifications send (non-matching)", False, f"Missing count field: {data}")
            else:
                self.log_test("Notifications send (non-matching)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Notifications send (non-matching)", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all new feature tests in sequence"""
        print(f"🚀 Starting New Backend Features Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test A: PATCH /api/users/{user_id}
        print("\n🔧 Testing PATCH /api/users/{user_id} functionality:")
        self.test_user_registration_with_city_lang()
        self.test_patch_user_update()
        self.test_subscription_check_sanity()
        
        # Test B: Notifications segmentation
        print("\n📱 Testing Notifications segmentation:")
        self.test_push_token_registration()
        self.test_notifications_send_matching()
        self.test_notifications_send_non_matching()
        
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
    tester = NewFeaturesTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)