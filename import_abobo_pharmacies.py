#!/usr/bin/env python3
"""
Script d'importation des pharmacies d'Abobo
Importe les données spécifiques fournies par l'utilisateur
"""

import requests
import json
import re

# URL de l'API backend
API_URL = "http://localhost:8001/api/pharmacies/bulk-import"

# Données des pharmacies d'Abobo
abobo_pharmacies = [
    {
        "name": "PHCIE LA VIERGE DU SIGNE",
        "manager": "M. GBANGBO EPHILIET ANGE-MARTIAL",
        "address": "ABOBO NGUESSANKOI / DERRIERE LA STATION ORYX",
        "city": "ABOBO",
        "commune": "NGUESSANKOI",
        "phone": "07 78 68 11 74",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE SERVIR",
        "manager": "M. SEKA AHO JOEL RICHARD",
        "address": "2EME ROND POINT AUTOROUTE ABOBO GARE PRES DU COLLEGE ST JOSEPH",
        "city": "ABOBO",
        "commune": "GARE",
        "phone": "25 24 01 18 20 / 01 01 61 15 49",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE DU RAIL",
        "manager": "M. TCHIMOU LUCIEN",
        "address": "ABOBO SAGBE / DERRIERE RAIL",
        "city": "ABOBO",
        "commune": "SAGBE",
        "phone": "07 47 53 25 32",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE BELLE CITE",
        "manager": "MME ANOUGBLE MARIETTE",
        "address": "ABOBO QUARTIER BC TERMINUS DES WOROS WOROS",
        "city": "ABOBO",
        "commune": "BC",
        "phone": "05 44 29 29 69",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE ROUTE AKEIKOI",
        "manager": "M. SAI DONH GBATO",
        "address": "ABOBO COLATIER SUR LA VOIE MENANT A AKEIKOI",
        "city": "ABOBO",
        "commune": "COLATIER",
        "phone": "07 09 86 26 77 / 07 09 28 98 94",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE MIRIA (NOUVELLE)",
        "manager": "MME GADDAR BOSSE JULIANA",
        "address": "ROUTE DU ZOO / CARREFOUR JEAN TAILLY EN FACE DU MARCHE DES GROSSISTES BUS N° 49 & 76",
        "city": "ABOBO",
        "commune": "ZOO",
        "phone": "07 09 84 68 48 / 25 21 01 57 38",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE RAHMAN",
        "manager": "M. KONE YAYA",
        "address": "ABOBO AGBEKOI PRES DE L'ECOLE NORD ET DE L'AGEEP",
        "city": "ABOBO",
        "commune": "AGBEKOI",
        "phone": "05 56 46 64 12 / 01 01 82 05 31 / 07 79 41 51 01",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE KENNEDY",
        "manager": "MME KASSI DANHO JULIETTE",
        "address": "ENTREE QUARTIER KENNEDY-CLOUETCHA / 400 M DU CARREFOUR SANS MANQUER",
        "city": "ABOBO",
        "commune": "KENNEDY-CLOUETCHA",
        "phone": "01 41 12 67 67",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE DU DOKUI (GDE)",
        "manager": "M. MOHAMED DOUMBIA",
        "address": "AU DESSUS DU ZOO FACE STATION TOTAL / FACE CIE PLATEAU DOKUI",
        "city": "ABOBO",
        "commune": "DOKUI",
        "phone": "01 01 60 84 18",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE PETIT MARCHE DU DOKUI",
        "manager": "M. DALLO GUILLAUME",
        "address": "ABOBO ENTRE LE PETIT MARCHE DE DOKUI ET LA MOSQUEE SUR LA VOIE MENANT AU COLLEGE MAHOU",
        "city": "ABOBO",
        "commune": "DOKUI",
        "phone": "27 22 53 38 67 / 07 89 76 04 17",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE D'ABOBO BAOULE",
        "manager": "M. YOBOUE SERGE",
        "address": "ABOBO BAOULE FACE AU COMMISSARIAT DU 34 EME ARRONDISSEMENT",
        "city": "ABOBO",
        "commune": "BAOULE",
        "phone": "07 47 98 39 21 / 01 41 75 70 10",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE TEHOUA",
        "manager": "MME COULIBALY MOUNIRATOU",
        "address": "AUTOROUTE D'ANYAMA / 500 M APRES GENDARMERIE D'ABOBO SUR LA DROITE",
        "city": "ABOBO",
        "commune": "AUTOROUTE",
        "phone": "27 24 39 13 13",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE MARIE ESTHER ABOBO",
        "manager": "M. N'GUETTA KOUAO ALAIN CLAUDE",
        "address": "ABOBO SUD COCOTERAIE ENTRE LE CHU D'ABOBO ET LE GROUPE SCOLAIRE D'EXCELLENCE CHILDREN OF AFRICA",
        "city": "ABOBO",
        "commune": "SUD COCOTERAIE",
        "phone": "07 00 90 09 10 / 27 24 52 55 63",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE ABOBOTE RESIDENTIEL",
        "manager": "M GNAMAN DIDIER",
        "address": "ABOBOTE ENTRE LE CIMETIERE D'ABOBOTE ET LE CARREFOUR SAMAKE",
        "city": "ABOBO",
        "commune": "ABOBOTE",
        "phone": "07 05 77 17 45 / 27 24 57 67 22 / 27 24 51 41 28",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    },
    {
        "name": "PHCIE SOGEFIHA",
        "manager": "M. KOUAME THIERRY",
        "address": "ENTRE COMMISSARIAT DU 15EME ET STATION MOBIL / BUS 41-08-49",
        "city": "ABOBO",
        "commune": "SOGEFIHA",
        "phone": "27 24 39 00 51",
        "duty_days": [],
        "on_duty": False,
        "is_imported": True
    }
]

def import_abobo_pharmacies():
    """Importe les pharmacies d'Abobo dans la base de données via l'API"""
    try:
        print(f"Importation de {len(abobo_pharmacies)} pharmacies d'Abobo...")
        
        response = requests.post(API_URL, json=abobo_pharmacies)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Succès: {result['message']}")
            
            # Afficher un résumé des communes
            communes = set()
            for pharmacy in abobo_pharmacies:
                communes.add(pharmacy['commune'])
            
            print(f"📍 Communes ajoutées: {', '.join(sorted(communes))}")
            
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")

if __name__ == "__main__":
    import_abobo_pharmacies()