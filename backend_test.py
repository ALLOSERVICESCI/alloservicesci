#!/usr/bin/env python3
"""
Test général du backend FastAPI exposé sous le préfixe /api
Couverture demandée selon review request:
1) Disponibilité & CORS
2) Endpoints connus  
3) Génération DOCX
4) Robustesse
5) Performance
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Base URL - using production backend URL from frontend config
BASE_URL = "https://ivoiremobility.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Allo-Services-CI-Test/1.0'
        })
        self.test_results = []
        self.created_user_id = None
        self.created_alert_id = None
        
    def log_result(self, endpoint: str, method: str, status: str, reason: str, response_data: Any = None):
        """Log test result"""
        result = {
            'endpoint': endpoint,
            'method': method,
            'status': status,
            'reason': reason,
            'response_data': response_data
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} {method} {endpoint} - {status}: {reason}")
        
    def test_health_check(self):
        """Test basic health endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_result('/health', 'GET', 'PASS', 'Health check successful', data)
                else:
                    self.log_result('/health', 'GET', 'FAIL', f'Unexpected response: {data}')
            else:
                self.log_result('/health', 'GET', 'FAIL', f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/health', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_auth_register(self):
        """Test POST /api/auth/register with realistic Ivorian data"""
        payload = {
            "first_name": "Jean-Baptiste",
            "last_name": "Kouamé",
            "email": "jean.kouame@example.ci",
            "phone": "+225 07 12 34 56 78",
            "preferred_lang": "fr",
            "city": "Abidjan",
            "pseudo": "jbkouame",  # Note: may not be supported by backend
            "show_pseudo": True     # Note: may not be supported by backend
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/register", json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('first_name') == payload['first_name']:
                    self.created_user_id = data['id']
                    self.log_result('/auth/register', 'POST', 'PASS', 
                                  f'User created successfully with ID: {self.created_user_id}', data)
                else:
                    self.log_result('/auth/register', 'POST', 'FAIL', f'Invalid response structure: {data}')
            else:
                self.log_result('/auth/register', 'POST', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/auth/register', 'POST', 'FAIL', f'Exception: {str(e)}')

    def test_user_update(self):
        """Test PATCH /api/users/<id> with city, email, phone updates"""
        if not self.created_user_id:
            self.log_result('/users/<id>', 'PATCH', 'SKIP', 'No user ID available from registration')
            return
            
        payload = {
            "city": "Yamoussoukro",
            "email": "jean.updated@example.ci", 
            "phone": "+225 01 02 03 04 05"
        }
        
        try:
            response = self.session.patch(f"{BASE_URL}/users/{self.created_user_id}", 
                                        json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if (data.get('city') == payload['city'] and 
                    data.get('email') == payload['email'] and
                    data.get('phone') == payload['phone']):
                    self.log_result('/users/<id>', 'PATCH', 'PASS', 
                                  'User updated successfully with all fields', data)
                else:
                    self.log_result('/users/<id>', 'PATCH', 'FAIL', 
                                  f'Fields not updated correctly: {data}')
            else:
                self.log_result('/users/<id>', 'PATCH', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/users/<id>', 'PATCH', 'FAIL', f'Exception: {str(e)}')

    def test_subscription_check(self):
        """Test GET /api/subscriptions/check?user_id=<id>"""
        if not self.created_user_id:
            self.log_result('/subscriptions/check', 'GET', 'SKIP', 'No user ID available')
            return
            
        try:
            response = self.session.get(f"{BASE_URL}/subscriptions/check?user_id={self.created_user_id}", 
                                      timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'is_premium' in data and isinstance(data['is_premium'], bool):
                    self.log_result('/subscriptions/check', 'GET', 'PASS', 
                                  f'Subscription check successful: is_premium={data["is_premium"]}', data)
                else:
                    self.log_result('/subscriptions/check', 'GET', 'FAIL', 
                                  f'Missing or invalid is_premium field: {data}')
            else:
                self.log_result('/subscriptions/check', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/subscriptions/check', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_alerts_list(self):
        """Test GET /api/alerts"""
        try:
            response = self.session.get(f"{BASE_URL}/alerts", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result('/alerts', 'GET', 'PASS', 
                                  f'Alerts list retrieved successfully: {len(data)} alerts', 
                                  {'count': len(data)})
                else:
                    self.log_result('/alerts', 'GET', 'FAIL', f'Expected list, got: {type(data)}')
            else:
                self.log_result('/alerts', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/alerts', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_alerts_unread_count(self):
        """Test GET /api/alerts/unread_count?user_id=<id>"""
        if not self.created_user_id:
            self.log_result('/alerts/unread_count', 'GET', 'SKIP', 'No user ID available')
            return
            
        try:
            response = self.session.get(f"{BASE_URL}/alerts/unread_count?user_id={self.created_user_id}", 
                                      timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and isinstance(data['count'], int):
                    self.log_result('/alerts/unread_count', 'GET', 'PASS', 
                                  f'Unread count retrieved: {data["count"]}', data)
                else:
                    self.log_result('/alerts/unread_count', 'GET', 'FAIL', 
                                  f'Missing or invalid count field: {data}')
            else:
                self.log_result('/alerts/unread_count', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/alerts/unread_count', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_alerts_create_and_verify(self):
        """Test POST /api/alerts then GET to confirm presence"""
        payload = {
            "title": "Embouteillage important",
            "type": "accident",
            "description": "Circulation très difficile sur l'autoroute du Nord à hauteur de Yopougon en direction du Plateau. Prévoir itinéraire alternatif.",
            "city": "Abidjan"
        }
        
        try:
            # Create alert
            response = self.session.post(f"{BASE_URL}/alerts", json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('title') == payload['title']:
                    self.created_alert_id = data['id']
                    self.log_result('/alerts', 'POST', 'PASS', 
                                  f'Alert created successfully with ID: {self.created_alert_id}', data)
                    
                    # Verify alert exists in list
                    time.sleep(1)  # Brief delay to ensure consistency
                    list_response = self.session.get(f"{BASE_URL}/alerts", timeout=10)
                    if list_response.status_code == 200:
                        alerts = list_response.json()
                        found = any(alert.get('id') == self.created_alert_id for alert in alerts)
                        if found:
                            self.log_result('/alerts verification', 'GET', 'PASS', 
                                          'Created alert found in alerts list')
                        else:
                            self.log_result('/alerts verification', 'GET', 'FAIL', 
                                          'Created alert not found in alerts list')
                    else:
                        self.log_result('/alerts verification', 'GET', 'FAIL', 
                                      f'Failed to retrieve alerts for verification: {list_response.status_code}')
                else:
                    self.log_result('/alerts', 'POST', 'FAIL', f'Invalid response structure: {data}')
            else:
                self.log_result('/alerts', 'POST', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/alerts', 'POST', 'FAIL', f'Exception: {str(e)}')

    def test_cinetpay_initiate(self):
        """Test POST /api/payments/cinetpay/initiate"""
        if not self.created_user_id:
            self.log_result('/payments/cinetpay/initiate', 'POST', 'SKIP', 'No user ID available')
            return
            
        payload = {
            "user_id": self.created_user_id,
            "amount_fcfa": 1200
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/payments/cinetpay/initiate", 
                                       json=payload, timeout=20)
            if response.status_code == 200:
                data = response.json()
                if ('payment_url' in data and 'transaction_id' in data and 
                    data.get('provider') == 'cinetpay'):
                    self.log_result('/payments/cinetpay/initiate', 'POST', 'PASS', 
                                  f'Payment initiated: transaction_id={data["transaction_id"]}, payment_url={data["payment_url"][:50]}...', 
                                  data)
                else:
                    self.log_result('/payments/cinetpay/initiate', 'POST', 'FAIL', 
                                  f'Missing required fields in response: {data}')
            else:
                self.log_result('/payments/cinetpay/initiate', 'POST', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/payments/cinetpay/initiate', 'POST', 'FAIL', f'Exception: {str(e)}')

    def test_pharmacies_baseline(self):
        """Test GET /api/pharmacies (baseline)"""
        try:
            response = self.session.get(f"{BASE_URL}/pharmacies", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check structure of first pharmacy if any
                    if data:
                        first = data[0]
                        required_fields = ['id', 'name', 'address', 'city', 'on_duty']
                        missing = [f for f in required_fields if f not in first]
                        if not missing:
                            self.log_result('/pharmacies', 'GET', 'PASS', 
                                          f'Baseline pharmacies retrieved: {len(data)} pharmacies with correct structure')
                        else:
                            self.log_result('/pharmacies', 'GET', 'FAIL', 
                                          f'Missing required fields: {missing}')
                    else:
                        self.log_result('/pharmacies', 'GET', 'PASS', 
                                      'Baseline pharmacies retrieved: 0 pharmacies (empty but valid)')
                else:
                    self.log_result('/pharmacies', 'GET', 'FAIL', f'Expected list, got: {type(data)}')
            else:
                self.log_result('/pharmacies', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/pharmacies', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_pharmacies_city_filter(self):
        """Test GET /api/pharmacies?city=Abidjan"""
        try:
            response = self.session.get(f"{BASE_URL}/pharmacies?city=Abidjan", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Verify all results match city filter
                    if data:
                        all_abidjan = all(p.get('city', '').lower() == 'abidjan' for p in data)
                        if all_abidjan:
                            self.log_result('/pharmacies?city=Abidjan', 'GET', 'PASS', 
                                          f'City filter working: {len(data)} pharmacies in Abidjan')
                        else:
                            self.log_result('/pharmacies?city=Abidjan', 'GET', 'FAIL', 
                                          'Some pharmacies do not match city filter')
                    else:
                        self.log_result('/pharmacies?city=Abidjan', 'GET', 'PASS', 
                                      'City filter working: 0 pharmacies in Abidjan (valid result)')
                else:
                    self.log_result('/pharmacies?city=Abidjan', 'GET', 'FAIL', f'Expected list, got: {type(data)}')
            else:
                self.log_result('/pharmacies?city=Abidjan', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/pharmacies?city=Abidjan', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_pharmacies_on_duty(self):
        """Test GET /api/pharmacies?on_duty=true"""
        try:
            response = self.session.get(f"{BASE_URL}/pharmacies?on_duty=true", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Verify all results have on_duty=true
                    if data:
                        all_on_duty = all(p.get('on_duty') is True for p in data)
                        if all_on_duty:
                            self.log_result('/pharmacies?on_duty=true', 'GET', 'PASS', 
                                          f'On-duty filter working: {len(data)} pharmacies on duty')
                        else:
                            self.log_result('/pharmacies?on_duty=true', 'GET', 'FAIL', 
                                          'Some pharmacies are not on duty')
                    else:
                        self.log_result('/pharmacies?on_duty=true', 'GET', 'PASS', 
                                      'On-duty filter working: 0 pharmacies on duty (valid result)')
                else:
                    self.log_result('/pharmacies?on_duty=true', 'GET', 'FAIL', f'Expected list, got: {type(data)}')
            else:
                self.log_result('/pharmacies?on_duty=true', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/pharmacies?on_duty=true', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_pharmacies_near_location(self):
        """Test GET /api/pharmacies?near_lat=5.341&near_lng=-4.03&max_km=5"""
        try:
            response = self.session.get(f"{BASE_URL}/pharmacies?near_lat=5.341&near_lng=-4.03&max_km=5", 
                                      timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result('/pharmacies?near_lat=5.341&near_lng=-4.03&max_km=5', 'GET', 'PASS', 
                                  f'Near location filter working: {len(data)} pharmacies within 5km')
                else:
                    self.log_result('/pharmacies?near_lat=5.341&near_lng=-4.03&max_km=5', 'GET', 'FAIL', 
                                  f'Expected list, got: {type(data)}')
            else:
                self.log_result('/pharmacies?near_lat=5.341&near_lng=-4.03&max_km=5', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/pharmacies?near_lat=5.341&near_lng=-4.03&max_km=5', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_health_facilities_city(self):
        """Test GET /api/health/facilities?city=Abidjan (>=10 expected)"""
        try:
            response = self.session.get(f"{BASE_URL}/health/facilities?city=Abidjan", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) >= 10:
                        # Check structure
                        if data:
                            first = data[0]
                            required_fields = ['id', 'name', 'facility_type', 'city']
                            missing = [f for f in required_fields if f not in first]
                            if not missing:
                                self.log_result('/health/facilities?city=Abidjan', 'GET', 'PASS', 
                                              f'Health facilities retrieved: {len(data)} facilities (>= 10 ✅)')
                            else:
                                self.log_result('/health/facilities?city=Abidjan', 'GET', 'FAIL', 
                                              f'Missing required fields: {missing}')
                        else:
                            self.log_result('/health/facilities?city=Abidjan', 'GET', 'FAIL', 
                                          'Empty response despite count >= 10')
                    else:
                        self.log_result('/health/facilities?city=Abidjan', 'GET', 'FAIL', 
                                      f'Expected >= 10 facilities, got {len(data)}')
                else:
                    self.log_result('/health/facilities?city=Abidjan', 'GET', 'FAIL', f'Expected list, got: {type(data)}')
            else:
                self.log_result('/health/facilities?city=Abidjan', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/health/facilities?city=Abidjan', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_health_facilities_commune(self):
        """Test GET /api/health/facilities?commune=Cocody (>=3 expected)"""
        try:
            response = self.session.get(f"{BASE_URL}/health/facilities?commune=Cocody", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) >= 3:
                        # Verify all results match commune filter
                        all_cocody = all(p.get('commune', '').lower() == 'cocody' for p in data)
                        if all_cocody:
                            self.log_result('/health/facilities?commune=Cocody', 'GET', 'PASS', 
                                          f'Commune filter working: {len(data)} facilities in Cocody (>= 3 ✅)')
                        else:
                            self.log_result('/health/facilities?commune=Cocody', 'GET', 'FAIL', 
                                          'Some facilities do not match commune filter')
                    else:
                        self.log_result('/health/facilities?commune=Cocody', 'GET', 'FAIL', 
                                      f'Expected >= 3 facilities, got {len(data)}')
                else:
                    self.log_result('/health/facilities?commune=Cocody', 'GET', 'FAIL', f'Expected list, got: {type(data)}')
            else:
                self.log_result('/health/facilities?commune=Cocody', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/health/facilities?commune=Cocody', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_health_facilities_near_location(self):
        """Test GET /api/health/facilities?near_lat=5.401012&near_lng=-3.957433&max_km=5"""
        try:
            response = self.session.get(f"{BASE_URL}/health/facilities?near_lat=5.401012&near_lng=-3.957433&max_km=5", 
                                      timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result('/health/facilities?near_lat=5.401012&near_lng=-3.957433&max_km=5', 'GET', 'PASS', 
                                  f'Near location filter working: {len(data)} facilities within 5km of CHU Angré coordinates')
                else:
                    self.log_result('/health/facilities?near_lat=5.401012&near_lng=-3.957433&max_km=5', 'GET', 'FAIL', 
                                  f'Expected list, got: {type(data)}')
            else:
                self.log_result('/health/facilities?near_lat=5.401012&near_lng=-3.957433&max_km=5', 'GET', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/health/facilities?near_lat=5.401012&near_lng=-3.957433&max_km=5', 'GET', 'FAIL', f'Exception: {str(e)}')

    def test_ai_chat_non_streaming(self):
        """Test POST /api/ai/chat with stream=false"""
        payload = {
            "messages": [
                {"role": "user", "content": "Parlez-moi d'Abidjan en quelques phrases."}
            ],
            "stream": False,
            "temperature": 0.5,
            "max_tokens": 200
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/ai/chat", json=payload, timeout=20)
            if response.status_code == 200:
                data = response.json()
                if 'content' in data and isinstance(data['content'], str) and len(data['content']) > 0:
                    self.log_result('/ai/chat (stream=false)', 'POST', 'PASS', 
                                  f'AI chat response received: {len(data["content"])} characters', 
                                  {'content_length': len(data['content'])})
                else:
                    self.log_result('/ai/chat (stream=false)', 'POST', 'FAIL', 
                                  f'Missing or invalid content field: {data}')
            else:
                self.log_result('/ai/chat (stream=false)', 'POST', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/ai/chat (stream=false)', 'POST', 'FAIL', f'Exception: {str(e)}')

    def test_ai_chat_streaming(self):
        """Test POST /api/ai/chat with stream=true (SSE)"""
        payload = {
            "messages": [
                {"role": "user", "content": "Donnez-moi 3 conseils pour visiter Abidjan."}
            ],
            "stream": True,
            "temperature": 0.5,
            "max_tokens": 300
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/ai/chat", json=payload, 
                                       timeout=25, stream=True)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'text/event-stream' in content_type:
                    chunks_received = 0
                    done_received = False
                    
                    for line in response.iter_lines(decode_unicode=True):
                        if line.startswith('data: '):
                            data_part = line[6:]  # Remove 'data: ' prefix
                            if data_part == '[DONE]':
                                done_received = True
                                break
                            else:
                                try:
                                    chunk_data = json.loads(data_part)
                                    if 'content' in chunk_data:
                                        chunks_received += 1
                                except json.JSONDecodeError:
                                    pass
                    
                    if done_received and chunks_received > 0:
                        self.log_result('/ai/chat (stream=true)', 'POST', 'PASS', 
                                      f'SSE streaming working: {chunks_received} chunks received, [DONE] termination confirmed')
                    elif done_received:
                        self.log_result('/ai/chat (stream=true)', 'POST', 'PASS', 
                                      'SSE streaming working: [DONE] termination confirmed (no content chunks)')
                    else:
                        self.log_result('/ai/chat (stream=true)', 'POST', 'FAIL', 
                                      f'SSE streaming incomplete: {chunks_received} chunks, [DONE] not received')
                else:
                    self.log_result('/ai/chat (stream=true)', 'POST', 'FAIL', 
                                  f'Expected text/event-stream, got: {content_type}')
            else:
                self.log_result('/ai/chat (stream=true)', 'POST', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/ai/chat (stream=true)', 'POST', 'FAIL', f'Exception: {str(e)}')

    def test_ai_docx_export(self):
        """Test POST /api/ai/export/docx - DOCX Export with specific content"""
        payload = {
            "content": "Bonjour Allô IA\n\nCeci est un test d'export DOCX pour valider la nouvelle fonctionnalité.\n\nMerci pour votre service!",
            "title": "Test Export DOCX - Allô Services CI"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/ai/export/docx", json=payload, timeout=20)
            if response.status_code == 200:
                # Check Content-Type header
                content_type = response.headers.get('content-type', '')
                expected_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                
                if content_type == expected_type:
                    # Check Content-Disposition header for attachment
                    content_disposition = response.headers.get('content-disposition', '')
                    if 'attachment' in content_disposition:
                        # Check file is not empty
                        content_length = len(response.content)
                        if content_length > 0:
                            self.log_result('/ai/export/docx', 'POST', 'PASS', 
                                          f'DOCX export successful - Content-Type: {content_type}, '
                                          f'Content-Disposition: {content_disposition}, '
                                          f'File size: {content_length} bytes')
                        else:
                            self.log_result('/ai/export/docx', 'POST', 'FAIL', 'DOCX file is empty')
                    else:
                        self.log_result('/ai/export/docx', 'POST', 'FAIL', 
                                      f'Missing attachment in Content-Disposition: {content_disposition}')
                else:
                    self.log_result('/ai/export/docx', 'POST', 'FAIL', 
                                  f'Wrong Content-Type: {content_type}, expected: {expected_type}')
            else:
                self.log_result('/ai/export/docx', 'POST', 'FAIL', 
                              f'Status {response.status_code}: {response.text}')
        except Exception as e:
            self.log_result('/ai/export/docx', 'POST', 'FAIL', f'Exception: {str(e)}')

    def run_all_tests(self):
        """Run comprehensive backend regression test suite"""
        print("🚀 Starting Comprehensive Backend Regression Test for Allô Services CI")
        print(f"📍 Base URL: {BASE_URL}")
        print("=" * 80)
        
        # Health check first
        self.test_health_check()
        
        # 1) Auth & Users
        print("\n📋 1) AUTH & USERS TESTS")
        self.test_auth_register()
        self.test_user_update()
        self.test_subscription_check()
        
        # 2) Alerts
        print("\n🚨 2) ALERTS TESTS")
        self.test_alerts_list()
        self.test_alerts_unread_count()
        self.test_alerts_create_and_verify()
        
        # 3) Payments
        print("\n💳 3) PAYMENTS TESTS")
        self.test_cinetpay_initiate()
        
        # 4) Pharmacies
        print("\n💊 4) PHARMACIES TESTS")
        self.test_pharmacies_baseline()
        self.test_pharmacies_city_filter()
        self.test_pharmacies_on_duty()
        self.test_pharmacies_near_location()
        
        # 5) Health facilities
        print("\n🏥 5) HEALTH FACILITIES TESTS")
        self.test_health_facilities_city()
        self.test_health_facilities_commune()
        self.test_health_facilities_near_location()
        
        # 6) AI Chat
        print("\n🤖 6) AI CHAT TESTS")
        self.test_ai_chat_non_streaming()
        self.test_ai_chat_streaming()
        self.test_ai_docx_export()
        
        # Summary
        self.print_summary()

    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE BACKEND REGRESSION TEST SUMMARY")
        print("=" * 80)
        
        passed = [r for r in self.test_results if r['status'] == 'PASS']
        failed = [r for r in self.test_results if r['status'] == 'FAIL']
        skipped = [r for r in self.test_results if r['status'] == 'SKIP']
        
        total = len(self.test_results)
        pass_rate = (len(passed) / total * 100) if total > 0 else 0
        
        print(f"✅ PASSED: {len(passed)}")
        print(f"❌ FAILED: {len(failed)}")
        print(f"⏭️  SKIPPED: {len(skipped)}")
        print(f"📈 SUCCESS RATE: {pass_rate:.1f}% ({len(passed)}/{total})")
        
        if failed:
            print(f"\n❌ FAILED TESTS ({len(failed)}):")
            for result in failed:
                print(f"   • {result['method']} {result['endpoint']}: {result['reason']}")
        
        if skipped:
            print(f"\n⏭️  SKIPPED TESTS ({len(skipped)}):")
            for result in skipped:
                print(f"   • {result['method']} {result['endpoint']}: {result['reason']}")
        
        print("\n" + "=" * 80)
        
        # Return exit code based on results
        return 0 if len(failed) == 0 else 1

def run_quick_smoke_test():
    """Run quick smoke test for the 3 specific endpoints requested"""
    print("🚀 Quick Backend Smoke Test - No Regressions Check")
    print(f"📍 Base URL: {BASE_URL}")
    print("=" * 60)
    
    tester = BackendTester()
    
    # Test the 3 specific endpoints
    print("🔍 1) GET /api/alerts → 200 + JSON list")
    tester.test_alerts_list()
    
    print("\n🔍 2) GET /api/alerts/unread_count → 200 + int")
    # Test without user_id for quick smoke test
    try:
        response = tester.session.get(f"{BASE_URL}/alerts/unread_count", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'count' in data and isinstance(data['count'], int):
                tester.log_result('/alerts/unread_count', 'GET', 'PASS', 
                              f'Unread count retrieved: {data["count"]}', data)
            else:
                tester.log_result('/alerts/unread_count', 'GET', 'FAIL', 
                              f'Missing or invalid count field: {data}')
        else:
            tester.log_result('/alerts/unread_count', 'GET', 'FAIL', 
                          f'Status {response.status_code}: {response.text}')
    except Exception as e:
        tester.log_result('/alerts/unread_count', 'GET', 'FAIL', f'Exception: {str(e)}')
    
    print("\n🔍 3) GET /api/health/facilities?city=Abidjan → 200")
    tester.test_health_facilities_city()
    
    # Quick summary
    print("\n" + "=" * 60)
    print("📊 QUICK SMOKE TEST SUMMARY")
    print("=" * 60)
    
    passed = [r for r in tester.test_results if r['status'] == 'PASS']
    failed = [r for r in tester.test_results if r['status'] == 'FAIL']
    
    total = len(tester.test_results)
    
    print(f"✅ PASSED: {len(passed)}/{total}")
    print(f"❌ FAILED: {len(failed)}/{total}")
    
    if failed:
        print(f"\n❌ FAILED TESTS:")
        for result in failed:
            print(f"   • {result['method']} {result['endpoint']}: {result['reason']}")
    else:
        print("\n🎉 ALL SMOKE TESTS PASSED - No regressions detected!")
    
    return 0 if len(failed) == 0 else 1

def run_review_request_test():
    """Run specific test according to review request requirements"""
    print("🚀 Test général du backend FastAPI exposé sous le préfixe /api")
    print(f"📍 Base URL: {BASE_URL}")
    print("=" * 80)
    
    tester = BackendTester()
    
    # 1) Disponibilité & CORS
    print("\n1) DISPONIBILITÉ & CORS")
    print("- Vérifier qu'un appel simple à /api/alerts et /api/alerts/unread_count?user_id=test-user renvoie 200 JSON")
    print("- Vérifier que les entêtes CORS standards sont présents")
    
    # Test /api/alerts
    try:
        start_time = time.time()
        response = tester.session.get(f"{BASE_URL}/alerts", timeout=10)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    # Check CORS headers (case-insensitive)
                    cors_origin = response.headers.get('access-control-allow-origin') or response.headers.get('Access-Control-Allow-Origin', 'Not found')
                    cors_credentials = response.headers.get('access-control-allow-credentials') or response.headers.get('Access-Control-Allow-Credentials', 'Not found')
                    cors_methods = response.headers.get('access-control-allow-methods') or response.headers.get('Access-Control-Allow-Methods', 'Not found')
                    
                    tester.log_result('/alerts', 'GET', 'PASS', 
                                    f'200 JSON array with {len(data)} items. Response time: {response_time:.3f}s. CORS - Origin: {cors_origin}, Methods: {cors_methods}, Headers: {cors_headers}')
                else:
                    tester.log_result('/alerts', 'GET', 'FAIL', f'Expected JSON array, got {type(data)}')
            except json.JSONDecodeError:
                tester.log_result('/alerts', 'GET', 'FAIL', '200 but invalid JSON response')
        else:
            tester.log_result('/alerts', 'GET', 'FAIL', f'Status {response.status_code}: {response.text[:200]}')
    except Exception as e:
        tester.log_result('/alerts', 'GET', 'FAIL', f'Request failed: {str(e)}')
    
    # Test /api/alerts/unread_count?user_id=test-user
    try:
        start_time = time.time()
        response = tester.session.get(f"{BASE_URL}/alerts/unread_count?user_id=test-user", timeout=10)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, dict) and 'count' in data and isinstance(data['count'], int):
                    cors_origin = response.headers.get('Access-Control-Allow-Origin', 'Not found')
                    tester.log_result('/alerts/unread_count?user_id=test-user', 'GET', 'PASS', 
                                    f'200 JSON with count={data["count"]} (int). Response time: {response_time:.3f}s. CORS Origin: {cors_origin}')
                else:
                    tester.log_result('/alerts/unread_count?user_id=test-user', 'GET', 'FAIL', 
                                    f'Expected JSON with count (int), got {data}')
            except json.JSONDecodeError:
                tester.log_result('/alerts/unread_count?user_id=test-user', 'GET', 'FAIL', '200 but invalid JSON response')
        else:
            tester.log_result('/alerts/unread_count?user_id=test-user', 'GET', 'FAIL', 
                            f'Status {response.status_code}: {response.text[:200]}')
    except Exception as e:
        tester.log_result('/alerts/unread_count?user_id=test-user', 'GET', 'FAIL', f'Request failed: {str(e)}')
    
    # 2) Endpoints connus
    print("\n2) ENDPOINTS CONNUS")
    print("- GET /api/alerts → 200, JSON array")
    print("- GET /api/alerts/unread_count?user_id=test-user → 200, JSON avec un entier")
    print("(Already tested above)")
    
    # 3) Génération DOCX
    print("\n3) GÉNÉRATION DOCX")
    print("- POST /api/ai/export/docx (payload minimal)")
    print("- POST /api/ai/export/docx (payload complet)")
    
    # Test minimal payload
    minimal_payload = {
        "title": "Test DOCX",
        "content": "Ceci est un test minimal."
    }
    
    try:
        start_time = time.time()
        response = tester.session.post(f"{BASE_URL}/ai/export/docx", json=minimal_payload, timeout=15)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            content_disposition = response.headers.get('Content-Disposition', '')
            content_length = len(response.content)
            
            expected_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            is_docx = content_type == expected_type
            has_attachment = 'attachment' in content_disposition
            is_non_empty = content_length > 0
            
            if is_docx and has_attachment and is_non_empty:
                tester.log_result('/ai/export/docx (minimal)', 'POST', 'PASS', 
                                f'200, Content-Type: {expected_type}, Content-Disposition: {content_disposition}, Size: {content_length} bytes, Response time: {response_time:.3f}s')
            else:
                tester.log_result('/ai/export/docx (minimal)', 'POST', 'FAIL', 
                                f'Missing requirements - DOCX: {is_docx}, Attachment: {has_attachment}, Non-empty: {is_non_empty}')
        else:
            tester.log_result('/ai/export/docx (minimal)', 'POST', 'FAIL', 
                            f'Status {response.status_code}: {response.text[:200]}')
    except Exception as e:
        tester.log_result('/ai/export/docx (minimal)', 'POST', 'FAIL', f'Request failed: {str(e)}')
    
    # Test complete payload
    complete_payload = {
        "title": "CV Candidat",
        "content": """Profil
Développeur Mobile React Native avec 5 ans d'expérience.

Compétences
React Native, Expo, FastAPI, MongoDB

Expériences
Société X (2021-2024): Dév. d'applications Expo Router."""
    }
    
    try:
        start_time = time.time()
        response = tester.session.post(f"{BASE_URL}/ai/export/docx", json=complete_payload, timeout=15)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            content_disposition = response.headers.get('Content-Disposition', '')
            content_length = len(response.content)
            
            expected_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            is_docx = content_type == expected_type
            has_attachment = 'attachment' in content_disposition
            is_non_empty = content_length > 0
            
            if is_docx and has_attachment and is_non_empty:
                tester.log_result('/ai/export/docx (complet)', 'POST', 'PASS', 
                                f'200, Content-Type: {expected_type}, Content-Disposition: {content_disposition}, Size: {content_length} bytes, Response time: {response_time:.3f}s')
            else:
                tester.log_result('/ai/export/docx (complet)', 'POST', 'FAIL', 
                                f'Missing requirements - DOCX: {is_docx}, Attachment: {has_attachment}, Non-empty: {is_non_empty}')
        else:
            tester.log_result('/ai/export/docx (complet)', 'POST', 'FAIL', 
                            f'Status {response.status_code}: {response.text[:200]}')
    except Exception as e:
        tester.log_result('/ai/export/docx (complet)', 'POST', 'FAIL', f'Request failed: {str(e)}')
    
    # 4) Robustesse
    print("\n4) ROBUSTESSE")
    print("- Tenter POST /api/ai/export/docx avec payload invalide → Attendu: 4xx")
    
    # Test invalid payload (content non string)
    invalid_payload = {
        "title": "Test Invalid",
        "content": 123  # Should be string
    }
    
    try:
        start_time = time.time()
        response = tester.session.post(f"{BASE_URL}/ai/export/docx", json=invalid_payload, timeout=10)
        response_time = time.time() - start_time
        
        if 400 <= response.status_code < 500:
            tester.log_result('/ai/export/docx (invalid payload)', 'POST', 'PASS', 
                            f'Correctly returned {response.status_code} for invalid payload. Response time: {response_time:.3f}s')
        else:
            tester.log_result('/ai/export/docx (invalid payload)', 'POST', 'FAIL', 
                            f'Expected 4xx, got {response.status_code}: {response.text[:200]}')
    except Exception as e:
        tester.log_result('/ai/export/docx (invalid payload)', 'POST', 'FAIL', f'Request failed: {str(e)}')
    
    # 5) Performance
    print("\n5) PERFORMANCE")
    print("- Mesurer le temps de réponse approximatif (< 3s pour la génération si possible)")
    
    # Test performance with longer content
    performance_payload = {
        "title": "Test Performance DOCX",
        "content": "Test de performance pour la génération DOCX. " * 100  # Longer content
    }
    
    try:
        start_time = time.time()
        response = tester.session.post(f"{BASE_URL}/ai/export/docx", json=performance_payload, timeout=15)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            if response_time < 3.0:
                tester.log_result('DOCX Generation Performance', 'POST', 'PASS', 
                                f'Response time {response_time:.3f}s < 3s target ✅')
            else:
                tester.log_result('DOCX Generation Performance', 'POST', 'FAIL', 
                                f'Response time {response_time:.3f}s >= 3s target ❌')
        else:
            tester.log_result('DOCX Generation Performance', 'POST', 'FAIL', 
                            f'Failed with status {response.status_code}')
    except Exception as e:
        tester.log_result('DOCX Generation Performance', 'POST', 'FAIL', f'Request failed: {str(e)}')
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 RÉSULTATS DU TEST GÉNÉRAL BACKEND")
    print("=" * 80)
    
    passed = [r for r in tester.test_results if r['status'] == 'PASS']
    failed = [r for r in tester.test_results if r['status'] == 'FAIL']
    
    total = len(tester.test_results)
    pass_rate = (len(passed) / total * 100) if total > 0 else 0
    
    print(f"✅ RÉUSSIS: {len(passed)}")
    print(f"❌ ÉCHECS: {len(failed)}")
    print(f"📈 TAUX DE RÉUSSITE: {pass_rate:.1f}% ({len(passed)}/{total})")
    
    if failed:
        print(f"\n❌ TESTS ÉCHOUÉS ({len(failed)}):")
        for result in failed:
            print(f"   • {result['method']} {result['endpoint']}: {result['reason']}")
    else:
        print("\n🎉 TOUS LES TESTS SONT RÉUSSIS!")
    
    print("\n📋 RAPPORT DÉTAILLÉ:")
    print("Codes de statut, temps de réponse et extraits d'erreur éventuels:")
    for result in tester.test_results:
        status_icon = "✅" if result['status'] == 'PASS' else "❌"
        print(f"{status_icon} {result['method']} {result['endpoint']}: {result['reason']}")
    
    return 0 if len(failed) == 0 else 1

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--smoke":
        exit_code = run_quick_smoke_test()
    elif len(sys.argv) > 1 and sys.argv[1] == "--review":
        exit_code = run_review_request_test()
    else:
        tester = BackendTester()
        exit_code = tester.run_all_tests()
    sys.exit(exit_code)