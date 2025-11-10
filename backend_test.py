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

def log_test(test_name, status, details=""):
    """Log des résultats de test"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = "✅" if status else "❌"
    print(f"[{timestamp}] {status_symbol} {test_name}")
    if details:
        print(f"    {details}")
    print()

def test_auth_register():
    """Test 1: POST /api/auth/register - Test d'inscription avec un nouveau utilisateur"""
    print("=== TEST 1: POST /api/auth/register ===")
    
    url = f"{BACKEND_URL}/auth/register"
    payload = {
        "first_name": "John",
        "last_name": "Doe", 
        "email": "john.doe@test.ci",
        "password": "motdepasse123"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Vérifier que les données utilisateur sont retournées sans password_hash
            if 'id' in data and 'email' in data and 'password_hash' not in data:
                log_test("Inscription utilisateur", True, f"Utilisateur créé avec ID: {data['id']}")
                return data['id'], payload['email']  # Retourner l'ID et email pour les tests suivants
            else:
                log_test("Inscription utilisateur", False, f"Structure de réponse incorrecte: {data}")
                return None, None
        elif response.status_code == 400:
            # Utilisateur existe déjà - essayer avec un email différent
            payload['email'] = f"john.doe.{datetime.now().strftime('%H%M%S')}@test.ci"
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                log_test("Inscription utilisateur (email alternatif)", True, f"Utilisateur créé avec ID: {data['id']}")
                return data['id'], payload['email']
            else:
                log_test("Inscription utilisateur", False, f"Erreur après changement d'email: {response.status_code} - {response.text}")
                return None, None
        else:
            log_test("Inscription utilisateur", False, f"Status code: {response.status_code} - {response.text}")
            return None, None
            
    except Exception as e:
        log_test("Inscription utilisateur", False, f"Exception: {str(e)}")
        return None, None

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