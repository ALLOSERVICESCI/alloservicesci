#!/usr/bin/env python3
"""
Script de test pour les notifications push
Usage: python test_notifications.py
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8001/api"

def test_register_token():
    """Test d'enregistrement d'un token push"""
    print("\n=== Test 1: Enregistrement d'un token ===")
    
    payload = {
        "token": "ExponentPushToken[test-token-123]",
        "user_id": "test-user",
        "platform": "android",
        "city": "Abidjan"
    }
    
    response = requests.post(f"{BASE_URL}/notifications/register", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_send_notification():
    """Test d'envoi d'une notification"""
    print("\n=== Test 2: Envoi d'une notification ===")
    
    payload = {
        "title": "Test Notification",
        "body": "Ceci est un message de test depuis le backend",
        "data": {"type": "test", "timestamp": "2025-12-05"},
        "sound": "default"
    }
    
    response = requests.post(f"{BASE_URL}/notifications/send", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_send_targeted_notification():
    """Test d'envoi ciblé"""
    print("\n=== Test 3: Envoi ciblé par user_id ===")
    
    payload = {
        "title": "Notification Ciblée",
        "body": "Message uniquement pour test-user",
        "user_ids": ["test-user"],
        "data": {"category": "alert"}
    }
    
    response = requests.post(f"{BASE_URL}/notifications/send", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_send_city_notification():
    """Test d'envoi par ville"""
    print("\n=== Test 4: Envoi ciblé par ville ===")
    
    payload = {
        "title": "Alerte Abidjan",
        "body": "Information importante pour Abidjan",
        "cities": ["Abidjan"],
        "data": {"urgency": "high"}
    }
    
    response = requests.post(f"{BASE_URL}/notifications/send", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_get_stats():
    """Test des statistiques"""
    print("\n=== Test 5: Statistiques des tokens ===")
    
    response = requests.get(f"{BASE_URL}/notifications/tokens/stats")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def main():
    print("🧪 Tests des notifications push - Allô Services CI")
    print("=" * 60)
    
    tests = [
        ("Enregistrement token", test_register_token),
        ("Envoi notification générale", test_send_notification),
        ("Envoi ciblé par user", test_send_targeted_notification),
        ("Envoi ciblé par ville", test_send_city_notification),
        ("Statistiques", test_get_stats),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print(f"❌ Erreur: {e}")
            results.append((name, False))
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
    
    passed = sum(1 for _, s in results if s)
    total = len(results)
    print(f"\nRésultat: {passed}/{total} tests réussis")

if __name__ == "__main__":
    main()
