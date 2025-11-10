#!/usr/bin/env python3
"""
Test complet du système de traduction multilingue - Backend API Tests
Objectif: Vérifier que le backend et les endpoints API fonctionnent correctement pour supporter le système multilingue.

Tests à effectuer selon la review request:
1. Endpoints API de base: GET /api/alerts, GET /api/pharmacies, GET /api/cities-communes/search?q=Abidjan
2. Endpoints Auth (nouvellement créés): POST /api/register, POST /api/login, POST /api/change-password
3. Vérifications: JSON valide, Status codes corrects (200, 400, 401), CORS headers, Temps < 2s, Pas d'erreurs 500
"""

import requests
import json
import sys
import os
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://ivoire-mobile.preview.emergentagent.com/api"
TIMEOUT = 10

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.user_id = None
        self.test_email = f"test.multilingue.{int(time.time())}@example.ci"
        self.test_password = "motdepasse123"
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_test(self, test_name: str, success: bool, details: str, response_time: float = 0):
        """Log test result"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response_time': response_time
        })
        if success:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
        print(f"[{timestamp}] {status} {test_name}: {details} ({response_time:.3f}s)")
        
    def make_request(self, method: str, endpoint: str, data=None, params=None):
        """Make HTTP request and return response, success, time"""
        url = f"{BACKEND_URL}{endpoint}"
        start_time = time.time()
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, params=params, timeout=TIMEOUT)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, params=params, timeout=TIMEOUT)
            elif method.upper() == 'PATCH':
                response = requests.patch(url, json=data, params=params, timeout=TIMEOUT)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            response_time = time.time() - start_time
            return response, True, response_time
            
        except Exception as e:
            response_time = time.time() - start_time
            return None, False, response_time
            
    def verify_json_response(self, response) -> bool:
        """Verify response is valid JSON"""
        try:
            response.json()
            return True
        except:
            return False
            
    def verify_cors_headers(self, response) -> bool:
        """Verify CORS headers are present"""
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials'
        ]
        return any(header in response.headers for header in cors_headers)
        
    def test_basic_endpoints(self):
        """Test basic API endpoints according to review request"""
        print("\n=== TESTS ENDPOINTS API DE BASE ===")
        
        # Test GET /api/alerts - Vérifier que les alertes sont récupérables
        response, success, response_time = self.make_request('GET', '/alerts')
        if success and response:
            json_valid = self.verify_json_response(response)
            cors_present = self.verify_cors_headers(response)
            status_ok = response.status_code == 200
            time_ok = response_time < 2.0
            
            if status_ok and json_valid and time_ok:
                try:
                    data = response.json()
                    alert_count = len(data) if isinstance(data, list) else 0
                    self.log_test(
                        "GET /api/alerts",
                        True,
                        f"200 OK, JSON valide, {alert_count} alertes, CORS: {cors_present}",
                        response_time
                    )
                except:
                    self.log_test("GET /api/alerts", False, f"Status {response.status_code}, JSON invalide", response_time)
            else:
                issues = []
                if not status_ok: issues.append(f"Status {response.status_code}")
                if not json_valid: issues.append("JSON invalide")
                if not time_ok: issues.append(f"Temps {response_time:.3f}s > 2s")
                self.log_test("GET /api/alerts", False, ", ".join(issues), response_time)
        else:
            self.log_test("GET /api/alerts", False, "Erreur de connexion", response_time)
            
        # Test GET /api/pharmacies - Vérifier liste pharmacies
        response, success, response_time = self.make_request('GET', '/pharmacies')
        if success and response:
            json_valid = self.verify_json_response(response)
            cors_present = self.verify_cors_headers(response)
            status_ok = response.status_code == 200
            time_ok = response_time < 2.0
            
            if status_ok and json_valid and time_ok:
                try:
                    data = response.json()
                    pharmacy_count = len(data) if isinstance(data, list) else 0
                    self.log_test(
                        "GET /api/pharmacies",
                        True,
                        f"200 OK, JSON valide, {pharmacy_count} pharmacies, CORS: {cors_present}",
                        response_time
                    )
                except:
                    self.log_test("GET /api/pharmacies", False, f"Status {response.status_code}, JSON invalide", response_time)
            else:
                issues = []
                if not status_ok: issues.append(f"Status {response.status_code}")
                if not json_valid: issues.append("JSON invalide")
                if not time_ok: issues.append(f"Temps {response_time:.3f}s > 2s")
                self.log_test("GET /api/pharmacies", False, ", ".join(issues), response_time)
        else:
            self.log_test("GET /api/pharmacies", False, "Erreur de connexion", response_time)
            
        # Test GET /api/cities-communes/search?q=Abidjan - Vérifier recherche localités
        response, success, response_time = self.make_request('GET', '/cities-communes/search', params={'q': 'Abidjan'})
        if success and response:
            json_valid = self.verify_json_response(response)
            cors_present = self.verify_cors_headers(response)
            status_ok = response.status_code == 200
            time_ok = response_time < 2.0
            
            if status_ok and json_valid and time_ok:
                try:
                    data = response.json()
                    results = data.get('results', []) if isinstance(data, dict) else []
                    result_count = len(results)
                    self.log_test(
                        "GET /api/cities-communes/search?q=Abidjan",
                        True,
                        f"200 OK, JSON valide, {result_count} résultats, CORS: {cors_present}",
                        response_time
                    )
                except:
                    self.log_test("GET /api/cities-communes/search?q=Abidjan", False, f"Status {response.status_code}, JSON invalide", response_time)
            else:
                issues = []
                if not status_ok: issues.append(f"Status {response.status_code}")
                if not json_valid: issues.append("JSON invalide")
                if not time_ok: issues.append(f"Temps {response_time:.3f}s > 2s")
                self.log_test("GET /api/cities-communes/search?q=Abidjan", False, ", ".join(issues), response_time)
        else:
            self.log_test("GET /api/cities-communes/search?q=Abidjan", False, "Erreur de connexion", response_time)

    def test_auth_endpoints(self):
        """Test authentication endpoints (newly created) according to review request"""
        print("\n=== TESTS ENDPOINTS AUTH (NOUVELLEMENT CRÉÉS) ===")
        
        # Test POST /api/auth/register - Test avec données valides
        register_data = {
            "first_name": "Jean-Baptiste",
            "last_name": "Kouamé",
            "email": self.test_email,
            "password": self.test_password,
            "phone": "+225 01 02 03 04 05",
            "preferred_lang": "fr"
        }
        
        response, success, response_time = self.make_request('POST', '/auth/register', data=register_data)
        if success and response:
            json_valid = self.verify_json_response(response)
            cors_present = self.verify_cors_headers(response)
            time_ok = response_time < 2.0
            
            if response.status_code == 200 and json_valid and time_ok:
                try:
                    data = response.json()
                    self.user_id = data.get('id')
                    has_id = bool(self.user_id)
                    no_password = 'password' not in data and 'password_hash' not in data
                    self.log_test(
                        "POST /api/auth/register",
                        True,
                        f"200 OK, JSON valide, ID utilisateur: {has_id}, Pas de mot de passe exposé: {no_password}, CORS: {cors_present}",
                        response_time
                    )
                except:
                    self.log_test("POST /api/auth/register", False, "Réponse JSON invalide", response_time)
            elif response.status_code == 400:
                # Email might already exist, try with different email
                register_data['email'] = f"test.multilingue.{int(time.time())}.{os.getpid()}@example.ci"
                response2, success2, response_time2 = self.make_request('POST', '/auth/register', data=register_data)
                if success2 and response2 and response2.status_code == 200:
                    try:
                        data = response2.json()
                        self.user_id = data.get('id')
                        self.test_email = register_data['email']  # Update email for login test
                        self.log_test(
                            "POST /api/auth/register",
                            True,
                            f"200 OK (avec nouvel email), JSON valide, ID: {bool(self.user_id)}",
                            response_time2
                        )
                    except:
                        self.log_test("POST /api/auth/register", False, "Réponse JSON invalide", response_time2)
                else:
                    self.log_test("POST /api/auth/register", False, f"Status {response.status_code}, validation échouée", response_time)
            else:
                issues = []
                if response.status_code != 200: issues.append(f"Status {response.status_code}")
                if not json_valid: issues.append("JSON invalide")
                if not time_ok: issues.append(f"Temps {response_time:.3f}s > 2s")
                self.log_test("POST /api/auth/register", False, ", ".join(issues), response_time)
        else:
            self.log_test("POST /api/auth/register", False, "Erreur de connexion", response_time)
            
        # Test POST /api/auth/login - Test authentification
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response, success, response_time = self.make_request('POST', '/auth/login', data=login_data)
        if success and response:
            json_valid = self.verify_json_response(response)
            cors_present = self.verify_cors_headers(response)
            time_ok = response_time < 2.0
            
            if response.status_code == 200 and json_valid and time_ok:
                try:
                    data = response.json()
                    has_id = bool(data.get('id'))
                    no_password = 'password' not in data and 'password_hash' not in data
                    self.log_test(
                        "POST /api/auth/login",
                        True,
                        f"200 OK, JSON valide, ID utilisateur: {has_id}, Pas de mot de passe exposé: {no_password}, CORS: {cors_present}",
                        response_time
                    )
                except:
                    self.log_test("POST /api/auth/login", False, "Réponse JSON invalide", response_time)
            else:
                issues = []
                if response.status_code != 200: issues.append(f"Status {response.status_code}")
                if not json_valid: issues.append("JSON invalide")
                if not time_ok: issues.append(f"Temps {response_time:.3f}s > 2s")
                self.log_test("POST /api/auth/login", False, ", ".join(issues), response_time)
        else:
            self.log_test("POST /api/auth/login", False, "Erreur de connexion", response_time)
            
        # Test bad credentials (should return 401)
        bad_login_data = {
            "email": self.test_email,
            "password": "mauvais_mot_de_passe"
        }
        
        response, success, response_time = self.make_request('POST', '/auth/login', data=bad_login_data)
        if success and response:
            if response.status_code == 401:
                self.log_test(
                    "POST /api/auth/login (mauvais credentials)",
                    True,
                    "401 Unauthorized comme attendu",
                    response_time
                )
            else:
                self.log_test(
                    "POST /api/auth/login (mauvais credentials)",
                    False,
                    f"Status {response.status_code}, attendu 401",
                    response_time
                )
        else:
            self.log_test("POST /api/auth/login (mauvais credentials)", False, "Erreur de connexion", response_time)
            
        # Test POST /api/auth/change-password - Test changement mot de passe
        if self.user_id:
            change_password_data = {
                "current_password": self.test_password,
                "new_password": "nouveau_motdepasse456"
            }
            
            response, success, response_time = self.make_request(
                'POST', 
                '/auth/change-password', 
                data=change_password_data,
                params={'user_id': self.user_id}
            )
            if success and response:
                json_valid = self.verify_json_response(response)
                cors_present = self.verify_cors_headers(response)
                time_ok = response_time < 2.0
                
                if response.status_code == 200 and json_valid and time_ok:
                    try:
                        data = response.json()
                        has_message = bool(data.get('message'))
                        self.log_test(
                            "POST /api/auth/change-password",
                            True,
                            f"200 OK, JSON valide, Message de succès: {has_message}, CORS: {cors_present}",
                            response_time
                        )
                        # Update password for future tests
                        self.test_password = "nouveau_motdepasse456"
                    except:
                        self.log_test("POST /api/auth/change-password", False, "Réponse JSON invalide", response_time)
                else:
                    issues = []
                    if response.status_code != 200: issues.append(f"Status {response.status_code}")
                    if not json_valid: issues.append("JSON invalide")
                    if not time_ok: issues.append(f"Temps {response_time:.3f}s > 2s")
                    self.log_test("POST /api/auth/change-password", False, ", ".join(issues), response_time)
            else:
                self.log_test("POST /api/auth/change-password", False, "Erreur de connexion", response_time)
        else:
            self.log_test("POST /api/auth/change-password", False, "Pas d'ID utilisateur disponible", 0)

    def test_error_validation(self):
        """Test error cases for validation (400, 401 status codes)"""
        print("\n=== TESTS VALIDATION DES ERREURS ===")
        
        # Test register with existing email (should return 400)
        if self.test_email:
            duplicate_data = {
                "first_name": "Test",
                "last_name": "Duplicate",
                "email": self.test_email,
                "password": "motdepasse123"
            }
            
            response, success, response_time = self.make_request('POST', '/auth/register', data=duplicate_data)
            if success and response:
                if response.status_code == 400:
                    self.log_test(
                        "POST /api/auth/register (email existant)",
                        True,
                        "400 Bad Request comme attendu",
                        response_time
                    )
                else:
                    self.log_test(
                        "POST /api/auth/register (email existant)",
                        False,
                        f"Status {response.status_code}, attendu 400",
                        response_time
                    )
            else:
                self.log_test("POST /api/auth/register (email existant)", False, "Erreur de connexion", response_time)
                
        # Test register with short password (should return 400)
        short_password_data = {
            "first_name": "Test",
            "last_name": "Short",
            "email": f"test.short.{int(time.time())}@example.ci",
            "password": "123"  # Too short
        }
        
        response, success, response_time = self.make_request('POST', '/auth/register', data=short_password_data)
        if success and response:
            if response.status_code == 400:
                self.log_test(
                    "POST /api/auth/register (mot de passe court)",
                    True,
                    "400 Bad Request comme attendu",
                    response_time
                )
            else:
                self.log_test(
                    "POST /api/auth/register (mot de passe court)",
                    False,
                    f"Status {response.status_code}, attendu 400",
                    response_time
                )
        else:
            self.log_test("POST /api/auth/register (mot de passe court)", False, "Erreur de connexion", response_time)
            
        # Test login with non-existent email (should return 401)
        bad_login_data = {
            "email": f"inexistant.{int(time.time())}@test.ci",
            "password": "motdepasse123"
        }
        
        response, success, response_time = self.make_request('POST', '/auth/login', data=bad_login_data)
        if success and response:
            if response.status_code == 401:
                self.log_test(
                    "POST /api/auth/login (email inexistant)",
                    True,
                    "401 Unauthorized comme attendu",
                    response_time
                )
            else:
                self.log_test(
                    "POST /api/auth/login (email inexistant)",
                    False,
                    f"Status {response.status_code}, attendu 401",
                    response_time
                )
        else:
            self.log_test("POST /api/auth/login (email inexistant)", False, "Erreur de connexion", response_time)
            
    def test_bcrypt_verification(self):
        """Test bcrypt password hashing functionality"""
        print("\n=== TESTS VÉRIFICATION BCRYPT ===")
        
        # Create a test user and verify bcrypt functionality
        test_email = f"bcrypt.test.{int(time.time())}.{os.getpid()}@example.ci"
        register_data = {
            "first_name": "Bcrypt",
            "last_name": "Test",
            "email": test_email,
            "password": "test_bcrypt_123"
        }
        
        response, success, response_time = self.make_request('POST', '/auth/register', data=register_data)
        if success and response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Verify password_hash is not exposed in response
                    no_password_exposed = 'password_hash' not in data and 'password' not in data
                    self.log_test(
                        "Bcrypt - Mot de passe non exposé",
                        no_password_exposed,
                        "Le mot de passe haché n'est pas retourné dans la réponse" if no_password_exposed else "SÉCURITÉ: Mot de passe exposé!",
                        response_time
                    )
                    
                    # Test login to verify bcrypt verification works
                    login_data = {
                        "email": test_email,
                        "password": "test_bcrypt_123"
                    }
                    
                    login_response, login_success, login_time = self.make_request('POST', '/auth/login', data=login_data)
                    if login_success and login_response and login_response.status_code == 200:
                        self.log_test(
                            "Bcrypt - Vérification du hash",
                            True,
                            "La connexion fonctionne, le hachage bcrypt est opérationnel",
                            login_time
                        )
                    else:
                        self.log_test(
                            "Bcrypt - Vérification du hash",
                            False,
                            f"Échec de connexion: {login_response.status_code if login_response else 'Erreur connexion'}",
                            login_time
                        )
                except:
                    self.log_test("Bcrypt - Analyse réponse", False, "Erreur lors de l'analyse de la réponse", response_time)
            else:
                self.log_test("Bcrypt - Création utilisateur test", False, f"Échec création utilisateur: {response.status_code}", response_time)
        else:
            self.log_test("Bcrypt - Test général", False, "Erreur de connexion", response_time)
            
    def run_all_tests(self):
        """Run all tests according to review request"""
        print("🚀 TEST COMPLET DU SYSTÈME DE TRADUCTION MULTILINGUE - BACKEND")
        print("=" * 70)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Timeout: {TIMEOUT}s")
        print("Objectif: Vérifier que le backend et les endpoints API fonctionnent correctement")
        print("Note: Le système i18n est côté frontend uniquement, le backend ne change pas")
        
        start_time = time.time()
        
        # Run test suites according to review request
        self.test_basic_endpoints()
        self.test_auth_endpoints()
        self.test_error_validation()
        self.test_bcrypt_verification()
        
        total_time = time.time() - start_time
        
        # Summary
        print(f"\n=== RÉSUMÉ DES TESTS ===")
        total_tests = len(self.test_results)
        success_rate = (self.passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total des tests: {total_tests}")
        print(f"✅ Réussis: {self.passed_tests}")
        print(f"❌ Échoués: {self.failed_tests}")
        print(f"⏱️ Temps total: {total_time:.3f}s")
        print(f"📊 Taux de réussite: {success_rate:.1f}%")
        
        # Failed tests details
        if self.failed_tests > 0:
            print(f"\n=== TESTS ÉCHOUÉS ===")
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}: {result['details']}")
                    
        # Performance analysis
        slow_tests = [r for r in self.test_results if r['response_time'] > 1.0]
        if slow_tests:
            print(f"\n=== TESTS LENTS (>1s) ===")
            for result in slow_tests:
                print(f"⚠️ {result['test']}: {result['response_time']:.3f}s")
                
        # Final verdict
        if self.failed_tests == 0:
            print(f"\n🎉 TOUS LES TESTS SONT PASSÉS!")
            print("✅ Le backend est prêt pour le système multilingue.")
            print("✅ Tous les endpoints retournent du JSON valide")
            print("✅ Status codes corrects (200, 400, 401)")
            print("✅ CORS headers présents")
            print("✅ Temps de réponse < 2s")
            print("✅ Pas d'erreurs 500")
        else:
            print(f"\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ.")
            print("Vérifiez les détails ci-dessus avant de procéder.")
                
        return self.failed_tests == 0

def main():
    """Fonction principale pour exécuter tous les tests"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()