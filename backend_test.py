#!/usr/bin/env python3
"""
Comprehensive Backend Regression Tests for Allô Services CI FastAPI Server
Testing all endpoints as specified in the review request
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List

# Use the production URL from frontend/.env
BASE_URL = "https://urgent-services-ci.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Backend-Regression-Test/1.0'
        })
        self.test_results = []
        self.created_user_id = None
        
    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data
        })
    
    def test_ai_chat_non_streaming(self):
        """Test POST /api/ai/chat with stream=false"""
        try:
            payload = {
                "messages": [
                    {"role": "user", "content": "Parlez-moi d'Abidjan"}
                ],
                "stream": False
            }
            
            response = self.session.post(f"{BASE_URL}/ai/chat", json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if 'content' in data and isinstance(data['content'], str) and len(data['content']) > 0:
                    self.log_result(
                        "AI Chat Non-Streaming", 
                        True, 
                        f"Got response with {len(data['content'])} characters"
                    )
                else:
                    self.log_result(
                        "AI Chat Non-Streaming", 
                        False, 
                        "Response missing 'content' field or empty", 
                        data
                    )
            else:
                self.log_result(
                    "AI Chat Non-Streaming", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("AI Chat Non-Streaming", False, f"Exception: {str(e)}")
    
    def test_ai_chat_streaming(self):
        """Test POST /api/ai/chat with stream=true"""
        try:
            payload = {
                "messages": [
                    {"role": "user", "content": "Décrivez brièvement Abidjan"}
                ],
                "stream": True
            }
            
            response = self.session.post(f"{BASE_URL}/ai/chat", json=payload, stream=True, timeout=30)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'text/event-stream' in content_type:
                    chunks = []
                    done_found = False
                    
                    for line in response.iter_lines(decode_unicode=True):
                        if line.startswith('data: '):
                            data_part = line[6:]  # Remove 'data: '
                            if data_part == '[DONE]':
                                done_found = True
                                break
                            try:
                                chunk_data = json.loads(data_part)
                                if 'content' in chunk_data:
                                    chunks.append(chunk_data['content'])
                            except json.JSONDecodeError:
                                pass
                    
                    if done_found and len(chunks) > 0:
                        total_content = ''.join(chunks)
                        self.log_result(
                            "AI Chat Streaming", 
                            True, 
                            f"Received {len(chunks)} chunks, total {len(total_content)} chars, [DONE] found"
                        )
                    else:
                        self.log_result(
                            "AI Chat Streaming", 
                            False, 
                            f"Missing [DONE] or no chunks. Chunks: {len(chunks)}, Done: {done_found}"
                        )
                else:
                    self.log_result(
                        "AI Chat Streaming", 
                        False, 
                        f"Wrong content-type: {content_type}"
                    )
            else:
                self.log_result(
                    "AI Chat Streaming", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("AI Chat Streaming", False, f"Exception: {str(e)}")
    
    def test_ai_chat_validation_error(self):
        """Test POST /api/ai/chat with missing messages - expect 422"""
        try:
            payload = {"stream": False}  # Missing required 'messages' field
            
            response = self.session.post(f"{BASE_URL}/ai/chat", json=payload, timeout=10)
            
            if response.status_code == 422:
                data = response.json()
                if 'detail' in data:
                    self.log_result(
                        "AI Chat Validation Error", 
                        True, 
                        "Got expected 422 validation error"
                    )
                else:
                    self.log_result(
                        "AI Chat Validation Error", 
                        False, 
                        "422 but missing 'detail' field", 
                        data
                    )
            else:
                self.log_result(
                    "AI Chat Validation Error", 
                    False, 
                    f"Expected 422, got {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("AI Chat Validation Error", False, f"Exception: {str(e)}")
    
    def test_health_facilities_city_abidjan(self):
        """Test GET /api/health/facilities?city=Abidjan - expect >=10 facilities"""
        try:
            response = self.session.get(f"{BASE_URL}/health/facilities?city=Abidjan", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 10:
                    # Validate JSON shape for first facility
                    if data:
                        facility = data[0]
                        required_fields = ['id', 'name', 'facility_type', 'address', 'city', 'commune', 'phones']
                        missing_fields = [f for f in required_fields if f not in facility]
                        
                        if not missing_fields:
                            self.log_result(
                                "Health Facilities Abidjan", 
                                True, 
                                f"Got {len(data)} facilities (>=10 ✅), JSON shape valid"
                            )
                        else:
                            self.log_result(
                                "Health Facilities Abidjan", 
                                False, 
                                f"Missing fields: {missing_fields}", 
                                facility
                            )
                    else:
                        self.log_result("Health Facilities Abidjan", False, "Empty response array")
                else:
                    self.log_result(
                        "Health Facilities Abidjan", 
                        False, 
                        f"Expected >=10 facilities, got {len(data) if isinstance(data, list) else 'non-array'}", 
                        data
                    )
            else:
                self.log_result(
                    "Health Facilities Abidjan", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Health Facilities Abidjan", False, f"Exception: {str(e)}")
    
    def test_health_facilities_commune_cocody(self):
        """Test GET /api/health/facilities?commune=Cocody - expect >=3 facilities"""
        try:
            response = self.session.get(f"{BASE_URL}/health/facilities?commune=Cocody", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 3:
                    self.log_result(
                        "Health Facilities Cocody", 
                        True, 
                        f"Got {len(data)} facilities (>=3 ✅)"
                    )
                else:
                    self.log_result(
                        "Health Facilities Cocody", 
                        False, 
                        f"Expected >=3 facilities, got {len(data) if isinstance(data, list) else 'non-array'}", 
                        data
                    )
            else:
                self.log_result(
                    "Health Facilities Cocody", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Health Facilities Cocody", False, f"Exception: {str(e)}")
    
    def test_health_facilities_near_location(self):
        """Test GET /api/health/facilities with near_lat/lng - expect >=1 facility"""
        try:
            params = {
                'near_lat': 5.401012,
                'near_lng': -3.957433,
                'max_km': 5
            }
            response = self.session.get(f"{BASE_URL}/health/facilities", params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 1:
                    # Check if lat/lng fields are present
                    facility = data[0]
                    has_coords = 'lat' in facility and 'lng' in facility
                    self.log_result(
                        "Health Facilities Near Location", 
                        True, 
                        f"Got {len(data)} facilities (>=1 ✅), coordinates: {has_coords}"
                    )
                else:
                    self.log_result(
                        "Health Facilities Near Location", 
                        False, 
                        f"Expected >=1 facility, got {len(data) if isinstance(data, list) else 'non-array'}", 
                        data
                    )
            else:
                self.log_result(
                    "Health Facilities Near Location", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Health Facilities Near Location", False, f"Exception: {str(e)}")
    
    def test_user_registration(self):
        """Test POST /api/auth/register - expect 200 + user_id"""
        try:
            payload = {
                "first_name": "Jean-Baptiste",
                "last_name": "Kouame",
                "email": "jean.test@example.ci",
                "phone": "+225 07 12 34 56 78",
                "city": "Abidjan",
                "preferred_lang": "fr"
            }
            
            response = self.session.post(f"{BASE_URL}/auth/register", json=payload, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data:
                    self.created_user_id = data['id']
                    self.log_result(
                        "User Registration", 
                        True, 
                        f"Created user with ID: {data['id']}"
                    )
                else:
                    self.log_result(
                        "User Registration", 
                        False, 
                        "Response missing 'id' field", 
                        data
                    )
            else:
                self.log_result(
                    "User Registration", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
    
    def test_user_update(self):
        """Test PATCH /api/users/<id> - expect 200 with updated fields"""
        if not self.created_user_id:
            self.log_result("User Update", False, "No user_id available (registration failed)")
            return
            
        try:
            payload = {
                "city": "Yamoussoukro",
                "email": "jean.updated@example.ci",
                "phone": "+225 01 02 03 04 05"
            }
            
            response = self.session.patch(f"{BASE_URL}/users/{self.created_user_id}", json=payload, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get('city') == payload['city'] and 
                    data.get('email') == payload['email'] and 
                    data.get('phone') == payload['phone']):
                    self.log_result(
                        "User Update", 
                        True, 
                        f"Successfully updated user fields"
                    )
                else:
                    self.log_result(
                        "User Update", 
                        False, 
                        "Updated fields don't match request", 
                        data
                    )
            else:
                self.log_result(
                    "User Update", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("User Update", False, f"Exception: {str(e)}")
    
    def test_subscription_check(self):
        """Test GET /api/subscriptions/check?user_id=<id> - expect 200 + is_premium boolean"""
        if not self.created_user_id:
            self.log_result("Subscription Check", False, "No user_id available (registration failed)")
            return
            
        try:
            params = {'user_id': self.created_user_id}
            response = self.session.get(f"{BASE_URL}/subscriptions/check", params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if 'is_premium' in data and isinstance(data['is_premium'], bool):
                    self.log_result(
                        "Subscription Check", 
                        True, 
                        f"Got is_premium: {data['is_premium']}"
                    )
                else:
                    self.log_result(
                        "Subscription Check", 
                        False, 
                        "Missing or invalid 'is_premium' field", 
                        data
                    )
            else:
                self.log_result(
                    "Subscription Check", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Subscription Check", False, f"Exception: {str(e)}")
    
    def test_cinetpay_payment_initiate(self):
        """Test POST /api/payments/cinetpay/initiate - expect 200 + payment_url + transaction_id"""
        if not self.created_user_id:
            self.log_result("CinetPay Payment Initiate", False, "No user_id available (registration failed)")
            return
            
        try:
            payload = {
                "user_id": self.created_user_id,
                "amount_fcfa": 1200
            }
            
            response = self.session.post(f"{BASE_URL}/payments/cinetpay/initiate", json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if ('payment_url' in data and 'transaction_id' in data and 
                    isinstance(data['payment_url'], str) and len(data['payment_url']) > 0 and
                    isinstance(data['transaction_id'], str) and len(data['transaction_id']) > 0):
                    self.log_result(
                        "CinetPay Payment Initiate", 
                        True, 
                        f"Got payment_url and transaction_id: {data['transaction_id']}"
                    )
                else:
                    self.log_result(
                        "CinetPay Payment Initiate", 
                        False, 
                        "Missing payment_url or transaction_id", 
                        data
                    )
            else:
                self.log_result(
                    "CinetPay Payment Initiate", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("CinetPay Payment Initiate", False, f"Exception: {str(e)}")
    
    def test_alerts_unread_count(self):
        """Test GET /api/alerts/unread_count - expect 200 + count (int)"""
        try:
            response = self.session.get(f"{BASE_URL}/alerts/unread_count", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and isinstance(data['count'], int):
                    self.log_result(
                        "Alerts Unread Count", 
                        True, 
                        f"Got count: {data['count']}"
                    )
                else:
                    self.log_result(
                        "Alerts Unread Count", 
                        False, 
                        "Missing or invalid 'count' field", 
                        data
                    )
            else:
                self.log_result(
                    "Alerts Unread Count", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Alerts Unread Count", False, f"Exception: {str(e)}")
    
    def test_alerts_list(self):
        """Test GET /api/alerts - expect 200 + list"""
        try:
            response = self.session.get(f"{BASE_URL}/alerts", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(
                        "Alerts List", 
                        True, 
                        f"Got {len(data)} alerts"
                    )
                else:
                    self.log_result(
                        "Alerts List", 
                        False, 
                        "Response is not a list", 
                        data
                    )
            else:
                self.log_result(
                    "Alerts List", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Alerts List", False, f"Exception: {str(e)}")
    
    def test_alert_creation_and_verification(self):
        """Test POST /api/alerts then verify via GET"""
        try:
            # Create alert
            payload = {
                "title": "Test Alert Régression",
                "type": "other",
                "description": "Alerte de test pour validation backend",
                "city": "Abidjan"
            }
            
            response = self.session.post(f"{BASE_URL}/alerts", json=payload, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data:
                    alert_id = data['id']
                    
                    # Verify alert appears in list
                    time.sleep(1)  # Brief delay
                    list_response = self.session.get(f"{BASE_URL}/alerts", timeout=15)
                    
                    if list_response.status_code == 200:
                        alerts = list_response.json()
                        found = any(alert.get('id') == alert_id for alert in alerts)
                        
                        if found:
                            self.log_result(
                                "Alert Creation and Verification", 
                                True, 
                                f"Created alert {alert_id} and verified in list"
                            )
                        else:
                            self.log_result(
                                "Alert Creation and Verification", 
                                False, 
                                f"Alert {alert_id} not found in list"
                            )
                    else:
                        self.log_result(
                            "Alert Creation and Verification", 
                            False, 
                            f"Failed to get alerts list: HTTP {list_response.status_code}"
                        )
                else:
                    self.log_result(
                        "Alert Creation and Verification", 
                        False, 
                        "Alert creation response missing 'id'", 
                        data
                    )
            else:
                self.log_result(
                    "Alert Creation and Verification", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Alert Creation and Verification", False, f"Exception: {str(e)}")
    
    def test_pharmacies_baseline(self):
        """Test GET /api/pharmacies (baseline)"""
        try:
            response = self.session.get(f"{BASE_URL}/pharmacies", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(
                        "Pharmacies Baseline", 
                        True, 
                        f"Got {len(data)} pharmacies"
                    )
                else:
                    self.log_result(
                        "Pharmacies Baseline", 
                        False, 
                        "Response is not a list", 
                        data
                    )
            else:
                self.log_result(
                    "Pharmacies Baseline", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Pharmacies Baseline", False, f"Exception: {str(e)}")
    
    def test_pharmacies_city_filter(self):
        """Test GET /api/pharmacies?city=Abidjan"""
        try:
            response = self.session.get(f"{BASE_URL}/pharmacies?city=Abidjan", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check that all pharmacies have city=Abidjan (case insensitive)
                    all_match = all(p.get('city', '').lower() == 'abidjan' for p in data)
                    self.log_result(
                        "Pharmacies City Filter", 
                        True if all_match else False, 
                        f"Got {len(data)} pharmacies, all match city: {all_match}"
                    )
                else:
                    self.log_result(
                        "Pharmacies City Filter", 
                        False, 
                        "Response is not a list", 
                        data
                    )
            else:
                self.log_result(
                    "Pharmacies City Filter", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Pharmacies City Filter", False, f"Exception: {str(e)}")
    
    def test_pharmacies_on_duty(self):
        """Test GET /api/pharmacies?on_duty=true - validate dynamic computation"""
        try:
            response = self.session.get(f"{BASE_URL}/pharmacies?on_duty=true", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check that all pharmacies have on_duty=true
                    all_on_duty = all(p.get('on_duty') is True for p in data)
                    self.log_result(
                        "Pharmacies On Duty", 
                        True if all_on_duty else False, 
                        f"Got {len(data)} pharmacies, all on_duty: {all_on_duty}"
                    )
                else:
                    self.log_result(
                        "Pharmacies On Duty", 
                        False, 
                        "Response is not a list", 
                        data
                    )
            else:
                self.log_result(
                    "Pharmacies On Duty", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Pharmacies On Duty", False, f"Exception: {str(e)}")
    
    def test_pharmacies_near_location(self):
        """Test GET /api/pharmacies with near_lat/lng"""
        try:
            params = {
                'near_lat': 5.401012,
                'near_lng': -3.957433,
                'max_km': 5
            }
            response = self.session.get(f"{BASE_URL}/pharmacies", params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(
                        "Pharmacies Near Location", 
                        True, 
                        f"Got {len(data)} pharmacies near Abidjan coords"
                    )
                else:
                    self.log_result(
                        "Pharmacies Near Location", 
                        False, 
                        "Response is not a list", 
                        data
                    )
            else:
                self.log_result(
                    "Pharmacies Near Location", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Pharmacies Near Location", False, f"Exception: {str(e)}")
    
    def test_pharmacies_combined_filters(self):
        """Test GET /api/pharmacies with city + on_duty combination"""
        try:
            params = {
                'city': 'Abidjan',
                'on_duty': 'true'
            }
            response = self.session.get(f"{BASE_URL}/pharmacies", params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Validate both filters
                    city_match = all(p.get('city', '').lower() == 'abidjan' for p in data)
                    duty_match = all(p.get('on_duty') is True for p in data)
                    
                    self.log_result(
                        "Pharmacies Combined Filters", 
                        True if (city_match and duty_match) else False, 
                        f"Got {len(data)} pharmacies, city match: {city_match}, duty match: {duty_match}"
                    )
                else:
                    self.log_result(
                        "Pharmacies Combined Filters", 
                        False, 
                        "Response is not a list", 
                        data
                    )
            else:
                self.log_result(
                    "Pharmacies Combined Filters", 
                    False, 
                    f"HTTP {response.status_code}", 
                    response.text[:200]
                )
                
        except Exception as e:
            self.log_result("Pharmacies Combined Filters", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend regression tests"""
        print("🚀 Starting Comprehensive Backend Regression Tests")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 60)
        
        # AI Chat Tests
        print("🤖 AI CHAT ENDPOINTS")
        self.test_ai_chat_non_streaming()
        self.test_ai_chat_streaming()
        self.test_ai_chat_validation_error()
        
        # Health Facilities Tests
        print("🏥 HEALTH FACILITIES ENDPOINTS")
        self.test_health_facilities_city_abidjan()
        self.test_health_facilities_commune_cocody()
        self.test_health_facilities_near_location()
        
        # User & Auth Tests
        print("👤 USER & AUTHENTICATION ENDPOINTS")
        self.test_user_registration()
        self.test_user_update()
        self.test_subscription_check()
        
        # Payment Tests
        print("💳 PAYMENT ENDPOINTS")
        self.test_cinetpay_payment_initiate()
        
        # Alerts Tests
        print("🚨 ALERTS ENDPOINTS")
        self.test_alerts_unread_count()
        self.test_alerts_list()
        self.test_alert_creation_and_verification()
        
        # Pharmacies Tests
        print("💊 PHARMACIES ENDPOINTS")
        self.test_pharmacies_baseline()
        self.test_pharmacies_city_filter()
        self.test_pharmacies_on_duty()
        self.test_pharmacies_near_location()
        self.test_pharmacies_combined_filters()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        
        passed = sum(1 for r in self.test_results if r['success'])
        total = len(self.test_results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"✅ PASSED: {passed}/{total} ({success_rate:.1f}%)")
        
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"❌ FAILED: {len(failed_tests)}")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        print("\n🎯 ENVIRONMENT URL VALIDATION:")
        print(f"   Backend URL: {BASE_URL}")
        print(f"   Status: {'✅ Accessible' if any(r['success'] for r in self.test_results) else '❌ Issues detected'}")
        
        return success_rate >= 80  # Consider 80%+ as overall success

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)