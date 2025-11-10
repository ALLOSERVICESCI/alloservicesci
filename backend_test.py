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

def test_auth_login(email="john.doe@test.ci", password="motdepasse123"):
    """Test 2: POST /api/auth/login - Test de connexion avec l'utilisateur créé"""
    print("=== TEST 2: POST /api/auth/login ===")
    
    url = f"{BACKEND_URL}/auth/login"
    
    # Test avec bon mot de passe
    payload = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'email' in data and 'password_hash' not in data:
                log_test("Connexion avec bon mot de passe", True, f"Connexion réussie pour: {data['email']}")
                user_id = data['id']
            else:
                log_test("Connexion avec bon mot de passe", False, f"Structure de réponse incorrecte: {data}")
                user_id = None
        else:
            log_test("Connexion avec bon mot de passe", False, f"Status code: {response.status_code} - {response.text}")
            user_id = None
            
    except Exception as e:
        log_test("Connexion avec bon mot de passe", False, f"Exception: {str(e)}")
        user_id = None
    
    # Test avec mauvais mot de passe
    payload_bad = {
        "email": email,
        "password": "mauvais_mot_de_passe"
    }
    
    try:
        response = requests.post(url, json=payload_bad, timeout=10)
        
        if response.status_code == 401:
            log_test("Connexion avec mauvais mot de passe", True, "Erreur 401 retournée comme attendu")
        else:
            log_test("Connexion avec mauvais mot de passe", False, f"Status code attendu: 401, reçu: {response.status_code}")
            
    except Exception as e:
        log_test("Connexion avec mauvais mot de passe", False, f"Exception: {str(e)}")
    
    return user_id

def test_change_password(user_id):
    """Test 3: POST /api/auth/change-password - Test de changement de mot de passe"""
    print("=== TEST 3: POST /api/auth/change-password ===")
    
    if not user_id:
        log_test("Changement de mot de passe", False, "Pas d'ID utilisateur disponible")
        return False
    
    url = f"{BACKEND_URL}/auth/change-password?user_id={user_id}"
    payload = {
        "current_password": "motdepasse123",
        "new_password": "nouveaumotdepasse456"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'message' in data:
                log_test("Changement de mot de passe", True, f"Message: {data['message']}")
                return True
            else:
                log_test("Changement de mot de passe", False, f"Structure de réponse incorrecte: {data}")
                return False
        else:
            log_test("Changement de mot de passe", False, f"Status code: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        log_test("Changement de mot de passe", False, f"Exception: {str(e)}")
        return False

def test_validation_errors():
    """Test 4: Validation des erreurs"""
    print("=== TEST 4: Validation des erreurs ===")
    
    # Test inscription avec email déjà existant
    url_register = f"{BACKEND_URL}/auth/register"
    payload_existing = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@test.ci",  # Email déjà utilisé
        "password": "motdepasse123"
    }
    
    try:
        response = requests.post(url_register, json=payload_existing, timeout=10)
        if response.status_code == 400:
            log_test("Inscription avec email existant", True, "Erreur 400 retournée comme attendu")
        else:
            log_test("Inscription avec email existant", False, f"Status code attendu: 400, reçu: {response.status_code}")
    except Exception as e:
        log_test("Inscription avec email existant", False, f"Exception: {str(e)}")
    
    # Test mot de passe trop court
    payload_short_password = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test.short@test.ci",
        "password": "123"  # Moins de 8 caractères
    }
    
    try:
        response = requests.post(url_register, json=payload_short_password, timeout=10)
        if response.status_code == 400:
            log_test("Mot de passe trop court", True, "Erreur 400 retournée comme attendu")
        else:
            log_test("Mot de passe trop court", False, f"Status code attendu: 400, reçu: {response.status_code}")
    except Exception as e:
        log_test("Mot de passe trop court", False, f"Exception: {str(e)}")
    
    # Test login avec mauvais credentials
    url_login = f"{BACKEND_URL}/auth/login"
    payload_bad_login = {
        "email": "inexistant@test.ci",
        "password": "motdepasse123"
    }
    
    try:
        response = requests.post(url_login, json=payload_bad_login, timeout=10)
        if response.status_code == 401:
            log_test("Login avec mauvais credentials", True, "Erreur 401 retournée comme attendu")
        else:
            log_test("Login avec mauvais credentials", False, f"Status code attendu: 401, reçu: {response.status_code}")
    except Exception as e:
        log_test("Login avec mauvais credentials", False, f"Exception: {str(e)}")

def test_bcrypt_functionality():
    """Test 5: Vérifier que bcrypt fonctionne bien pour le hachage des mots de passe"""
    print("=== TEST 5: Vérification bcrypt ===")
    
    # Créer un utilisateur et vérifier que le mot de passe est bien haché en base
    # Note: On ne peut pas accéder directement à la base depuis ce test,
    # mais on peut vérifier indirectement via les endpoints
    
    url_register = f"{BACKEND_URL}/auth/register"
    test_email = f"bcrypt.test.{datetime.now().strftime('%H%M%S')}@test.ci"
    payload = {
        "first_name": "Bcrypt",
        "last_name": "Test",
        "email": test_email,
        "password": "test_bcrypt_123"
    }
    
    try:
        # Créer l'utilisateur
        response = requests.post(url_register, json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Vérifier que le password_hash n'est pas retourné dans la réponse
            if 'password_hash' not in data and 'password' not in data:
                log_test("Bcrypt - Mot de passe non exposé", True, "Le mot de passe haché n'est pas retourné dans la réponse")
                
                # Tester la connexion pour vérifier que le hachage fonctionne
                url_login = f"{BACKEND_URL}/auth/login"
                login_payload = {
                    "email": test_email,
                    "password": "test_bcrypt_123"
                }
                
                login_response = requests.post(url_login, json=login_payload, timeout=10)
                if login_response.status_code == 200:
                    log_test("Bcrypt - Vérification du hash", True, "La connexion fonctionne, le hachage bcrypt est opérationnel")
                else:
                    log_test("Bcrypt - Vérification du hash", False, f"Échec de connexion: {login_response.status_code}")
            else:
                log_test("Bcrypt - Mot de passe non exposé", False, "Le mot de passe ou son hash est exposé dans la réponse")
        else:
            log_test("Bcrypt - Création utilisateur test", False, f"Échec création utilisateur: {response.status_code}")
            
    except Exception as e:
        log_test("Bcrypt - Test général", False, f"Exception: {str(e)}")

def main():
    """Fonction principale pour exécuter tous les tests"""
    print("🔐 TESTS DES ENDPOINTS D'AUTHENTIFICATION")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    print()
    
    # Test 1: Inscription
    user_id, test_email = test_auth_register()
    
    # Utiliser l'email retourné par l'inscription ou un email par défaut
    if not test_email:
        test_email = "john.doe@test.ci"
    
    # Test 2: Connexion
    user_id = test_auth_login(test_email) or user_id
    
    # Test 3: Changement de mot de passe
    test_change_password(user_id)
    
    # Test 4: Validation des erreurs
    test_validation_errors()
    
    # Test 5: Vérification bcrypt
    test_bcrypt_functionality()
    
    print("=" * 50)
    print("🏁 TESTS TERMINÉS")

if __name__ == "__main__":
    main()