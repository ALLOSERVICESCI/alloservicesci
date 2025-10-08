#!/usr/bin/env python3
"""
Script d'importation des pharmacies d'Abobo PK18
Ajoute les pharmacies du quartier PK18 aux données existantes
"""

import requests
import json

# URL de l'API backend
API_URL = "http://localhost:8001/api/pharmacies/bulk-import"

# Données des pharmacies d'Abobo PK18
abobo_pk18_pharmacies = [
    {
        "name": "PHCIE MILIE HEVIE",
        "manager": "M. KOUAO AKA",
        "address": "ROUTE D'ANYAMA / PK 18 / TERMINUS BUS 76",
        "city": "ABOBO",
        "commune": "PK 18",
        "phone": "27 24 52 67 38 / 07 78 98 35 52 / 05 64 71 96 91",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE OLYMPIQUE",
        "manager": "M. COULIBALY KAFANA DANIEL",
        "address": "ABOBO NDOTRE A 300 M DU CARREFOUR NDOTRE ROUTE DE YOPOUGON",
        "city": "ABOBO",
        "commune": "NDOTRE",
        "phone": "01 02 27 56 13 / 07 07 89 99 44",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE ESPERANCE",
        "manager": "M. GOHEAN DOHO BERTIN",
        "address": "PK 18 AGOUETO CARREFOUR CMA",
        "city": "ABOBO",
        "commune": "PK 18 AGOUETO",
        "phone": "07 78 18 18 59 / 27 24 52 95 01",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE N'DOTRE PALMERAIE 2",
        "manager": "M. TAGOUA AUGUSTIN",
        "address": "ABOBO N'DOTRE DERRIERE LE GROUPE SCOLAIRE GRACE JEANNE NON LOIN DE LA NOUVELLE FORMATION SANITAIRE EN CONSTRUCTION",
        "city": "ABOBO",
        "commune": "N'DOTRE",
        "phone": "05 55 47 53 55 / 01 02 13 93 96",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE CONCORDE PK 18",
        "manager": "MME KOUMARE FATOUMATA EPSE BAMBA",
        "address": "ABOBO PK18 EN FACE DE LA CITE SICOGI CONCORDE 2 EN ALLANT A BOIS SEC",
        "city": "ABOBO",
        "commune": "PK 18",
        "phone": "27 24 33 23 87 / 07 79 76 04 28 / 05 74 13 37 22",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE CARREFOUR KOBAKRO",
        "manager": "M. BASSA KOUADIO MARTIAL",
        "address": "CARREFOUR KOBAKRO / ROUTE EBIMPE",
        "city": "ABOBO",
        "commune": "KOBAKRO",
        "phone": "07 12 38 68 31",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    }
]

def import_abobo_pk18_pharmacies():
    """Importe les pharmacies d'Abobo PK18 dans la base de données via l'API"""
    try:
        print(f"Importation de {len(abobo_pk18_pharmacies)} pharmacies d'Abobo PK18...")
        
        response = requests.post(API_URL, json=abobo_pk18_pharmacies)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Succès: {result['message']}")
            
            # Afficher un résumé des communes
            communes = set()
            for pharmacy in abobo_pk18_pharmacies:
                communes.add(pharmacy['commune'])
            
            print(f"📍 Nouvelles communes ajoutées: {', '.join(sorted(communes))}")
            
            # Récapitulatif
            print(f"\n📊 Récapitulatif total:")
            check_response = requests.get("http://localhost:8001/api/pharmacies")
            if check_response.status_code == 200:
                total_pharmacies = len(check_response.json())
                print(f"   Total pharmacies dans la base: {total_pharmacies}")
            
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")

if __name__ == "__main__":
    import_abobo_pk18_pharmacies()