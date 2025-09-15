#!/usr/bin/env python3
"""
RÉGRESSION BACKEND COMPLÈTE - Test des 6 endpoints spécifiés dans la review request
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Base URL from frontend environment
BASE_URL = "https://allo-services-2.preview.emergentagent.com/api"

class RegressionTester:
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

    def test_regression_backend_complete(self):
        """RÉGRESSION BACKEND COMPLÈTE - Test des 6 endpoints spécifiés"""
        print("🔍 RÉGRESSION BACKEND COMPLÈTE")
        print("=" * 80)
        print(f"Base URL: {self.base_url}")
        print("=" * 80)
        
        # Créer un utilisateur test d'abord
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
                self.log_test("Création utilisateur test", True, f"Utilisateur créé: {test_user_id}")
            else:
                self.log_test("Création utilisateur test", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_test("Création utilisateur test", False, f"Exception: {str(e)}")
            return
        
        # 1) POST /api/payments/cinetpay/initiate → 200 + payment_url + transaction_id
        print("\n1️⃣ TEST: POST /api/payments/cinetpay/initiate")
        print("-" * 60)
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
                    self.log_test("CinetPay initiate", True, f"200 + payment_url: {payment_url[:50]}... + transaction_id: {transaction_id}")
                else:
                    self.log_test("CinetPay initiate", False, f"200 mais manque payment_url ou transaction_id: {data}")
            else:
                try:
                    error_data = response.json()
                    detail = error_data.get('detail', 'Pas de détail')
                    self.log_test("CinetPay initiate", False, f"{response.status_code} - Erreur: {detail}")
                except:
                    self.log_test("CinetPay initiate", False, f"{response.status_code} - Réponse: {response.text}")
        except Exception as e:
            self.log_test("CinetPay initiate", False, f"Exception: {str(e)}")
        
        # 2) PATCH /api/users/<id> → 200 + champs mis à jour
        print("\n2️⃣ TEST: PATCH /api/users/<id>")
        print("-" * 60)
        try:
            update_data = {
                "city": "Yamoussoukro",
                "email": "jean.updated@example.ci",
                "phone": "+225 01 02 03 04 05"
            }
            response = self.make_request('PATCH', f'/users/{test_user_id}', json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('city') == 'Yamoussoukro' and data.get('email') == 'jean.updated@example.ci':
                    self.log_test("User PATCH", True, f"200 + utilisateur mis à jour: city={data.get('city')}, email={data.get('email')}, phone={data.get('phone')}")
                else:
                    self.log_test("User PATCH", False, f"200 mais données non mises à jour correctement: {data}")
            else:
                self.log_test("User PATCH", False, f"Status: {response.status_code}, Réponse: {response.text}")
        except Exception as e:
            self.log_test("User PATCH", False, f"Exception: {str(e)}")
        
        # 3) GET /api/subscriptions/check?user_id=<id> → 200 + is_premium bool
        print("\n3️⃣ TEST: GET /api/subscriptions/check?user_id=<id>")
        print("-" * 60)
        try:
            response = self.make_request('GET', f'/subscriptions/check?user_id={test_user_id}')
            if response.status_code == 200:
                data = response.json()
                if 'is_premium' in data and isinstance(data['is_premium'], bool):
                    is_premium = data['is_premium']
                    expires_at = data.get('expires_at')
                    self.log_test("Subscription check", True, f"200 + is_premium: {is_premium}, expires_at: {expires_at}")
                else:
                    self.log_test("Subscription check", False, f"Manque is_premium ou type incorrect: {data}")
            else:
                self.log_test("Subscription check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Subscription check", False, f"Exception: {str(e)}")
        
        # 4) GET /api/alerts/unread_count?user_id=<id> → 200 + count int
        print("\n4️⃣ TEST: GET /api/alerts/unread_count?user_id=<id>")
        print("-" * 60)
        try:
            response = self.make_request('GET', f'/alerts/unread_count?user_id={test_user_id}')
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and isinstance(data['count'], int):
                    count = data['count']
                    self.log_test("Alerts unread count", True, f"200 + count: {count} (int)")
                else:
                    self.log_test("Alerts unread count", False, f"Manque count ou type incorrect: {data}")
            else:
                self.log_test("Alerts unread count", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Alerts unread count", False, f"Exception: {str(e)}")
        
        # 5) GET /api/pharmacies (sans filtres, avec city, on_duty, near_lat/near_lng, max_km) → 200 + structure JSON + on_duty dynamique
        print("\n5️⃣ TEST: GET /api/pharmacies (filtres multiples)")
        print("-" * 60)
        
        # 5a) Sans filtres
        try:
            response = self.make_request('GET', '/pharmacies')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        sample = data[0]
                        required_fields = ['id', 'name', 'address', 'city', 'on_duty']
                        has_required = all(field in sample for field in required_fields)
                        if has_required:
                            self.log_test("Pharmacies (sans filtres)", True, f"200 + {len(data)} pharmacies avec structure JSON correcte")
                        else:
                            missing = [f for f in required_fields if f not in sample]
                            self.log_test("Pharmacies (sans filtres)", False, f"Structure JSON incomplète, manque: {missing}")
                    else:
                        self.log_test("Pharmacies (sans filtres)", True, f"200 + 0 pharmacies (base vide)")
                else:
                    self.log_test("Pharmacies (sans filtres)", False, f"Expected array, got {type(data)}")
            else:
                self.log_test("Pharmacies (sans filtres)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pharmacies (sans filtres)", False, f"Exception: {str(e)}")
        
        # 5b) Avec city filter
        try:
            response = self.make_request('GET', '/pharmacies?city=Abidjan')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    city_matches = all(
                        item.get('city', '').lower() == 'abidjan' 
                        for item in data
                    ) if len(data) > 0 else True
                    if city_matches:
                        self.log_test("Pharmacies (city=Abidjan)", True, f"200 + {len(data)} pharmacies, toutes correspondent à la ville")
                    else:
                        self.log_test("Pharmacies (city=Abidjan)", False, f"Certaines pharmacies ne correspondent pas à la ville")
                else:
                    self.log_test("Pharmacies (city=Abidjan)", False, f"Expected array, got {type(data)}")
            else:
                self.log_test("Pharmacies (city=Abidjan)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pharmacies (city=Abidjan)", False, f"Exception: {str(e)}")
        
        # 5c) Avec on_duty filter
        try:
            response = self.make_request('GET', '/pharmacies?on_duty=true')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    on_duty_matches = all(
                        item.get('on_duty') == True 
                        for item in data
                    ) if len(data) > 0 else True
                    if on_duty_matches:
                        self.log_test("Pharmacies (on_duty=true)", True, f"200 + {len(data)} pharmacies, toutes on_duty=true (dynamique)")
                    else:
                        non_duty = [item.get('on_duty') for item in data if item.get('on_duty') != True]
                        self.log_test("Pharmacies (on_duty=true)", False, f"Certaines pharmacies ne sont pas on_duty: {non_duty}")
                else:
                    self.log_test("Pharmacies (on_duty=true)", False, f"Expected array, got {type(data)}")
            else:
                self.log_test("Pharmacies (on_duty=true)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pharmacies (on_duty=true)", False, f"Exception: {str(e)}")
        
        # 5d) Avec near_lat/near_lng + max_km
        try:
            abidjan_lat = 5.316667
            abidjan_lng = -4.016667
            max_km = 5
            response = self.make_request('GET', f'/pharmacies?near_lat={abidjan_lat}&near_lng={abidjan_lng}&max_km={max_km}')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Pharmacies (near Abidjan)", True, f"200 + {len(data)} pharmacies dans un rayon de {max_km}km d'Abidjan")
                else:
                    self.log_test("Pharmacies (near Abidjan)", False, f"Expected array, got {type(data)}")
            else:
                self.log_test("Pharmacies (near Abidjan)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pharmacies (near Abidjan)", False, f"Exception: {str(e)}")
        
        # 5e) Combiné city + on_duty
        try:
            response = self.make_request('GET', '/pharmacies?city=Abidjan&on_duty=true')
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    combined_matches = all(
                        item.get('city', '').lower() == 'abidjan' and 
                        item.get('on_duty') == True
                        for item in data
                    ) if len(data) > 0 else True
                    if combined_matches:
                        self.log_test("Pharmacies (city=Abidjan + on_duty)", True, f"200 + {len(data)} pharmacies correspondent aux deux filtres")
                    else:
                        self.log_test("Pharmacies (city=Abidjan + on_duty)", False, f"Certaines pharmacies ne correspondent pas aux filtres combinés")
                else:
                    self.log_test("Pharmacies (city=Abidjan + on_duty)", False, f"Expected array, got {type(data)}")
            else:
                self.log_test("Pharmacies (city=Abidjan + on_duty)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pharmacies (city=Abidjan + on_duty)", False, f"Exception: {str(e)}")
        
        # 6) POST /api/ai/chat (stream=false, prompt simple) → Accepte la requête, renvoie 200 ou erreur contrôlée
        print("\n6️⃣ TEST: POST /api/ai/chat (stream=false)")
        print("-" * 60)
        try:
            chat_data = {
                "messages": [{"role": "user", "content": "Bonjour, dis-moi quelque chose sur la Côte d'Ivoire."}],
                "stream": False,
                "temperature": 0.3,
                "max_tokens": 100
            }
            response = self.make_request('POST', '/ai/chat', json=chat_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'content' in data and isinstance(data['content'], str) and len(data['content']) > 0:
                    content_preview = data['content'][:100] + "..." if len(data['content']) > 100 else data['content']
                    self.log_test("AI chat (stream=false)", True, f"200 + réponse AI: '{content_preview}'")
                else:
                    self.log_test("AI chat (stream=false)", False, f"200 mais format de réponse invalide: {data}")
            elif response.status_code == 500:
                try:
                    error_data = response.json()
                    detail = error_data.get('detail', '')
                    if 'EMERGENT_API_KEY' in detail or 'Chat completion failed' in detail:
                        self.log_test("AI chat (stream=false)", True, f"Erreur contrôlée (API key/service): {detail}")
                    else:
                        self.log_test("AI chat (stream=false)", False, f"Erreur 500 inattendue: {detail}")
                except:
                    self.log_test("AI chat (stream=false)", False, f"Erreur 500 sans détail JSON: {response.text}")
            else:
                self.log_test("AI chat (stream=false)", False, f"Status inattendu: {response.status_code}, Réponse: {response.text}")
        except Exception as e:
            self.log_test("AI chat (stream=false)", False, f"Exception: {str(e)}")
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 RÉSUMÉ RÉGRESSION BACKEND COMPLÈTE")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Réussis: {passed}")
        print(f"Échoués: {total - passed}")
        print(f"Taux de réussite: {(passed/total)*100:.1f}%")
        
        if passed < total:
            print("\n❌ TESTS ÉCHOUÉS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        else:
            print("\n✅ TOUS LES TESTS SONT PASSÉS!")
        
        return passed == total

if __name__ == "__main__":
    tester = RegressionTester()
    success = tester.test_regression_backend_complete()
    sys.exit(0 if success else 1)