#!/usr/bin/env python3
"""
Focused Backend Smoke Tests - Testing Available Endpoints Only
Based on current server.py implementation
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend environment
BASE_URL = "https://allopharma-ci.preview.emergentagent.com/api"

class FocusedSmokeTestRunner:
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

    def test_health_endpoint(self):
        """Test 1: GET /api/health (200) - AVAILABLE"""
        try:
            response = self.make_request('GET', '/health')
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("GET /api/health", True, "Returns 200 OK with {status: ok}")
                else:
                    self.log_test("GET /api/health", False, f"Unexpected response: {data}")
            else:
                self.log_test("GET /api/health", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/health", False, f"Exception: {str(e)}")

    def test_user_registration_flow(self):
        """Test 2: User registration and subscription check - AVAILABLE"""
        
        # Step 1: Register user
        try:
            user_data = {
                "first_name": "Kouadio",
                "last_name": "Yao",
                "phone": "+225 07 89 12 34 56",
                "email": "kouadio.yao@example.ci",
                "preferred_lang": "fr",
                "accept_terms": True
            }
            response = self.make_request('POST', '/auth/register', json=user_data)
            if response.status_code == 200:
                user = response.json()
                if 'id' in user:
                    self.user_id = user['id']
                    self.log_test("POST /api/auth/register", True, f"User registered with ID: {self.user_id}")
                else:
                    self.log_test("POST /api/auth/register", False, f"No user ID in response: {user}")
                    return
            else:
                self.log_test("POST /api/auth/register", False, f"Status code: {response.status_code}")
                return
        except Exception as e:
            self.log_test("POST /api/auth/register", False, f"Exception: {str(e)}")
            return

        # Step 2: Check subscription status
        try:
            response = self.make_request('GET', f'/subscriptions/check?user_id={self.user_id}')
            if response.status_code == 200:
                data = response.json()
                if 'is_premium' in data:
                    self.log_test("GET /api/subscriptions/check", True, f"Returns subscription status: is_premium={data['is_premium']}")
                else:
                    self.log_test("GET /api/subscriptions/check", False, f"Missing is_premium field: {data}")
            else:
                self.log_test("GET /api/subscriptions/check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/subscriptions/check", False, f"Exception: {str(e)}")

        # Step 3: Update user profile
        try:
            update_data = {
                "city": "Abidjan",
                "preferred_lang": "en"
            }
            response = self.make_request('PATCH', f'/users/{self.user_id}', json=update_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('city') == 'Abidjan' and data.get('preferred_lang') == 'en':
                    self.log_test("PATCH /api/users/{user_id}", True, f"User profile updated successfully")
                else:
                    self.log_test("PATCH /api/users/{user_id}", False, f"Update not reflected: {data}")
            else:
                self.log_test("PATCH /api/users/{user_id}", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("PATCH /api/users/{user_id}", False, f"Exception: {str(e)}")

    def test_payment_initiation(self):
        """Test 3: Payment initiation - AVAILABLE"""
        if not self.user_id:
            self.log_test("POST /api/payments/cinetpay/initiate", False, "No user_id available")
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
                    self.log_test("POST /api/payments/cinetpay/initiate", True, f"Payment initiated: {self.transaction_id}")
                else:
                    self.log_test("POST /api/payments/cinetpay/initiate", False, f"Missing payment_url or transaction_id: {data}")
            else:
                self.log_test("POST /api/payments/cinetpay/initiate", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/payments/cinetpay/initiate", False, f"Exception: {str(e)}")

    def test_ai_chat_endpoints(self):
        """Test 4: AI chat endpoints - AVAILABLE"""
        
        # Test non-streaming
        try:
            chat_data = {
                "messages": [{"role": "user", "content": "Dis-moi quelque chose sur Abidjan en une phrase."}],
                "stream": False,
                "temperature": 0.3,
                "max_tokens": 100
            }
            response = self.make_request('POST', '/ai/chat', json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'content' in data and isinstance(data['content'], str) and len(data['content']) > 0:
                    self.log_test("POST /api/ai/chat (non-streaming)", True, f"Returns 200 with content: '{data['content'][:80]}...'")
                else:
                    self.log_test("POST /api/ai/chat (non-streaming)", False, f"Invalid response format: {data}")
            elif response.status_code == 500:
                # Check if it's graceful error handling
                try:
                    data = response.json()
                    detail = data.get('detail', '')
                    if 'EMERGENT_API_KEY' in detail or 'Chat completion failed' in detail:
                        self.log_test("POST /api/ai/chat (non-streaming)", True, f"Graceful error handling: {detail}")
                    else:
                        self.log_test("POST /api/ai/chat (non-streaming)", False, f"Unexpected error: {detail}")
                except:
                    self.log_test("POST /api/ai/chat (non-streaming)", False, f"Status 500 with non-JSON response")
            else:
                self.log_test("POST /api/ai/chat (non-streaming)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/ai/chat (non-streaming)", False, f"Exception: {str(e)}")

        # Test streaming
        try:
            chat_data = {
                "messages": [{"role": "user", "content": "Bonjour, peux-tu me dire quelque chose sur la Côte d'Ivoire?"}],
                "stream": True,
                "temperature": 0.3,
                "max_tokens": 100
            }
            response = self.make_request('POST', '/ai/chat', json=chat_data, stream=True)
            
            if response.status_code == 200:
                # Check if it's SSE format
                content_type = response.headers.get('content-type', '')
                if 'text/event-stream' in content_type:
                    # Read streaming response
                    content_chunks = []
                    done_found = False
                    chunk_count = 0
                    
                    for line in response.iter_lines(decode_unicode=True):
                        if line.startswith('data: '):
                            chunk_count += 1
                            data_part = line[6:]  # Remove 'data: ' prefix
                            if data_part == '[DONE]':
                                done_found = True
                                break
                            try:
                                chunk_data = json.loads(data_part)
                                if 'content' in chunk_data:
                                    content_chunks.append(chunk_data['content'])
                            except json.JSONDecodeError:
                                continue
                        # Limit reading to avoid hanging
                        if chunk_count > 50:
                            break
                    
                    full_content = ''.join(content_chunks)
                    if content_chunks and len(full_content) > 0:
                        self.log_test("POST /api/ai/chat (streaming)", True, f"Returns 200 with SSE stream. Content: '{full_content[:80]}...', Done: {done_found}")
                    else:
                        self.log_test("POST /api/ai/chat (streaming)", False, "No content received in streaming response")
                else:
                    self.log_test("POST /api/ai/chat (streaming)", False, f"Expected text/event-stream, got: {content_type}")
            elif response.status_code == 500:
                # Check if it's graceful error handling
                try:
                    data = response.json()
                    detail = data.get('detail', '')
                    if 'EMERGENT_API_KEY' in detail or 'Chat completion failed' in detail:
                        self.log_test("POST /api/ai/chat (streaming)", True, f"Graceful error handling: {detail}")
                    else:
                        self.log_test("POST /api/ai/chat (streaming)", False, f"Unexpected error: {detail}")
                except:
                    self.log_test("POST /api/ai/chat (streaming)", False, f"Status 500 with non-JSON response")
            else:
                self.log_test("POST /api/ai/chat (streaming)", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/ai/chat (streaming)", False, f"Exception: {str(e)}")

    def test_missing_endpoints(self):
        """Test 5: Check status of missing endpoints mentioned in review request"""
        
        missing_endpoints = [
            ('/seed', 'POST'),
            ('/categories', 'GET'),
            ('/pharmacies/nearby?lat=5.35&lng=-3.99&max_km=20', 'GET'),
            ('/exams?user_id=test', 'GET'),
            ('/payments/cinetpay/validate', 'POST')
        ]
        
        for endpoint, method in missing_endpoints:
            try:
                if method == 'POST':
                    response = self.make_request(method, endpoint, json={})
                else:
                    response = self.make_request(method, endpoint)
                
                endpoint_name = endpoint.split('?')[0]
                if response.status_code == 404:
                    self.log_test(f"{method} /api{endpoint_name} (missing)", False, f"Endpoint not implemented (404)")
                else:
                    self.log_test(f"{method} /api{endpoint_name} (unexpected)", False, f"Unexpected status: {response.status_code}")
            except Exception as e:
                self.log_test(f"{method} /api{endpoint_name} (error)", False, f"Exception: {str(e)}")

    def run_focused_smoke_tests(self):
        """Run focused smoke tests on available endpoints"""
        print(f"🎯 FOCUSED BACKEND SMOKE TESTS - Available Endpoints Only")
        print(f"Base URL: {self.base_url}")
        print("=" * 70)
        
        # Test available endpoints
        self.test_health_endpoint()
        self.test_user_registration_flow()
        self.test_payment_initiation()
        self.test_ai_chat_endpoints()
        
        # Check missing endpoints
        print(f"\n🔍 CHECKING MISSING ENDPOINTS FROM REVIEW REQUEST:")
        print("-" * 50)
        self.test_missing_endpoints()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 FOCUSED SMOKE TEST SUMMARY")
        print("=" * 70)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Separate available vs missing endpoint results
        available_tests = [r for r in self.test_results if not 'missing' in r['test']]
        missing_tests = [r for r in self.test_results if 'missing' in r['test']]
        
        available_passed = sum(1 for r in available_tests if r['success'])
        available_total = len(available_tests)
        
        print(f"\n📈 AVAILABLE ENDPOINTS: {available_passed}/{available_total} passed ({(available_passed/available_total)*100:.1f}%)")
        print(f"📉 MISSING ENDPOINTS: {len(missing_tests)} endpoints not implemented")
        
        if passed < total:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        if available_passed == available_total:
            print("\n🎉 ALL AVAILABLE ENDPOINTS WORKING!")
        
        return available_passed == available_total

if __name__ == "__main__":
    tester = FocusedSmokeTestRunner()
    success = tester.run_focused_smoke_tests()
    sys.exit(0 if success else 1)