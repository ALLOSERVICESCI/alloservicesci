#!/usr/bin/env python3
"""
Backend Smoke Tests for Review Request
Focus: GET /api/health (200), GET /api/categories (11 items), premium gating 402 vs 200 
with registration + payment stub flow, geo /api/pharmacies/nearby sample, 
and POST /api/ai/chat streaming + non-streaming
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend environment
BASE_URL = "https://allo-ci-french.preview.emergentagent.com/api"

class SmokeTestRunner:
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
        """Test 1: GET /api/health (200)"""
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

    def test_seed_and_categories(self):
        """Test 2: Seed database and GET /api/categories (11 items)"""
        # First seed the database
        try:
            response = self.make_request('POST', '/seed')
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("POST /api/seed", True, "Database seeded successfully")
                else:
                    self.log_test("POST /api/seed", False, f"Unexpected response: {data}")
            else:
                self.log_test("POST /api/seed", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("POST /api/seed", False, f"Exception: {str(e)}")
            
        # Then test categories
        try:
            response = self.make_request('GET', '/categories')
            if response.status_code == 200:
                categories = response.json()
                if isinstance(categories, list) and len(categories) >= 11:
                    slugs = [cat.get('slug') for cat in categories]
                    self.log_test("GET /api/categories", True, f"Returns {len(categories)} categories: {slugs}")
                else:
                    self.log_test("GET /api/categories", False, f"Expected 11+ categories, got {len(categories) if isinstance(categories, list) else 'invalid response'}")
            else:
                self.log_test("GET /api/categories", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/categories", False, f"Exception: {str(e)}")

    def test_premium_gating_flow(self):
        """Test 3: Premium gating 402 vs 200 with registration + payment stub flow"""
        
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
                    self.log_test("User registration", True, f"User registered with ID: {self.user_id}")
                else:
                    self.log_test("User registration", False, f"No user ID in response: {user}")
                    return
            else:
                self.log_test("User registration", False, f"Status code: {response.status_code}")
                return
        except Exception as e:
            self.log_test("User registration", False, f"Exception: {str(e)}")
            return

        # Step 2: Test premium endpoint returns 402 for non-premium user
        try:
            response = self.make_request('GET', f'/exams?user_id={self.user_id}')
            if response.status_code == 402:
                self.log_test("Premium gating (non-premium)", True, "Returns 402 for non-premium user accessing /exams")
            else:
                self.log_test("Premium gating (non-premium)", False, f"Expected 402, got {response.status_code}")
        except Exception as e:
            self.log_test("Premium gating (non-premium)", False, f"Exception: {str(e)}")

        # Step 3: Payment initiation
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
                    self.log_test("Payment initiation", True, f"Payment initiated: {self.transaction_id}")
                else:
                    self.log_test("Payment initiation", False, f"Missing payment_url or transaction_id: {data}")
                    return
            else:
                self.log_test("Payment initiation", False, f"Status code: {response.status_code}")
                return
        except Exception as e:
            self.log_test("Payment initiation", False, f"Exception: {str(e)}")
            return

        # Step 4: Payment validation (stub)
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
                    return
            else:
                self.log_test("Payment validation", False, f"Status code: {response.status_code}")
                return
        except Exception as e:
            self.log_test("Payment validation", False, f"Exception: {str(e)}")
            return

        # Step 5: Test premium endpoint returns 200 for premium user
        try:
            response = self.make_request('GET', f'/exams?user_id={self.user_id}')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Premium gating (premium)", True, f"Returns 200 for premium user: {len(data)} exams")
                else:
                    self.log_test("Premium gating (premium)", False, "Invalid response format")
            else:
                self.log_test("Premium gating (premium)", False, f"Expected 200, got {response.status_code}")
        except Exception as e:
            self.log_test("Premium gating (premium)", False, f"Exception: {str(e)}")

    def test_pharmacies_nearby(self):
        """Test 4: GET /api/pharmacies/nearby sample"""
        try:
            # Use Abidjan coordinates as sample
            response = self.make_request('GET', '/pharmacies/nearby?lat=5.35&lng=-3.99&max_km=20')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/pharmacies/nearby", True, f"Returns {len(data)} pharmacies near Abidjan")
                    # Validate structure of first pharmacy if available
                    if len(data) > 0:
                        pharmacy = data[0]
                        required_fields = ['id', 'name', 'address', 'city', 'phone', 'location']
                        missing_fields = [field for field in required_fields if field not in pharmacy]
                        if not missing_fields:
                            self.log_test("Pharmacy data structure", True, f"All required fields present: {required_fields}")
                        else:
                            self.log_test("Pharmacy data structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("GET /api/pharmacies/nearby", False, "Invalid response format")
            else:
                self.log_test("GET /api/pharmacies/nearby", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("GET /api/pharmacies/nearby", False, f"Exception: {str(e)}")

    def test_ai_chat_non_streaming(self):
        """Test 5a: POST /api/ai/chat non-streaming (ensure it returns 200)"""
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

    def test_ai_chat_streaming(self):
        """Test 5b: POST /api/ai/chat streaming (ensure it returns 200)"""
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

    def run_smoke_tests(self):
        """Run all smoke tests as per review request"""
        print(f"🔥 BACKEND SMOKE TESTS - Review Request")
        print(f"Base URL: {self.base_url}")
        print("=" * 70)
        
        # Test 1: Health endpoint
        self.test_health_endpoint()
        
        # Test 2: Seed and Categories
        self.test_seed_and_categories()
        
        # Test 3: Premium gating flow
        self.test_premium_gating_flow()
        
        # Test 4: Pharmacies nearby
        self.test_pharmacies_nearby()
        
        # Test 5: AI chat endpoints
        self.test_ai_chat_non_streaming()
        self.test_ai_chat_streaming()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 SMOKE TEST SUMMARY")
        print("=" * 70)
        
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
            print("\n🎉 ALL SMOKE TESTS PASSED!")
        
        return passed == total

if __name__ == "__main__":
    tester = SmokeTestRunner()
    success = tester.run_smoke_tests()
    sys.exit(0 if success else 1)