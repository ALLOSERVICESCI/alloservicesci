#!/usr/bin/env python3
"""
Backend Regression Test Suite - Focused on Review Request Endpoints
Tests the 5 specific endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Base URL from frontend environment
BASE_URL = "https://service-locator-ci.preview.emergentagent.com/api"

class BackendRegressionTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
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

    def test_cinetpay_initiate(self):
        """Test 1: POST /api/payments/cinetpay/initiate - valider 200 + payment_url + transaction_id"""
        print("\n1️⃣ TEST CINETPAY INITIATE")
        print("-" * 50)
        
        # Create test user first
        test_user_id = None
        try:
            user_data = {
                "first_name": "Jean-Baptiste",
                "last_name": "Kouame",
                "phone": "+225 07 12 34 56 78",
                "email": "jean.kouame@example.ci",
                "preferred_lang": "fr",
                "accept_terms": True
            }
            response = self.make_request('POST', '/auth/register', json=user_data)
            if response.status_code == 200:
                user = response.json()
                test_user_id = user.get('id')
                self.log_test("Create user for CinetPay test", True, f"User created: {test_user_id}")
            else:
                self.log_test("Create user for CinetPay test", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_test("Create user for CinetPay test", False, f"Exception: {str(e)}")
            return
        
        # Test CinetPay initiate
        try:
            payment_data = {
                "user_id": test_user_id,
                "amount_fcfa": 1200
            }
            response = self.make_request('POST', '/payments/cinetpay/initiate', json=payment_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'payment_url' in data and 'transaction_id' in data:
                    payment_url = data['payment_url']
                    transaction_id = data['transaction_id']
                    self.log_test("POST /api/payments/cinetpay/initiate", True, 
                                f"✅ 200 + payment_url: {payment_url[:50]}... + transaction_id: {transaction_id}")
                else:
                    self.log_test("POST /api/payments/cinetpay/initiate", False, 
                                f"❌ 200 but missing payment_url or transaction_id: {data}")
            else:
                try:
                    error_data = response.json()
                    detail = error_data.get('detail', 'No detail')
                    self.log_test("POST /api/payments/cinetpay/initiate", False, 
                                f"❌ {response.status_code} - Error: {detail}")
                except:
                    self.log_test("POST /api/payments/cinetpay/initiate", False, 
                                f"❌ {response.status_code} - Response: {response.text}")
        except Exception as e:
            self.log_test("POST /api/payments/cinetpay/initiate", False, f"❌ Exception: {str(e)}")
        
        return test_user_id

    def test_user_patch(self, user_id: str):
        """Test 2: PATCH /api/users/<ID> - valider 200 + champs mis à jour"""
        print("\n2️⃣ TEST USER PATCH")
        print("-" * 50)
        
        if not user_id:
            self.log_test("PATCH /api/users/<ID>", False, "No user_id available")
            return
        
        try:
            update_data = {
                "city": "Yamoussoukro",
                "email": "jean.updated@example.ci",
                "phone": "+225 01 02 03 04 05"
            }
            response = self.make_request('PATCH', f'/users/{user_id}', json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get('city') == 'Yamoussoukro' and 
                    data.get('email') == 'jean.updated@example.ci' and
                    data.get('phone') == '+225 01 02 03 04 05'):
                    self.log_test("PATCH /api/users/<ID>", True, 
                                f"✅ 200 + champs mis à jour: city={data.get('city')}, email={data.get('email')}, phone={data.get('phone')}")
                else:
                    self.log_test("PATCH /api/users/<ID>", False, 
                                f"❌ 200 but fields not updated correctly: {data}")
            else:
                self.log_test("PATCH /api/users/<ID>", False, 
                            f"❌ Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("PATCH /api/users/<ID>", False, f"❌ Exception: {str(e)}")

    def test_subscription_check(self, user_id: str):
        """Test 3: GET /api/subscriptions/check?user_id=<ID> - 200 + is_premium bool"""
        print("\n3️⃣ TEST SUBSCRIPTION CHECK")
        print("-" * 50)
        
        if not user_id:
            self.log_test("GET /api/subscriptions/check", False, "No user_id available")
            return
        
        try:
            response = self.make_request('GET', f'/subscriptions/check?user_id={user_id}')
            if response.status_code == 200:
                data = response.json()
                if 'is_premium' in data and isinstance(data['is_premium'], bool):
                    is_premium = data['is_premium']
                    expires_at = data.get('expires_at')
                    self.log_test("GET /api/subscriptions/check", True, 
                                f"✅ 200 + is_premium: {is_premium}, expires_at: {expires_at}")
                else:
                    self.log_test("GET /api/subscriptions/check", False, 
                                f"❌ Missing or invalid is_premium field: {data}")
            else:
                self.log_test("GET /api/subscriptions/check", False, 
                            f"❌ Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/subscriptions/check", False, f"❌ Exception: {str(e)}")

    def test_alerts_unread_count(self, user_id: str):
        """Test 4: GET /api/alerts/unread_count?user_id=<ID> - 200 + count"""
        print("\n4️⃣ TEST ALERTS UNREAD COUNT")
        print("-" * 50)
        
        if not user_id:
            self.log_test("GET /api/alerts/unread_count", False, "No user_id available")
            return
        
        try:
            response = self.make_request('GET', f'/alerts/unread_count?user_id={user_id}')
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and isinstance(data['count'], int):
                    count = data['count']
                    self.log_test("GET /api/alerts/unread_count", True, 
                                f"✅ 200 + count: {count}")
                else:
                    self.log_test("GET /api/alerts/unread_count", False, 
                                f"❌ Missing or invalid count field: {data}")
            else:
                self.log_test("GET /api/alerts/unread_count", False, 
                            f"❌ Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/alerts/unread_count", False, f"❌ Exception: {str(e)}")

    def test_pharmacies_filtering(self):
        """Test 5: GET /api/pharmacies avec filtres (city, on_duty, near_lat/lng, max_km)"""
        print("\n5️⃣ TEST PHARMACIES FILTERING")
        print("-" * 50)
        
        # Test 5a: No filters
        try:
            response = self.make_request('GET', '/pharmacies')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/pharmacies (no filters)", True, 
                                f"✅ 200 + {len(data)} pharmacies")
                    
                    # Validate structure
                    if len(data) > 0:
                        sample = data[0]
                        required_fields = ['id', 'name', 'address', 'city']
                        has_required = all(field in sample for field in required_fields)
                        if has_required:
                            self.log_test("Pharmacies JSON structure", True, 
                                        f"✅ Required fields present: {required_fields}")
                        else:
                            missing = [f for f in required_fields if f not in sample]
                            self.log_test("Pharmacies JSON structure", False, 
                                        f"❌ Missing fields: {missing}")
                else:
                    self.log_test("GET /api/pharmacies (no filters)", False, 
                                f"❌ Expected array, got {type(data)}")
            else:
                self.log_test("GET /api/pharmacies (no filters)", False, 
                            f"❌ Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/pharmacies (no filters)", False, f"❌ Exception: {str(e)}")
        
        # Test 5b: City filter
        test_cities = ["Abidjan", "Grand-Bassam", "Marcory"]
        for city in test_cities:
            try:
                response = self.make_request('GET', f'/pharmacies?city={city}')
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        if len(data) > 0:
                            # Check city matching (case-insensitive)
                            city_matches = all(
                                item.get('city', '').lower() == city.lower() 
                                for item in data
                            )
                            if city_matches:
                                self.log_test(f"GET /api/pharmacies?city={city}", True, 
                                            f"✅ 200 + {len(data)} pharmacies, all match city")
                            else:
                                mismatches = [item.get('city') for item in data 
                                            if item.get('city', '').lower() != city.lower()]
                                self.log_test(f"GET /api/pharmacies?city={city}", False, 
                                            f"❌ City mismatches: {set(mismatches)}")
                        else:
                            self.log_test(f"GET /api/pharmacies?city={city}", True, 
                                        f"✅ 200 + 0 pharmacies (no data for {city})")
                    else:
                        self.log_test(f"GET /api/pharmacies?city={city}", False, 
                                    f"❌ Expected array, got {type(data)}")
                else:
                    self.log_test(f"GET /api/pharmacies?city={city}", False, 
                                f"❌ Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"GET /api/pharmacies?city={city}", False, f"❌ Exception: {str(e)}")
        
        # Test 5c: on_duty filter
        try:
            response = self.make_request('GET', '/pharmacies?on_duty=true')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check all have on_duty=true
                        on_duty_matches = all(item.get('on_duty') == True for item in data)
                        if on_duty_matches:
                            self.log_test("GET /api/pharmacies?on_duty=true", True, 
                                        f"✅ 200 + {len(data)} pharmacies, all on_duty=true")
                        else:
                            non_duty = [item.get('on_duty') for item in data if item.get('on_duty') != True]
                            self.log_test("GET /api/pharmacies?on_duty=true", False, 
                                        f"❌ Non-duty pharmacies found: {non_duty}")
                    else:
                        self.log_test("GET /api/pharmacies?on_duty=true", True, 
                                    f"✅ 200 + 0 pharmacies (no on-duty pharmacies)")
                else:
                    self.log_test("GET /api/pharmacies?on_duty=true", False, 
                                f"❌ Expected array, got {type(data)}")
            else:
                self.log_test("GET /api/pharmacies?on_duty=true", False, 
                            f"❌ Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/pharmacies?on_duty=true", False, f"❌ Exception: {str(e)}")
        
        # Test 5d: Near location filter (Abidjan coordinates)
        abidjan_lat = 5.316667
        abidjan_lng = -4.016667
        max_km = 5
        try:
            response = self.make_request('GET', 
                f'/pharmacies?near_lat={abidjan_lat}&near_lng={abidjan_lng}&max_km={max_km}')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/pharmacies (near Abidjan)", True, 
                                f"✅ 200 + {len(data)} pharmacies near Abidjan")
                else:
                    self.log_test("GET /api/pharmacies (near Abidjan)", False, 
                                f"❌ Expected array, got {type(data)}")
            else:
                self.log_test("GET /api/pharmacies (near Abidjan)", False, 
                            f"❌ Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/pharmacies (near Abidjan)", False, f"❌ Exception: {str(e)}")
        
        # Test 5e: Combined filters (city + on_duty)
        try:
            response = self.make_request('GET', '/pharmacies?city=Abidjan&on_duty=true')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check both filters
                        combined_matches = all(
                            item.get('city', '').lower() == 'abidjan' and 
                            item.get('on_duty') == True
                            for item in data
                        )
                        if combined_matches:
                            self.log_test("GET /api/pharmacies (Abidjan + on_duty)", True, 
                                        f"✅ 200 + {len(data)} pharmacies match both filters")
                        else:
                            mismatches = [(item.get('city'), item.get('on_duty')) for item in data 
                                        if not (item.get('city', '').lower() == 'abidjan' and item.get('on_duty') == True)]
                            self.log_test("GET /api/pharmacies (Abidjan + on_duty)", False, 
                                        f"❌ Filter mismatches: {mismatches}")
                    else:
                        self.log_test("GET /api/pharmacies (Abidjan + on_duty)", True, 
                                    f"✅ 200 + 0 pharmacies (no on-duty pharmacies in Abidjan)")
                else:
                    self.log_test("GET /api/pharmacies (Abidjan + on_duty)", False, 
                                f"❌ Expected array, got {type(data)}")
            else:
                self.log_test("GET /api/pharmacies (Abidjan + on_duty)", False, 
                            f"❌ Status: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/pharmacies (Abidjan + on_duty)", False, f"❌ Exception: {str(e)}")

    def run_regression_tests(self):
        """Run the complete backend regression test suite"""
        print("🔍 BACKEND REGRESSION TESTS - REVIEW REQUEST")
        print(f"Base URL: {self.base_url}")
        print("=" * 80)
        
        # Test 1: CinetPay initiate
        user_id = self.test_cinetpay_initiate()
        
        # Test 2: User PATCH (using user from test 1)
        self.test_user_patch(user_id)
        
        # Test 3: Subscription check
        self.test_subscription_check(user_id)
        
        # Test 4: Alerts unread count
        self.test_alerts_unread_count(user_id)
        
        # Test 5: Pharmacies filtering
        self.test_pharmacies_filtering()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 REGRESSION TEST SUMMARY")
        print("=" * 80)
        
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
        else:
            print("\n✅ ALL TESTS PASSED!")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendRegressionTester()
    success = tester.run_regression_tests()
    sys.exit(0 if success else 1)