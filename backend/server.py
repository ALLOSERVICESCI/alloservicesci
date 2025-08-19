from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, Request, Form, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import uuid
import requests
import hmac
import hashlib
import logging

# Load env
ROOT_DIR = os.path.dirname(__file__)
load_dotenv(os.path.join(ROOT_DIR, '.env'))

# MongoDB connection
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# CinetPay config
CINETPAY_SITE_ID = os.environ.get('CINETPAY_SITE_ID')
CINETPAY_API_KEY = os.environ.get('CINETPAY_API_KEY')
CINETPAY_SECRET_KEY = os.environ.get('CINETPAY_SECRET_KEY')
CINETPAY_MODE = os.environ.get('CINETPAY_MODE', 'stub')  # 'live' or 'stub'
BACKEND_PUBLIC_BASE_URL = os.environ.get('BACKEND_PUBLIC_BASE_URL', '')

# App + Router
app = FastAPI(title="Allô Services CI API", version="0.3.0")
api = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helpers
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        try:
            return ObjectId(v)
        except Exception:
            raise ValueError("Invalid ObjectId")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

LangKey = Literal['fr', 'en', 'es', 'it', 'ar']

class I18nText(BaseModel):
    fr: str
    en: Optional[str] = None
    es: Optional[str] = None
    it: Optional[str] = None
    ar: Optional[str] = None

