#!/usr/bin/env python3
"""
AI Endpoint Testing Suite for Review Request
Tests the new AI endpoint changes as requested
"""

import requests
import json
import sys

# Base URL from frontend environment
BASE_URL = "https://allo-ci-french.preview.emergentagent.com/api"

class AIEndpointTester:
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

    def test_health_endpoint(self):
        """Test 1: GET /api/health should return 200 OK"""
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
        """Test 2: POST /api/ai/chat should return 500 when EMERGENT_API_KEY is not configured"""
        try:
            chat_data = {
                "messages": [{"role": "user", "content": "Bonjour"}],
                "stream": False
            }
            response = self.make_request('POST', '/ai/chat', json=chat_data)
            
            if response.status_code == 500:
                try:
                    data = response.json()
                    detail = data.get('detail', '')
                    if 'EMERGENT_API_KEY' in detail:
                        self.log_test("AI chat endpoint (no key)", True, f"Correctly returned 500 with EMERGENT_API_KEY error: {detail}")
                    else:
                        self.log_test("AI chat endpoint (no key)", False, f"Expected EMERGENT_API_KEY error, got: {detail}")
                except json.JSONDecodeError:
                    self.log_test("AI chat endpoint (no key)", False, f"Server returned 500 but response is not JSON: {response.text}")
            elif response.status_code == 200:
                # API key is configured and working
                try:
                    data = response.json()
                    if 'content' in data:
                        self.log_test("AI chat endpoint (with key)", True, f"API key is configured and working. Response: {data.get('content', '')[:100]}...")
                    else:
                        self.log_test("AI chat endpoint (with key)", False, f"Unexpected response format: {data}")
                except json.JSONDecodeError:
                    self.log_test("AI chat endpoint (with key)", False, f"Response is not valid JSON: {response.text}")
            else:
                self.log_test("AI chat endpoint", False, f"Unexpected status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("AI chat endpoint", False, f"Exception: {str(e)}")

    def test_ai_chat_streaming(self):
        """Test 3: POST /api/ai/chat with stream=true → verify SSE flux and [DONE] termination"""
        try:
            chat_data = {
                "messages": [{"role": "user", "content": "Dis-moi quelque chose sur la Côte d'Ivoire en une phrase."}],
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
                    error_found = False
                    
                    try:
                        for line in response.iter_lines(decode_unicode=True):
                            if line.startswith('data: '):
                                data_part = line[6:]  # Remove 'data: ' prefix
                                if data_part == '[DONE]':
                                    done_found = True
                                    break
                                try:
                                    chunk_data = json.loads(data_part)
                                    if 'content' in chunk_data:
                                        content_chunks.append(chunk_data['content'])
                                    elif 'error' in chunk_data:
                                        error_found = True
                                        self.log_test("AI chat streaming", False, f"Error in stream: {chunk_data['error']}")
                                        return
                                except json.JSONDecodeError:
                                    continue
                        
                        full_content = ''.join(content_chunks)
                        if content_chunks and len(full_content) > 0:
                            self.log_test("AI chat streaming", True, f"SSE streaming working. Content: '{full_content[:100]}...', Done signal: {done_found}")
                        elif done_found:
                            self.log_test("AI chat streaming", True, f"SSE streaming completed with [DONE] signal, but no content received")
                        else:
                            self.log_test("AI chat streaming", False, "No content received in streaming response")
                    except Exception as stream_error:
                        self.log_test("AI chat streaming", False, f"Error reading stream: {str(stream_error)}")
                else:
                    self.log_test("AI chat streaming", False, f"Expected text/event-stream, got: {content_type}")
            elif response.status_code == 500:
                try:
                    data = response.json()
                    detail = data.get('detail', '')
                    if 'EMERGENT_API_KEY' in detail:
                        self.log_test("AI chat streaming", False, f"API key not configured: {detail}")
                    else:
                        self.log_test("AI chat streaming", False, f"Server error: {detail}")
                except json.JSONDecodeError:
                    self.log_test("AI chat streaming", False, f"Server returned 500: {response.text}")
            else:
                self.log_test("AI chat streaming", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("AI chat streaming", False, f"Exception: {str(e)}")

    def test_ai_chat_non_streaming(self):
        """Test 4: POST /api/ai/chat with stream=false → verify JSON {content: ...}"""
        try:
            chat_data = {
                "messages": [{"role": "user", "content": "Dis-moi quelque chose sur Abidjan en une phrase."}],
                "stream": False,
                "temperature": 0.3,
                "max_tokens": 50
            }
            response = self.make_request('POST', '/ai/chat', json=chat_data)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'content' in data and isinstance(data['content'], str) and len(data['content']) > 0:
                        self.log_test("AI chat non-streaming", True, f"Non-streaming JSON response working. Content: '{data['content'][:100]}...'")
                    else:
                        self.log_test("AI chat non-streaming", False, f"Invalid response format: {data}")
                except json.JSONDecodeError:
                    self.log_test("AI chat non-streaming", False, f"Response is not valid JSON: {response.text}")
            elif response.status_code == 500:
                try:
                    data = response.json()
                    detail = data.get('detail', '')
                    if 'EMERGENT_API_KEY' in detail:
                        self.log_test("AI chat non-streaming", False, f"API key not configured: {detail}")
                    else:
                        self.log_test("AI chat non-streaming", False, f"Server error: {detail}")
                except json.JSONDecodeError:
                    self.log_test("AI chat non-streaming", False, f"Server returned 500: {response.text}")
            else:
                self.log_test("AI chat non-streaming", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("AI chat non-streaming", False, f"Exception: {str(e)}")

    def test_existing_routes_unaffected(self):
        """Test 3: Verify existing routes remain unaffected"""
        
        # Test GET /api/alerts
        try:
            response = self.make_request('GET', '/alerts')
            if response.status_code in [200, 404]:  # 404 is acceptable if not implemented
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test("Existing route: GET /api/alerts", True, f"Alerts endpoint working: {len(data)} alerts")
                    else:
                        self.log_test("Existing route: GET /api/alerts", False, "Invalid response format")
                else:
                    self.log_test("Existing route: GET /api/alerts", True, "Alerts endpoint responds gracefully (404 - not implemented)")
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

    def run_review_tests(self):
        """Run the specific tests requested in the review"""
        print(f"🤖 AI Endpoint Review Tests - Allô IA (Emergent Option B)")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        print("Testing requirements from review request:")
        print("1) GET /api/health → 200 {status: ok}")
        print("2) POST /api/ai/chat without EMERGENT_API_KEY → 500 with explicit message")
        print("3) POST /api/ai/chat with key (clé déjà en backend/.env) → 200")
        print("   - stream=true: vérifier flux SSE 'data: {\"content\": ...}' et terminaison [DONE]")
        print("   - stream=false: vérifier JSON {content: ...}")
        print("4) Régression: endpoints critiques doivent rester OK")
        print()
        
        # Run the specific tests
        self.test_health_endpoint()
        self.test_ai_chat_endpoint_no_key()
        self.test_ai_chat_streaming()
        self.test_ai_chat_non_streaming()
        self.test_existing_routes_unaffected()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 AI ENDPOINT REVIEW SUMMARY")
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
        else:
            print("\n🎉 ALL AI ENDPOINT TESTS PASSED!")
        
        return passed == total

if __name__ == "__main__":
    tester = AIEndpointTester()
    success = tester.run_review_tests()
    sys.exit(0 if success else 1)