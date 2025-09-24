#!/usr/bin/env python3
"""
Backend Test Suite for Allô Services CI API
Focus: AI Chat endpoint testing as per review request
"""

import requests
import json
import time
import os
import sys
from typing import Dict, Any, List
from datetime import datetime

# Load backend URL from frontend .env
BACKEND_URL = "https://expo-header-refine.preview.emergentagent.com/api"
EMERGENT_API_KEY = "sk-emergent-5F8959dC8249919584"  # For leak detection

class BackendTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Backend-Test-Suite/1.0'
        })
        self.results = []
        
    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data
        })
    
    def check_secret_leak(self, text: str, test_name: str) -> bool:
        """Check if response contains secret API key"""
        if EMERGENT_API_KEY in text:
            self.log_result(f"{test_name} - Secret Leak Check", False, 
                          f"CRITICAL: EMERGENT_API_KEY found in response: {text[:200]}...")
            return False
        return True
    
    def test_health_endpoint(self):
        """Test GET /api/health → 200 {status: ok}"""
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_result("GET /api/health", True, "Returns 200 with status: ok")
                    return True
                else:
                    self.log_result("GET /api/health", False, f"Wrong response format: {data}")
            else:
                self.log_result("GET /api/health", False, f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/health", False, f"Exception: {str(e)}")
        return False
    
    def test_api_root_endpoint(self):
        """Test GET /api/ → 200 plus routes list includes '/api/ai/chat'"""
        try:
            response = self.session.get(f"{self.backend_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                paths = data.get('paths', [])
                
                # Check if AI chat route is listed
                ai_chat_found = any('/api/ai/chat' in str(path) for path in paths)
                
                if ai_chat_found:
                    self.log_result("GET /api/ - AI Chat Route", True, 
                                  f"Found /api/ai/chat in routes list ({len(paths)} total routes)")
                    return True
                else:
                    self.log_result("GET /api/ - AI Chat Route", False, 
                                  f"AI chat route not found in paths: {paths}")
            else:
                self.log_result("GET /api/", False, f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/", False, f"Exception: {str(e)}")
        return False
    
    def test_ai_chat_non_stream(self):
        """Test POST /api/ai/chat with stream=false → Expect 200 and JSON { content: string }"""
        payload = {
            "messages": [
                {
                    "role": "user", 
                    "content": "Rédige une lettre de réclamation à la CIE pour une coupure à Cocody."
                }
            ],
            "stream": False,
            "temperature": 0.5,
            "max_tokens": 300
        }
        
        try:
            response = self.session.post(f"{self.backend_url}/ai/chat", 
                                       json=payload, timeout=30)
            
            # Check for secret leaks
            response_text = response.text
            if not self.check_secret_leak(response_text, "AI Chat Non-Stream"):
                return False
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'content' in data and isinstance(data['content'], str) and len(data['content']) > 0:
                        self.log_result("POST /api/ai/chat (stream=false)", True, 
                                      f"Returns 200 with content ({len(data['content'])} chars): {data['content'][:100]}...")
                        return True
                    else:
                        self.log_result("POST /api/ai/chat (stream=false)", False, 
                                      f"Missing or invalid 'content' field: {data}")
                except json.JSONDecodeError:
                    self.log_result("POST /api/ai/chat (stream=false)", False, 
                                  f"Invalid JSON response: {response.text}")
            else:
                self.log_result("POST /api/ai/chat (stream=false)", False, 
                              f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST /api/ai/chat (stream=false)", False, f"Exception: {str(e)}")
        return False
    
    def test_ai_chat_stream(self):
        """Test POST /api/ai/chat with stream=true (SSE) → Expect 200 event-stream and data chunks ending with [DONE]"""
        payload = {
            "messages": [
                {
                    "role": "user", 
                    "content": "Rédige une lettre de réclamation à la CIE pour une coupure à Cocody."
                }
            ],
            "stream": True,
            "temperature": 0.5,
            "max_tokens": 300
        }
        
        try:
            response = self.session.post(f"{self.backend_url}/ai/chat", 
                                       json=payload, timeout=30, stream=True)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'text/event-stream' not in content_type:
                    self.log_result("POST /api/ai/chat (stream=true)", False, 
                                  f"Wrong content-type: {content_type}, expected text/event-stream")
                    return False
                
                # Read streaming response
                chunks = []
                full_response = ""
                done_found = False
                
                for line in response.iter_lines(decode_unicode=True):
                    if line:
                        full_response += line + "\n"
                        if line.startswith('data: '):
                            data_part = line[6:]  # Remove 'data: ' prefix
                            if data_part == '[DONE]':
                                done_found = True
                                break
                            else:
                                try:
                                    chunk_data = json.loads(data_part)
                                    if 'content' in chunk_data:
                                        chunks.append(chunk_data['content'])
                                except json.JSONDecodeError:
                                    pass
                
                # Check for secret leaks in full response
                if not self.check_secret_leak(full_response, "AI Chat Stream"):
                    return False
                
                if done_found and len(chunks) > 0:
                    total_content = ''.join(chunks)
                    self.log_result("POST /api/ai/chat (stream=true)", True, 
                                  f"SSE stream with {len(chunks)} chunks, ends with [DONE]. Content: {total_content[:100]}...")
                    return True
                else:
                    self.log_result("POST /api/ai/chat (stream=true)", False, 
                                  f"Missing [DONE] or no content chunks. Done: {done_found}, Chunks: {len(chunks)}")
            else:
                self.log_result("POST /api/ai/chat (stream=true)", False, 
                              f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST /api/ai/chat (stream=true)", False, f"Exception: {str(e)}")
        return False
    
    def test_ai_chat_missing_messages(self):
        """Test POST /api/ai/chat with missing messages → Expect 400/422 with detail"""
        payload = {
            "stream": False,
            "temperature": 0.5,
            "max_tokens": 300
            # Missing 'messages' field
        }
        
        try:
            response = self.session.post(f"{self.backend_url}/ai/chat", 
                                       json=payload, timeout=10)
            
            # Accept both 400 (Bad Request) and 422 (Unprocessable Entity) as valid
            if response.status_code in [400, 422]:
                try:
                    data = response.json()
                    if 'detail' in data:
                        self.log_result("POST /api/ai/chat (missing messages)", True, 
                                      f"Returns {response.status_code} with detail: {data['detail']}")
                        return True
                    else:
                        self.log_result("POST /api/ai/chat (missing messages)", False, 
                                      f"{response.status_code} status but no 'detail' field: {data}")
                except json.JSONDecodeError:
                    self.log_result("POST /api/ai/chat (missing messages)", False, 
                                  f"{response.status_code} status but invalid JSON: {response.text}")
            else:
                self.log_result("POST /api/ai/chat (missing messages)", False, 
                              f"Expected 400/422, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST /api/ai/chat (missing messages)", False, f"Exception: {str(e)}")
        return False
    
    def test_backend_logs_for_secrets(self):
        """Check backend logs for secret leaks"""
        try:
            # Check supervisor backend logs
            import subprocess
            result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.out.log'], 
                                  capture_output=True, text=True, timeout=5)
            
            if result.returncode == 0:
                log_content = result.stdout
                if EMERGENT_API_KEY in log_content:
                    self.log_result("Backend Logs Secret Check", False, 
                                  f"CRITICAL: EMERGENT_API_KEY found in backend logs")
                    return False
                else:
                    self.log_result("Backend Logs Secret Check", True, 
                                  "No API key leaks found in backend logs")
                    return True
            else:
                self.log_result("Backend Logs Secret Check", False, 
                              f"Could not read logs: {result.stderr}")
        except Exception as e:
            self.log_result("Backend Logs Secret Check", False, f"Exception: {str(e)}")
        return False
    
    def run_all_tests(self):
        """Run all backend tests as per review request"""
        print("🎯 BACKEND AI CHAT ENDPOINT TESTING - REVIEW REQUEST FOCUSED")
        print("=" * 70)
        print(f"Backend URL: {self.backend_url}")
        print()
        
        # Health checks first
        print("📋 HEALTH CHECKS:")
        self.test_health_endpoint()
        self.test_api_root_endpoint()
        
        print("🤖 AI CHAT ENDPOINT TESTS:")
        # Main AI chat tests
        self.test_ai_chat_non_stream()
        self.test_ai_chat_stream()
        self.test_ai_chat_missing_messages()
        
        print("🔒 SECURITY CHECKS:")
        # Security validation
        self.test_backend_logs_for_secrets()
        
        # Summary
        print("=" * 70)
        print("📊 TEST SUMMARY:")
        passed = sum(1 for r in self.results if r['success'])
        total = len(self.results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"✅ PASSED: {passed}/{total} ({success_rate:.1f}%)")
        
        if passed < total:
            print("❌ FAILED TESTS:")
            for r in self.results:
                if not r['success']:
                    print(f"   - {r['test']}: {r['details']}")
        
        print()
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 ALL TESTS PASSED - AI Chat endpoint fully functional!")
    else:
        print("⚠️  SOME TESTS FAILED - Check details above")
    
    exit(0 if success else 1)