# ---------- MODELS ----------
class Category(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    slug: str
    name: I18nText
    icon: str

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: str
    city_id: Optional[str] = None
    accept_terms: bool = True
    preferred_lang: LangKey = 'fr'
    photo_base64: Optional[str] = None

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: str
    city_id: Optional[str] = None
    preferred_lang: LangKey = 'fr'
    photo_base64: Optional[str] = None
    is_premium: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Subscription(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    amount_fcfa: int
    provider: Literal['cinetpay']
    status: Literal['initiated', 'paid', 'failed', 'expired', 'active']
    transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class GeoPoint(BaseModel):
    type: Literal['Point'] = 'Point'
    coordinates: List[float]  # [lng, lat]

class Pharmacy(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    location: GeoPoint
    duty_days: List[int] = Field(default_factory=list)  # 0=Mon ... 6=Sun
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UsefulNumber(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    number: str
    category: Literal['police','gendarmerie','pompiers','samu','violence','urgent_autre']
    description: Optional[str] = None

class Alert(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    type: Literal['flood', 'missing_person', 'wanted_notice', 'fire', 'accident', 'other']
    description: str
    city: Optional[str] = None
    location: Optional[GeoPoint] = None
    images_base64: List[str] = Field(default_factory=list)
    status: Literal['active', 'resolved'] = 'active'
    posted_by: Optional[PyObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Hospital(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    type: Literal['public', 'private']
    specialties: List[str] = Field(default_factory=list)
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    location: Optional[GeoPoint] = None

class Exam(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    org: str
    category: Literal['ENA','EAU_FORET','CAFOP','POLICE','GENDARMERIE','DOUANE','AUTRE']
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    link: Optional[str] = None

class PublicService(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    type: Literal['palais_justice','commissariat','avocat','mairie','sous_prefecture','prefecture','autre']
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None

class LawAnnouncement(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    effective_date: datetime
    summary: str
    link: Optional[str] = None

class PublicCampaign(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    org: str
    category: Literal['municipale','sensibilisation_admin','autre']
    content: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class PublicFormality(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    doc_type: Literal['acte_naissance','casier_judiciaire','autre']
    steps: List[str] = Field(default_factory=list)
    link: Optional[str] = None

class Job(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    posting_type: Literal['offer', 'seeker']
    title: str
    company_or_name: str
    description: str
    city: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    posted_at: datetime = Field(default_factory=datetime.utcnow)

class CvTemplate(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    file_base64: str
    tips: Optional[str] = None

class CommodityPrice(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    commodity: str  # e.g., Cacao, Café, Anacarde
    unit: str       # e.g., kg, tonne
    price_fcfa: float
    market: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AgriTip(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    content: str

class Cooperative(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    sector: Literal['cacao','cafe','anacarde','hevea','autre']
    city: Optional[str] = None
    contact_phone: Optional[str] = None

class Place(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    type: Literal['hotel','residence','bar','nightclub','restaurant','concert','spectacle','tourism_office']
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    location: Optional[GeoPoint] = None

class TransportInfo(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    topic: Literal['OSER','carte_grise','rada_contravention','permis_conduire','reforme']
    title: str
    content: str
    link: Optional[str] = None

class LocationNode(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    type: Literal['city','commune','subprefecture']
    parent_id: Optional[PyObjectId] = None

class School(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    type: Literal['public','private']
    level: Literal['primaire','secondaire','superieur','formation_pro']
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None

class EducationEvent(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    type: Literal['rentree','inscription','resultat','orientation','activity']
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    content: Optional[str] = None

class TutoringPost(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    posted_by: Optional[PyObjectId] = None
    subjects: List[str]
    level: Literal['primaire','college','lycee','universite']
    mode: Literal['domicile','enligne']
    city: Optional[str] = None
    contact: Optional[str] = None
    posted_at: datetime = Field(default_factory=datetime.utcnow)

# ---------- PREMIUM GUARD ----------
async def is_premium_user(user_id: Optional[str]) -> bool:
    if not user_id:
        return False
    try:
        u_id = ObjectId(user_id)
    except Exception:
        return False
    sub = await db.subscriptions.find_one({'user_id': u_id, 'status': {'$in': ['paid','active']}}, sort=[('expires_at', -1)])
    if not sub:
        return False
    if sub.get('expires_at') and sub['expires_at'] > datetime.utcnow():
        return True
    return False

async def require_premium(user_id: Optional[str] = None):
    if not await is_premium_user(user_id):
        raise HTTPException(status_code=402, detail="Premium required. Please subscribe.")

# ---------- STARTUP: Indexes & Seed ----------
async def ensure_indexes():
    # Pharmacies geo
    await db.pharmacies.create_index([('location', '2dsphere')])
    await db.pharmacies.create_index('name')
    # Generic indexes
    await db.alerts.create_index([('status', 1), ('created_at', -1)])
    await db.categories.create_index('slug', unique=True)
    await db.locations.create_index([('parent_id', 1), ('name', 1)])
    await db.jobs.create_index([('posted_at', -1)])
    await db.commodity_prices.create_index([('updated_at', -1)])
    await db.transactions.create_index('transaction_id', unique=True)

CATEGORIES = [
    {"slug": "urgence", "name": {"fr": "Urgence", "en": "Emergency"}, "icon": "alert"},
    {"slug": "sante", "name": {"fr": "Santé", "en": "Health"}, "icon": "hospital"},
    {"slug": "education", "name": {"fr": "Éducation", "en": "Education"}, "icon": "school"},
    {"slug": "examens_concours", "name": {"fr": "Examens & Concours", "en": "Exams & Contests"}, "icon": "clipboard-list"},
    {"slug": "services_publics", "name": {"fr": "Services publics", "en": "Public Services"}, "icon": "government"},
    {"slug": "emplois", "name": {"fr": "Emplois", "en": "Jobs"}, "icon": "briefcase"},
    {"slug": "alertes", "name": {"fr": "Alertes", "en": "Alerts"}, "icon": "bullhorn"},
    {"slug": "services_utiles", "name": {"fr": "Services utiles", "en": "Utilities"}, "icon": "headset"},
    {"slug": "agriculture", "name": {"fr": "Agriculture", "en": "Agriculture"}, "icon": "leaf"},
    {"slug": "loisirs_tourisme", "name": {"fr": "Loisirs & Tourisme", "en": "Leisure & Tourism"}, "icon": "map"},
    {"slug": "transport", "name": {"fr": "Transport", "en": "Transport"}, "icon": "car"},
]

ABIDJAN_COMMUNES = ["Plateau","Cocody","Yopougon","Abobo","Adjame","Koumassi","Marcory","Treichville","Port-Bouët","Attécoubé","Songon","Anyama"]

async def seed_data():
    # Categories
    if await db.categories.count_documents({}) == 0:
        for c in CATEGORIES:
            await db.categories.insert_one({**c, 'name': {**c['name'], 'es': c['name'].get('en'), 'it': c['name'].get('en'), 'ar': c['name'].get('en')}})

    # Locations (Abidjan + communes)
    if await db.locations.count_documents({}) == 0:
        city = await db.locations.insert_one({'name': 'Abidjan', 'type': 'city'})
        for com in ABIDJAN_COMMUNES:
            await db.locations.insert_one({'name': com, 'type': 'commune', 'parent_id': city.inserted_id})
        await db.locations.insert_one({'name': 'Bouaké', 'type': 'city'})
        await db.locations.insert_one({'name': 'San-Pédro', 'type': 'city'})

    # Useful numbers
    if await db.useful_numbers.count_documents({}) == 0:
        await db.useful_numbers.insert_many([
            {'name': 'Police Secours', 'number': '170', 'category': 'police', 'description': 'Urgences policières'},
            {'name': 'Gendarmerie', 'number': '145', 'category': 'gendarmerie'},
            {'name': 'Sapeurs-pompiers', 'number': '180', 'category': 'pompiers'},
            {'name': 'SAMU', 'number': '185', 'category': 'samu'}
        ])

    # Pharmacies (sample)
    if await db.pharmacies.count_documents({}) == 0:
        pharmacies = [
            {
                'name': 'Pharmacie du Plateau',
                'address': 'Avenue Franchet d’Esperey, Plateau',
                'city': 'Abidjan',
                'phone': '+225 20 21 43 21',
                'location': {'type': 'Point', 'coordinates': [-4.023, 5.324]},
                'duty_days': [0,2,4],
            },
            {
                'name': 'Pharmacie de Cocody',
                'address': 'Boulevard Latrille, Cocody',
                'city': 'Abidjan',
                'phone': '+225 22 44 55 66',
                'location': {'type': 'Point', 'coordinates': [-3.990, 5.350]},
                'duty_days': [1,3,5],
            },
        ]
        for p in pharmacies:
            p['updated_at'] = datetime.utcnow()
            await db.pharmacies.insert_one(p)

    # Alerts
    if await db.alerts.count_documents({}) == 0:
        await db.alerts.insert_many([
            {
                'title': 'Pluie intense et inondations à Yopougon',
                'type': 'flood',
                'description': 'Routes impraticables, évitez le quartier Andokoi.',
                'city': 'Abidjan',
                'status': 'active',
                'images_base64': [],
                'created_at': datetime.utcnow(),
            },
            {
                'title': 'Disparition inquiétante - M. Kouassi',
                'type': 'missing_person',
                'description': 'Dernière fois vu à Cocody Angré, 35 ans, 1m75.',
                'city': 'Abidjan',
                'status': 'active',
                'images_base64': [],
                'created_at': datetime.utcnow(),
            },
        ])

    # Hospitals
    if await db.hospitals.count_documents({}) == 0:
        await db.hospitals.insert_many([
            {
                'name': 'CHU de Cocody', 'type': 'public', 'specialties': ['Urgences','Chirurgie'],
                'phone': '+225 27 22 44 64 64', 'city': 'Abidjan',
                'location': {'type': 'Point', 'coordinates': [-3.990, 5.360]}
            },
            {
                'name': 'PISAM', 'type': 'private', 'specialties': ['Cardiologie','Imagerie médicale'],
                'phone': '+225 27 22 44 60 60', 'city': 'Abidjan',
                'location': {'type': 'Point', 'coordinates': [-4.009, 5.334]}
            }
        ])

    # Exams
    if await db.exams.count_documents({}) == 0:
        await db.exams.insert_many([
            {
                'name': 'Concours ENA - Cycle A', 'org': 'ENA', 'category': 'ENA',
                'start_date': datetime.utcnow() + timedelta(days=30),
                'end_date': datetime.utcnow() + timedelta(days=60),
                'link': 'https://www.ena.ci/'
            },
            {
                'name': 'Concours CAFOP', 'org': 'MENET-FP', 'category': 'CAFOP',
                'link': 'http://www.men-deco.org/'
            }
        ])

    # Public Services & Laws & Campaigns & Formalities
    if await db.public_services.count_documents({}) == 0:
        await db.public_services.insert_many([
            {'name': 'Mairie de Cocody', 'type': 'mairie', 'phone': '+225 27 22 44 00 00', 'city': 'Abidjan', 'website': 'https://mairiecocody.ci'},
            {'name': "Palais de Justice d'Abidjan", 'type': 'palais_justice', 'city': 'Abidjan', 'website': 'http://www.justice.gouv.ci/'}
        ])
    if await db.law_announcements.count_documents({}) == 0:
        await db.law_announcements.insert_many([
            {'title': 'Nouvelle réforme fiscale 2025', 'effective_date': datetime.utcnow() + timedelta(days=15), 'summary': 'Réforme sur la TVA', 'link': 'http://www.dgi.gouv.ci/'}
        ])
    if await db.public_campaigns.count_documents({}) == 0:
        await db.public_campaigns.insert_many([
            {'title': 'Opération grand ménage', 'org': 'Mairie de Cocody', 'category': 'municipale', 'content': 'Nettoyage des quartiers ce samedi 9h.'}
        ])
    if await db.public_formalities.count_documents({}) == 0:
        await db.public_formalities.insert_many([
            {'name': 'Demande d\'acte de naissance', 'doc_type': 'acte_naissance', 'steps': ['Faire une demande en ligne', 'Se présenter à la mairie'], 'link': 'https://services.etatcivil.ci/'},
            {'name': 'Demande de casier judiciaire', 'doc_type': 'casier_judiciaire', 'steps': ['Remplir le formulaire', 'Payer les frais'], 'link': 'https://casier-judiciaire.justice.gouv.ci/'}
        ])

    # Jobs & CV templates
    if await db.jobs.count_documents({}) == 0:
        await db.jobs.insert_many([
            {'posting_type': 'offer', 'title': 'Assistant administratif', 'company_or_name': 'Société ABC', 'description': 'Gestion des dossiers', 'city': 'Abidjan', 'contact_phone': '+225 01 23 45 67 89'},
            {'posting_type': 'seeker', 'title': 'Développeur mobile React Native', 'company_or_name': 'Kouassi Jean', 'description': "2 ans d'expérience", 'city': 'Abidjan'}
        ])
    if await db.cv_templates.count_documents({}) == 0:
        await db.cv_templates.insert_one({'title': 'Modèle de CV simple', 'file_base64': 'JVBERi0xLjQKJcTl8uXrp/Og0MTGCg==', 'tips': 'Mettez en avant vos expériences pertinentes.'})

    # Utilities
    if await db.utility_services.count_documents({}) == 0:
        await db.utility_services.insert_many([
            {'name': 'CIE - Electricité', 'shortcode': '179', 'phone': '+225 27 20 25 60 60', 'website': 'https://www.cie.ci'},
            {'name': 'SODECI - Eau', 'shortcode': '175', 'phone': '+225 27 21 23 24 25', 'website': 'https://www.sodeci.ci'},
            {'name': "Orange Côte d'Ivoire", 'shortcode': '144', 'website': 'https://www.orange.ci'}
        ])

    # Agriculture
    if await db.commodity_prices.count_documents({}) == 0:
        await db.commodity_prices.insert_many([
            {'commodity': 'Cacao', 'unit': 'kg', 'price_fcfa': 1000, 'market': 'Abidjan'},
            {'commodity': 'Café', 'unit': 'kg', 'price_fcfa': 900, 'market': 'Abidjan'},
            {'commodity': 'Anacarde', 'unit': 'kg', 'price_fcfa': 600, 'market': 'Bouaké'}
        ])
    if await db.agri_tips.count_documents({}) == 0:
        await db.agri_tips.insert_many([
            {'title': 'Conseils sur la fermentation du cacao', 'content': 'Retourner les fèves tous les 2 jours.'}
        ])
    if await db.cooperatives.count_documents({}) == 0:
        await db.cooperatives.insert_many([
            {'name': 'Coopérative Cacao Plateau', 'sector': 'cacao', 'city': 'Abidjan', 'contact_phone': '+225 01 11 22 33 44'}
        ])

    # Leisure & Tourism
    if await db.places.count_documents({}) == 0:
        await db.places.insert_many([
            {'name': 'Office National du Tourisme', 'type': 'tourism_office', 'city': 'Abidjan', 'website': 'https://www.visitcotedivoire.ci'},
            {'name': 'Hôtel Ivoire', 'type': 'hotel', 'city': 'Abidjan'}
        ])

    # Transport
    if await db.transport_info.count_documents({}) == 0:
        await db.transport_info.insert_many([
            {'topic': 'OSER', 'title': 'Port de la ceinture de sécurité', 'content': 'Campagne de sensibilisation OSER 2025'},
            {'topic': 'carte_grise', 'title': 'Demande de carte grise', 'content': 'Consultez les formalités en ligne.', 'link': 'https://www.siv.ci/'},
            {'topic': 'permis_conduire', 'title': 'Renouvellement du permis', 'content': 'Démarches à suivre', 'link': 'https://www.transports.gouv.ci/'}
        ])

    # Schools & Education
    if await db.schools.count_documents({}) == 0:
        await db.schools.insert_many([
            {'name': 'Lycée Classique d\'Abidjan', 'type': 'public', 'level': 'secondaire', 'city': 'Abidjan'},
            {'name': 'Université Félix Houphouët-Boigny', 'type': 'public', 'level': 'superieur', 'city': 'Abidjan'},
            {'name': 'Institut de Formation Professionnelle de Yopougon', 'type': 'public', 'level': 'formation_pro', 'city': 'Abidjan'}
        ])
    if await db.education_events.count_documents({}) == 0:
        await db.education_events.insert_many([
            {'title': 'Rentrée scolaire 2025-2026', 'type': 'rentree', 'start_date': datetime.utcnow() + timedelta(days=60), 'content': 'Date officielle de reprise des cours.'},
            {'title': 'Inscriptions en ligne', 'type': 'inscription', 'content': 'Plateforme ouverte pour les inscriptions.'}
        ])

# ---------- ROUTES ----------

@api.get("/")
async def root():
    return {"message": "Allô Services CI API"}

# Seed endpoint (idempotent)
@api.post("/seed")
async def seed():
    await ensure_indexes()
    await seed_data()
    return {"status": "ok"}

# Categories
@api.get("/categories")
async def list_categories():
    cats = await db.categories.find().to_list(200)
    for c in cats:
        c['id'] = str(c['_id'])
        del c['_id']
    return cats

# Users
@api.post("/auth/register")
async def register_user(payload: UserCreate):
    doc = payload.model_dump()
    doc['created_at'] = datetime.utcnow()
    doc['is_premium'] = False
    res = await db.users.insert_one(doc)
    saved = await db.users.find_one({'_id': res.inserted_id})
    saved['id'] = str(saved['_id'])
    del saved['_id']
    return saved

@api.get("/subscriptions/check")
async def check_subscription(user_id: str):
    user = await db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    sub = await db.subscriptions.find_one({'user_id': ObjectId(user_id), 'status': {'$in': ['paid','active']}}, sort=[('expires_at', -1)])
    active = False
    expires_at = None
    if sub and sub.get('expires_at') and sub['expires_at'] > datetime.utcnow():
        active = True
        expires_at = sub['expires_at']
    return {"is_premium": active, "expires_at": expires_at}

# --------- PAYMENTS (CINETPAY) ---------
class PaymentInitInput(BaseModel):
    user_id: str
    amount_fcfa: int = 1200
    customer_name: Optional[str] = None
    customer_surname: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    customer_city: Optional[str] = 'Abidjan'

@api.post("/payments/cinetpay/initiate")
async def cinetpay_initiate(payload: PaymentInitInput):
    try:
        user_id = ObjectId(payload.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    transaction_id = f"SUB_{uuid.uuid4().hex[:14]}"

    # Create transaction record (local)
    tr_doc = {
        'transaction_id': transaction_id,
        'user_id': user_id,
        'amount': payload.amount_fcfa,
        'currency': 'XOF',
        'status': 'PENDING',
        'provider': 'cinetpay',
        'created_at': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(minutes=45)
    }
    await db.transactions.insert_one(tr_doc)

    if CINETPAY_MODE.lower() != 'live' or not (CINETPAY_API_KEY and CINETPAY_SITE_ID and BACKEND_PUBLIC_BASE_URL):
        # Fallback stub mode
        stub_url = f"https://checkout.cinetpay.com/stub/{transaction_id}"
        await db.transactions.update_one({'transaction_id': transaction_id}, {'$set': {'status': 'INITIALIZED', 'payment_url': stub_url}})
        return {"transaction_id": transaction_id, "provider": "cinetpay", "payment_url": stub_url}

    # Live call to CinetPay
    try:
        cinetpay_payload = {
            "apikey": CINETPAY_API_KEY,
            "site_id": CINETPAY_SITE_ID,
            "transaction_id": transaction_id,
            "amount": payload.amount_fcfa,
            "currency": "XOF",
            "description": "Abonnement annuel Allô Services CI",
            "notify_url": f"{BACKEND_PUBLIC_BASE_URL}/api/payments/cinetpay/webhook",
            "return_url": f"{BACKEND_PUBLIC_BASE_URL}/api/payments/cinetpay/return",
            "channels": "ALL",
            "lang": "fr",
        }
        # Optional customer fields
        if payload.customer_name: cinetpay_payload["customer_name"] = payload.customer_name
        if payload.customer_surname: cinetpay_payload["customer_surname"] = payload.customer_surname
        if payload.customer_phone: cinetpay_payload["customer_phone_number"] = payload.customer_phone
        if payload.customer_email: cinetpay_payload["customer_email"] = payload.customer_email
        if payload.customer_address: cinetpay_payload["customer_address"] = payload.customer_address
        if payload.customer_city: cinetpay_payload["customer_city"] = payload.customer_city

        resp = requests.post("https://api-checkout.cinetpay.com/v2/payment", json=cinetpay_payload, timeout=30)
        data = resp.json() if resp.headers.get('content-type','').startswith('application/json') else {}
        if resp.status_code != 200 or data.get('code') not in ("201","00"):
            logger.error(f"CinetPay init error: {resp.status_code} - {resp.text}")
            raise HTTPException(status_code=400, detail=data.get('message','CinetPay init failed'))

        payment_url = data.get('data',{}).get('payment_url') or data.get('payment_url')
        if not payment_url:
            raise HTTPException(status_code=400, detail="No payment_url returned by CinetPay")

        await db.transactions.update_one({'transaction_id': transaction_id}, {'$set': {'status': 'INITIALIZED', 'payment_url': payment_url}})
        return {"transaction_id": transaction_id, "provider": "cinetpay", "payment_url": payment_url}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("CinetPay initiate exception")
        # fallback to stub if live fails
        stub_url = f"https://checkout.cinetpay.com/stub/{transaction_id}"
        await db.transactions.update_one({'transaction_id': transaction_id}, {'$set': {'status': 'INITIALIZED', 'payment_url': stub_url}})
        return {"transaction_id": transaction_id, "provider": "cinetpay", "payment_url": stub_url}

# Manual validation (kept for testing)
class PaymentValidateInput(BaseModel):
    transaction_id: str
    success: bool

@api.post("/payments/cinetpay/validate")
async def cinetpay_validate(payload: PaymentValidateInput):
    sub_status = 'paid' if payload.success else 'failed'
    tr = await db.transactions.find_one({'transaction_id': payload.transaction_id})
    if not tr:
        raise HTTPException(status_code=404, detail="Transaction not found")
    update: Dict[str, Any] = {'$set': {'status': 'ACCEPTED' if payload.success else 'REFUSED', 'updated_at': datetime.utcnow()}}
    await db.transactions.update_one({'_id': tr['_id']}, update)
    if payload.success:
        # Create subscription and mark user premium
        exp = datetime.utcnow() + timedelta(days=365)
        await db.subscriptions.insert_one({'user_id': tr['user_id'], 'amount_fcfa': tr['amount'], 'provider': 'cinetpay', 'status': 'active', 'transaction_id': payload.transaction_id, 'created_at': datetime.utcnow(), 'expires_at': exp})
        await db.users.update_one({'_id': tr['user_id']}, {'$set': {'is_premium': True}})
    return {"status": sub_status}

# Webhook signature verification (best-effort; exact spec may vary)
def verify_cinetpay_signature(secret_key: str, data_string: str, received_token: str) -> bool:
    token = hmac.new(secret_key.encode('utf-8'), data_string.encode('utf-8'), hashlib.sha256).hexdigest()
    return hmac.compare_digest(token.lower(), (received_token or '').lower())

@api.post("/payments/cinetpay/webhook")
async def cinetpay_webhook(
    request: Request,
    cpm_site_id: str = Form(''),
    cpm_trans_id: str = Form(''),
    cpm_trans_date: str = Form(''),
    cpm_amount: str = Form(''),
    cpm_currency: str = Form(''),
    signature: str = Form(''),  # often carries status
    payment_method: str = Form(''),
    cel_phone_num: str = Form(''),
    cpm_phone_prefixe: str = Form(''),
    cpm_language: str = Form(''),
    cpm_version: str = Form(''),
    cmp_payment_config: str = Form(''),
    cpm_page_action: str = Form(''),
    cpm_custom: str = Form(''),
    cpm_designation: str = Form(''),
    cpm_error_message: str = Form(''),
):
    # Build data string per documentation (may vary by account config)
    data_string = (
        (cpm_site_id or '') + (cpm_trans_id or '') + (cpm_trans_date or '') + (cpm_amount or '') + (cpm_currency or '') +
        (signature or '') + (payment_method or '') + (cel_phone_num or '') + (cpm_phone_prefixe or '') +
        (cpm_language or '') + (cpm_version or '') + (cmp_payment_config or '') + (cpm_page_action or '') +
        (cpm_custom or '') + (cpm_designation or '') + (cpm_error_message or '')
    )
    received_token = request.headers.get('X-TOKEN', '')

    valid = False
    if CINETPAY_SECRET_KEY:
        try:
            valid = verify_cinetpay_signature(CINETPAY_SECRET_KEY, data_string, received_token)
        except Exception:
            valid = False

    # Always log webhook
    await db.webhook_events.insert_one({
        'raw': {
            'cpm_site_id': cpm_site_id, 'cpm_trans_id': cpm_trans_id, 'cpm_trans_date': cpm_trans_date,
            'cpm_amount': cpm_amount, 'cpm_currency': cpm_currency, 'signature': signature,
            'payment_method': payment_method, 'cel_phone_num': cel_phone_num, 'cpm_phone_prefixe': cpm_phone_prefixe,
            'cpm_language': cpm_language, 'cpm_version': cpm_version, 'cmp_payment_config': cmp_payment_config,
            'cpm_page_action': cpm_page_action, 'cpm_custom': cpm_custom, 'cpm_designation': cpm_designation,
            'cpm_error_message': cpm_error_message
        },
        'received_token': received_token,
        'signature_valid': valid,
        'received_at': datetime.utcnow()
    })

    # If invalid signature, still check transaction with payment/check to be safe
    if cpm_trans_id and CINETPAY_API_KEY and CINETPAY_SITE_ID and CINETPAY_MODE.lower() == 'live':
        try:
            check_payload = {"apikey": CINETPAY_API_KEY, "site_id": CINETPAY_SITE_ID, "transaction_id": cpm_trans_id}
            resp = requests.post("https://api-checkout.cinetpay.com/v2/payment/check", json=check_payload, timeout=30)
            j = resp.json() if resp.headers.get('content-type','').startswith('application/json') else {}
            status = j.get('data',{}).get('status') or signature
        except Exception:
            status = signature
    else:
        status = signature

    # Update local transaction
    tr = await db.transactions.find_one({'transaction_id': cpm_trans_id})
    if tr:
        await db.transactions.update_one({'_id': tr['_id']}, {'$set': {'status': status, 'updated_at': datetime.utcnow(), 'payment_method': payment_method}})
        if status == 'ACCEPTED':
            exp = datetime.utcnow() + timedelta(days=365)
            await db.subscriptions.insert_one({'user_id': tr['user_id'], 'amount_fcfa': tr.get('amount',1200), 'provider': 'cinetpay', 'status': 'active', 'transaction_id': cpm_trans_id, 'created_at': datetime.utcnow(), 'expires_at': exp})
            await db.users.update_one({'_id': tr['user_id']}, {'$set': {'is_premium': True}})
    return Response(content="OK", status_code=200)

@api.get("/payments/cinetpay/status/{transaction_id}")
async def cinetpay_status(transaction_id: str = Path(...)):
    tr = await db.transactions.find_one({'transaction_id': transaction_id})
    if not tr:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {
        'transaction_id': transaction_id,
        'status': tr.get('status'),
        'payment_url': tr.get('payment_url'),
        'updated_at': tr.get('updated_at'),
    }

@api.get("/payments/cinetpay/return")
async def cinetpay_return(transaction_id: str, status: Optional[str] = None):
    tr = await db.transactions.find_one({'transaction_id': transaction_id})
    current = tr.get('status') if tr else None
    final_status = status or current or 'PENDING'
    return {"transaction_id": transaction_id, "status": final_status}

# Urgence: Useful numbers (FREE)
@api.get("/useful-numbers")
async def get_useful_numbers():
    items = await db.useful_numbers.find().to_list(100)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# Pharmacies (FREE)
@api.get("/pharmacies/nearby")
async def pharmacies_nearby(lat: float = Query(...), lng: float = Query(...), max_km: float = 10.0, duty_only: bool = False):
    query: Dict[str, Any] = {
        'location': {
            '$near': {
                '$geometry': {'type': 'Point', 'coordinates': [lng, lat]},
                '$maxDistance': int(max_km * 1000)
            }
        }
    }
    if duty_only:
        dow = datetime.utcnow().weekday()
        query['duty_days'] = {'$in': [dow]}
    results = await db.pharmacies.find(query).to_list(50)
    for r in results:
        r['id'] = str(r['_id'])
        del r['_id']
    return results

# Alerts (FREE to read/post)
class AlertCreate(BaseModel):
    title: str
    type: Literal['flood', 'missing_person', 'wanted_notice', 'fire', 'accident', 'other']
    description: str
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    images_base64: List[str] = Field(default_factory=list)
    posted_by: Optional[str] = None

@api.post("/alerts")
async def create_alert(payload: AlertCreate):
    doc: Dict[str, Any] = {
        'title': payload.title,
        'type': payload.type,
        'description': payload.description,
        'city': payload.city,
        'images_base64': payload.images_base64,
        'status': 'active',
        'created_at': datetime.utcnow()
    }
    if payload.lat is not None and payload.lng is not None:
        doc['location'] = {'type': 'Point', 'coordinates': [payload.lng, payload.lat]}
    if payload.posted_by:
        try:
            doc['posted_by'] = ObjectId(payload.posted_by)
        except Exception:
            pass
    res = await db.alerts.insert_one(doc)
    saved = await db.alerts.find_one({'_id': res.inserted_id})
    saved['id'] = str(saved['_id'])
    del saved['_id']
    return saved

@api.get("/alerts")
async def list_alerts(status: Optional[str] = None, type: Optional[str] = None):
    query: Dict[str, Any] = {}
    if status:
        query['status'] = status
    if type:
        query['type'] = type
    items = await db.alerts.find(query).sort('created_at', -1).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

@api.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    try:
        _id = ObjectId(alert_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    await db.alerts.update_one({'_id': _id}, {'$set': {'status': 'resolved'}})
    return {"status": "resolved"}

# HEALTH (Premium)
@api.get("/hospitals")
async def list_hospitals(user_id: Optional[str] = None, city: Optional[str] = None, type: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if city: query['city'] = city
    if type: query['type'] = type
    items = await db.hospitals.find(query).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# EXAMS & CONCOURS (Premium)
@api.get("/exams")
async def list_exams(user_id: Optional[str] = None):
    await require_premium(user_id)
    items = await db.exams.find().to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# SERVICES PUBLICS (Premium)
@api.get("/public-services")
async def list_public_services(user_id: Optional[str] = None, type: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if type: query['type'] = type
    items = await db.public_services.find(query).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

@api.get("/laws")
async def list_laws(user_id: Optional[str] = None):
    await require_premium(user_id)
    items = await db.law_announcements.find().sort('effective_date', 1).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

@api.get("/public/campaigns")
async def list_campaigns(user_id: Optional[str] = None):
    await require_premium(user_id)
    items = await db.public_campaigns.find().to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

@api.get("/public/formalities")
async def list_formalities(user_id: Optional[str] = None, doc_type: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if doc_type: query['doc_type'] = doc_type
    items = await db.public_formalities.find(query).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# JOBS
@api.get("/jobs")
async def list_jobs(user_id: Optional[str] = None, posting_type: Optional[str] = None, city: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if posting_type: query['posting_type'] = posting_type
    if city: query['city'] = city
    items = await db.jobs.find(query).sort('posted_at', -1).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

class JobCreate(BaseModel):
    posting_type: Literal['offer','seeker']
    title: str
    company_or_name: str
    description: str
    city: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

@api.post("/jobs", response_model=Job)
async def create_job(payload: JobCreate):
    doc = payload.model_dump()
    doc['posted_at'] = datetime.utcnow()
    res = await db.jobs.insert_one(doc)
    saved = await db.jobs.find_one({'_id': res.inserted_id})
    saved['id'] = saved['_id']
    return Job(**saved)

@api.get("/jobs/cv-templates")
async def cv_templates(user_id: Optional[str] = None):
    await require_premium(user_id)
    items = await db.cv_templates.find().to_list(20)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# UTILITIES (Premium)
@api.get("/utilities")
async def list_utilities(user_id: Optional[str] = None):
    await require_premium(user_id)
    items = await db.utility_services.find().to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# AGRICULTURE (Premium)
@api.get("/agri/prices")
async def list_prices(user_id: Optional[str] = None):
    await require_premium(user_id)
    items = await db.commodity_prices.find().sort('updated_at', -1).to_list(100)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

@api.get("/agri/tips")
async def list_agri_tips(user_id: Optional[str] = None):
    await require_premium(user_id)
    items = await db.agri_tips.find().to_list(100)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

@api.get("/agri/coops")
async def list_coops(user_id: Optional[str] = None, sector: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if sector: query['sector'] = sector
    items = await db.cooperatives.find(query).to_list(100)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# LEISURE & TOURISM (Premium)
@api.get("/places")
async def list_places(user_id: Optional[str] = None, type: Optional[str] = None, city: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if type: query['type'] = type
    if city: query['city'] = city
    items = await db.places.find(query).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# TRANSPORT (Premium)
@api.get("/transport")
async def list_transport(user_id: Optional[str] = None, topic: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if topic: query['topic'] = topic
    items = await db.transport_info.find(query).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# LOCATIONS (FREE)
@api.get("/locations")
async def list_locations(parent_id: Optional[str] = None, type: Optional[str] = None):
    query: Dict[str, Any] = {}
    if parent_id:
        try:
            query['parent_id'] = ObjectId(parent_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid parent_id")
    if type:
        query['type'] = type
    items = await db.locations.find(query).sort('name', 1).to_list(300)
    for i in items:
        i['id'] = str(i['_id'])
        if i.get('parent_id'):
            i['parent_id'] = str(i['parent_id'])
        del i['_id']
    return items

# SCHOOLS (Premium)
@api.get("/schools")
async def list_schools(user_id: Optional[str] = None, city: Optional[str] = None, level: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if city: query['city'] = city
    if level: query['level'] = level
    items = await db.schools.find(query).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# EDUCATION EVENTS (Premium)
@api.get("/education/events")
async def list_edu_events(user_id: Optional[str] = None, type: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if type: query['type'] = type
    items = await db.education_events.find(query).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# TUTORING (post free, list premium)
class TutoringPostCreate(BaseModel):
    posted_by: Optional[str] = None
    subjects: List[str]
    level: Literal['primaire','college','lycee','universite']
    mode: Literal['domicile','enligne']
    city: Optional[str] = None
    contact: Optional[str] = None

@api.post("/education/tutoring", response_model=TutoringPost)
async def create_tutoring(payload: TutoringPostCreate):
    doc: Dict[str, Any] = {
        'subjects': payload.subjects,
        'level': payload.level,
        'mode': payload.mode,
        'city': payload.city,
        'contact': payload.contact,
        'posted_at': datetime.utcnow()
    }
    if payload.posted_by:
        try:
            doc['posted_by'] = ObjectId(payload.posted_by)
        except Exception:
            pass
    res = await db.tutoring_posts.insert_one(doc)
    saved = await db.tutoring_posts.find_one({'_id': res.inserted_id})
    saved['id'] = saved['_id']
    return TutoringPost(**saved)

@api.get("/education/tutoring")
async def list_tutoring(user_id: Optional[str] = None, city: Optional[str] = None, level: Optional[str] = None):
    await require_premium(user_id)
    query: Dict[str, Any] = {}
    if city: query['city'] = city
    if level: query['level'] = level
    items = await db.tutoring_posts.find(query).sort('posted_at', -1).to_list(200)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# Include router
app.include_router(api)

@app.on_event("startup")
async def on_startup():
    await ensure_indexes()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()