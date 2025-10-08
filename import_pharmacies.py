#!/usr/bin/env python3
"""
Script d'importation des pharmacies de garde d'octobre 2025
Traite les données extraites du PDF et les envoie à l'API backend
"""

import requests
import json
import re

# URL de l'API backend
API_URL = "http://localhost:8001/api/pharmacies/bulk-import"

# Données extraites du PDF (structurées)
pharmacies_data = [
    # ABOBO - Semaine du 4-10 octobre 2025
    {
        "name": "PHCIE LA VIERGE DU SIGNE",
        "address": "ABOBO NGUESSANKOI / DERRIERE LA STATION ORYX",
        "city": "ABOBO",
        "commune": "NGUESSANKOI",
        "phone": "07 78 68 11 74",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE SERVIR",
        "address": "2EME ROND POINT AUTOROUTE ABOBO GARE PRES DU COLLEGE ST JOSEPH",
        "city": "ABOBO",
        "commune": "GARE",
        "phone": "25 24 01 18 20 / 01 01 61 15 49",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE DU RAIL",
        "address": "ABOBO SAGBE / DERRIERE RAIL",
        "city": "ABOBO",
        "commune": "SAGBE",
        "phone": "07 47 53 25 32",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE BELLE CITE",
        "address": "ABOBO QUARTIER BC TERMINUS DES WOROS WOROS",
        "city": "ABOBO",
        "commune": "BC",
        "phone": "05 44 29 29 69",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE ROUTE AKEIKOI",
        "address": "ABOBO COLATIER SUR LA VOIE MENANT A AKEIKOI",
        "city": "ABOBO",
        "commune": "COLATIER",
        "phone": "07 09 86 26 77 / 07 09 28 98 94",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE MIRIA (NOUVELLE)",
        "address": "ROUTE DU ZOO / CARREFOUR JEAN TAILLY EN FACE DU MARCHE DES GROSSISTES BUS N° 49 & 76",
        "city": "ABOBO",
        "commune": "ZOO",
        "phone": "07 09 84 68 48 / 25 21 01 57 38",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE RAHMAN",
        "address": "ABOBO AGBEKOI PRES DE L'ECOLE NORD ET DE L'AGEEP",
        "city": "ABOBO",
        "commune": "AGBEKOI",
        "phone": "05 56 46 64 12 / 01 01 82 05 31 / 07 79 41 51 01",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE KENNEDY",
        "address": "ENTREE QUARTIER KENNEDY-CLOUETCHA / 400 M DU CARREFOUR SANS MANQUER",
        "city": "ABOBO",
        "commune": "KENNEDY-CLOUETCHA",
        "phone": "01 41 12 67 67",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE DU DOKUI (GRANDE)",
        "address": "AU DESSUS DU ZOO FACE STATION TOTAL / FACE CIE PLATEAU DOKUI",
        "city": "ABOBO",
        "commune": "DOKUI",
        "phone": "01 01 60 84 18",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE PETIT MARCHE DU DOKUI",
        "address": "ABOBO ENTRE LE PETIT MARCHE DE DOKUI ET LA MOSQUEE SUR LA VOIE MENANT AU COLLEGE MAHOU",
        "city": "ABOBO",
        "commune": "DOKUI",
        "phone": "27 22 53 38 67 / 07 89 76 04 17",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE D'ABOBO BAOULE",
        "address": "ABOBO BAOULE FACE AU COMMISSARIAT DU 34 EME ARRONDISSEMENT",
        "city": "ABOBO",
        "commune": "BAOULE",
        "phone": "07 47 98 39 21 / 01 41 75 70 10",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE TEHOUA",
        "address": "AUTOROUTE D'ANYAMA / 500 M APRES GENDARMERIE D'ABOBO SUR LA DROITE",
        "city": "ABOBO",
        "commune": "AUTOROUTE",
        "phone": "27 24 39 13 13",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE MARIE ESTHER ABOBO",
        "address": "ABOBO SUD COCOTERAIE ENTRE LE CHU D'ABOBO ET LE GROUPE SCOLAIRE D'EXCELLENCE CHILDREN OF AFRICA",
        "city": "ABOBO",
        "commune": "SUD COCOTERAIE",
        "phone": "07 00 90 09 10 / 27 24 52 55 63",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE ABOBOTE RESIDENTIEL",
        "address": "ABOBOTE ENTRE LE CIMETIERE D'ABOBOTE ET LE CARREFOUR SAMAKE",
        "city": "ABOBO",
        "commune": "ABOBOTE",
        "phone": "07 05 77 17 45 / 27 24 57 67 22 / 27 24 51 41 28",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE SOGEFIHA",
        "address": "ENTRE COMMISSARIAT DU 15EME ET STATION MOBIL / BUS 41-08-49",
        "city": "ABOBO",
        "commune": "SOGEFIHA",
        "phone": "27 24 39 00 51",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    
    # ABOBO PK 18
    {
        "name": "PHCIE MILIE HEVIE",
        "address": "ROUTE D'ANYAMA / PK 18 / TERMINUS BUS 76",
        "city": "ABOBO",
        "commune": "PK 18",
        "phone": "27 24 52 67 38 / 07 78 98 35 52 / 05 64 71 96 91",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE OLYMPIQUE",
        "address": "ABOBO NDOTRE A 300 M DU CARREFOUR NDOTRE ROUTE DE YOPOUGON",
        "city": "ABOBO",
        "commune": "NDOTRE",
        "phone": "01 02 27 56 13 / 07 07 89 99 44",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE ESPERANCE",
        "address": "PK 18 AGOUETO CARREFOUR CMA",
        "city": "ABOBO",
        "commune": "PK 18 AGOUETO",
        "phone": "07 78 18 18 59 / 27 24 52 95 01",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE N'DOTRE PALMERAIE 2",
        "address": "ABOBO N'DOTRE DERRIERE LE GROUPE SCOLAIRE GRACE JEANNE NON LOIN DE LA NOUVELLE FORMATION SANITAIRE EN CONSTRUCTION",
        "city": "ABOBO",
        "commune": "N'DOTRE",
        "phone": "05 55 47 53 55 / 01 02 13 93 96",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE CONCORDE PK 18",
        "address": "ABOBO PK18 EN FACE DE LA CITE SICOGI CONCORDE 2 EN ALLANT A BOIS SEC",
        "city": "ABOBO",
        "commune": "PK 18",
        "phone": "27 24 33 23 87 / 07 79 76 04 28 / 05 74 13 37 22",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE CARREFOUR KOBAKRO",
        "address": "CARREFOUR KOBAKRO/ROUTE EBIMPE",
        "city": "ABOBO",
        "commune": "KOBAKRO",
        "phone": "07 12 38 68 31",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    
    # ANYAMA
    {
        "name": "PHCIE LE LABELLE",
        "address": "ANYAMA QUARTIER ZOSSONKOI EXTENSION ENVIRON 500 M DE L'HOPITAL GENERAL D'ANYAMA",
        "city": "ANYAMA",
        "commune": "ZOSSONKOI EXTENSION",
        "phone": "05 95 57 95 06 / 01 43 54 40 83",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE MEDEBA",
        "address": "ANYAMA EN FACE DU CARREFOUR CISSE (CARREFOUR POLICIER) A COTE DE BONI AUTO ECOLE",
        "city": "ANYAMA",
        "commune": "CENTRE",
        "phone": "27 23 55 62 44 / 01 01 05 26 44 / 07 89 95 00 90",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE ROUTE D'ANYAMA (NOUVELLE)",
        "address": "ABOBO PK 18 FACE A LA SOCIETE OLAM (ex- UNICAFE) A 100M DE LA STATION PETROCI",
        "city": "ANYAMA",
        "commune": "ROUTE",
        "phone": "01 52 78 88 33",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    
    # ALEPE / MONTEZO / BROFODOUME
    {
        "name": "PHCIE D'ALEPE",
        "address": "Centre ville d'Alépé",
        "city": "ALEPE",
        "commune": "CENTRE",
        "phone": "07 09 86 33 83",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    
    # ADJAME CENTRE
    {
        "name": "PHCIE DU CHATEAU D'EAU",
        "address": "BD WILLIAM JACOB/ ADJAME NORD/ EN DESCENDANT LES RAILS VERS LA SODECI",
        "city": "ADJAME",
        "commune": "NORD",
        "phone": "27 20 37 11 68",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE GBEDE",
        "address": "FACE DISPENSAIRE D'ADJAME / NON LOIN DU COMMISSARIAT DU 3EME ARRONDT ET DU GD MARCHE",
        "city": "ADJAME",
        "commune": "CENTRE",
        "phone": "07 58 09 47 03",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE ADJAME BRACODI",
        "address": "GARE NORD SOTRA DANS LA ZONE DE STATIONNEMENT DES GBAKAS / DANS LE SENS ADJAME ABOBO",
        "city": "ADJAME",
        "commune": "GARE NORD",
        "phone": "27 20 37 54 33 / 07 57 49 46 08",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE FRATERNITE (NOUVELLE)",
        "address": "PRES MATERNITE THERESE HOUPHOUET BOIGNY QUARTIER FRATERNITE",
        "city": "ADJAME",
        "commune": "FRATERNITE",
        "phone": "27 20 37 53 22 / 01 42 90 00 20",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE ADJAME LATIN",
        "address": "PROLONGEMENT DE L'AVENUE 13 / QUARTIER LATIN HABITAT EXTENSION / PRES DU PETIT MARCHE",
        "city": "ADJAME",
        "commune": "LATIN",
        "phone": "01 40 65 86 49 / 05 75 16 33 30",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE QUARTIER EBRIE",
        "address": "FACE GARE STIFF DALOA",
        "city": "ADJAME",
        "commune": "EBRIE",
        "phone": "27 20 37 12 56",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE ST MICHEL",
        "address": "AVENUE 13 / A 50 M DE L'EGLISE ST MICHEL / EN FACE DU CEG/HARRIS",
        "city": "ADJAME",
        "commune": "ST MICHEL",
        "phone": "27 20 37 09 06",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE MAKISSI",
        "address": "PLACE DU CINEMA LIBERTE",
        "city": "ADJAME",
        "commune": "LIBERTE",
        "phone": "07 57 48 54 32",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    
    # ATTECOUBE
    {
        "name": "PHCIE MONTANA",
        "address": "ATTECOUBE VERS TERMINUS BUS 09 / FACE ECOLE FAIDHERBE",
        "city": "ATTECOUBE",
        "commune": "TERMINUS",
        "phone": "07 07 36 57 30",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE REHOBOTH",
        "address": "ATTECOUBE QUARTIER CISCOM PRES DE LA MATERNITE",
        "city": "ATTECOUBE",
        "commune": "CISCOM",
        "phone": "01 01 03 06 29",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE CHRIST STELLA",
        "address": "CITE FAIRMOND ATTECOUBE APRES NOUVELLE GENDARMERIE",
        "city": "ATTECOUBE",
        "commune": "FAIRMOND",
        "phone": "01 71 56 18 17 / 27 20 28 62 96",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    
    # WILLIAMSVILLE
    {
        "name": "PHCIE DU PROGRES",
        "address": "FACE EGLISE ST KIZITO",
        "city": "WILLIAMSVILLE",
        "commune": "CENTRE",
        "phone": "27 20 37 15 25",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    },
    {
        "name": "PHCIE CARREFOUR HMA",
        "address": "PAILLET EXTENSION / NON LOIN DU ZOO CARREFOUR CIE",
        "city": "WILLIAMSVILLE",
        "commune": "PAILLET EXTENSION",
        "phone": "07 79 47 39 22 / 05 76 54 52 14",
        "duty_days": ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"]
    }
]

def import_pharmacies():
    """Importe les pharmacies dans la base de données via l'API"""
    try:
        print(f"Importation de {len(pharmacies_data)} pharmacies...")
        
        response = requests.post(API_URL, json=pharmacies_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Succès: {result['message']}")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")

if __name__ == "__main__":
    import_pharmacies()