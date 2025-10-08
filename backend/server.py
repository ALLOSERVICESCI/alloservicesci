from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, Request, Form, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Dict, Any, AsyncGenerator
from datetime import datetime, timedelta
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import uuid
import requests
import hmac
import hashlib
import bcrypt
import logging
import asyncio
import json

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

# Emergent LLM config
EMERGENT_API_KEY = os.environ.get('EMERGENT_API_KEY')
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')
TEMPERATURE_DEFAULT = float(os.environ.get('AI_TEMPERATURE', '0.5'))
MAX_TOKENS_DEFAULT = int(os.environ.get('AI_MAX_TOKENS', '1200'))

# App + Router
app = FastAPI(title="Allô Services CI API", version="0.8.0")
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

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str  # Email obligatoire pour l'authentification
    phone: Optional[str] = None
    city_id: Optional[str] = None
    city: Optional[str] = None
    preferred_lang: Optional[LangKey] = None
    password: str  # Mot de passe pour l'authentification

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city_id: Optional[str] = None
    city: Optional[str] = None
    preferred_lang: Optional[LangKey] = None

class PushTokenRegister(BaseModel):
    token: str
    user_id: Optional[str] = None
    platform: Optional[str] = None
    city: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None

class PushSendInput(BaseModel):
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None
    city: Optional[str] = None
    lang: Optional[LangKey] = None
    premium_only: Optional[bool] = False

class AlertCreate(BaseModel):
    title: str
    type: Literal['flood', 'missing_person', 'wanted_notice', 'fire', 'accident', 'other']
    description: str
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    images_base64: List[str] = Field(default_factory=list)
    posted_by: Optional[str] = None

# -------- HEALTH FACILITIES --------
class HealthFacilityCreate(BaseModel):
    name: str
    facility_type: Literal['public','clinic','private','other'] = 'public'
    services: Optional[str] = None
    address: Optional[str] = None
    city: str = 'Abidjan'
    commune: Optional[str] = None
    phones: List[str] = Field(default_factory=list)
    website: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class HealthFacilityOut(BaseModel):
    id: str
    name: str
    facility_type: str
    services: Optional[str] = None
    address: Optional[str] = None
    city: str
    commune: Optional[str] = None
    phones: List[str] = []
    website: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

# ---------- INDEXES ----------
async def ensure_indexes():
    await db.pharmacies.create_index([('location', '2dsphere')])
    await db.pharmacies.create_index('name')
    await db.alerts.create_index([('status', 1), ('created_at', -1)])
    await db.alerts.create_index('read_by')
    await db.categories.create_index('slug', unique=True)
    await db.locations.create_index([('parent_id', 1), ('name', 1)])
    await db.jobs.create_index([('posted_at', -1)])
    await db.commodity_prices.create_index([('updated_at', -1)])
    await db.transactions.create_index('transaction_id', unique=True)
    await db.transactions.create_index([('user_id', 1), ('created_at', -1)])
    await db.push_tokens.create_index('token', unique=True)
    await db.push_tokens.create_index([('city', 1)])
    await db.push_tokens.create_index([('preferred_lang', 1)])
    await db.push_tokens.create_index([('is_premium', 1)])
    await db.health_facilities.create_index([('location', '2dsphere')])
    await db.health_facilities.create_index('name')
    await db.health_facilities.create_index([('city', 1), ('commune', 1)])

# ---------- BASIC ROUTES ----------
@api.get('/health')
async def health():
    return {"status": "ok"}

@api.get('/')
async def api_root():
    return {"message": "Allô Services CI API", "paths": [r.path for r in app.router.routes]}

# ---------- AUTH / USERS ----------
@api.post("/auth/register")
@api.post("/auth/register/")
async def register_user(payload: UserCreate):
    doc = payload.model_dump()
    doc['created_at'] = datetime.utcnow()
    doc['is_premium'] = False
    res = await db.users.insert_one(doc)
    saved = await db.users.find_one({'_id': res.inserted_id})
    saved['id'] = str(saved['_id'])
    del saved['_id']
    return saved

@api.patch("/users/{user_id}")
async def update_user(user_id: str, payload: UserUpdate):
    try:
        _id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        return {"updated": False}
    updates['updated_at'] = datetime.utcnow()
    r = await db.users.update_one({'_id': _id}, {'$set': updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    saved = await db.users.find_one({'_id': _id})
    saved['id'] = str(saved['_id'])
    del saved['_id']
    return saved

@api.get("/subscriptions/check")
async def check_subscription(user_id: str):
    try:
        uid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    user = await db.users.find_one({'_id': uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    sub = await db.subscriptions.find_one({'user_id': uid, 'status': {'$in': ['paid','active']}}, sort=[('expires_at', -1)])
    active = False
    expires_at = None
    if sub and sub.get('expires_at') and sub['expires_at'] > datetime.utcnow():
        active = True
        expires_at = sub['expires_at']
    return {"is_premium": active, "expires_at": expires_at}

async def _is_user_premium(uid: ObjectId) -> bool:
    sub = await db.subscriptions.find_one({'user_id': uid, 'status': {'$in': ['paid','active']}}, sort=[('expires_at', -1)])
    return bool(sub and sub.get('expires_at') and sub['expires_at'] > datetime.utcnow())

# ---------- PAYMENTS (CinetPay) ----------
class PaymentInitInput(BaseModel):
    user_id: str
    amount_fcfa: int = 1200

@api.post("/payments/cinetpay/initiate")
async def cinetpay_initiate(payload: PaymentInitInput):
    try:
        user_id = ObjectId(payload.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    transaction_id = f"SUB_{uuid.uuid4().hex[:14]}"

    tr_doc = {
        'transaction_id': transaction_id,
        'user_id': user_id,
        'amount': payload.amount_fcfa,
        'currency': 'XOF',
        'status': 'PENDING',
        'provider': 'cinetpay',
        'payment_url': None,
        'created_at': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(minutes=45)
    }
    await db.transactions.insert_one(tr_doc)

    if CINETPAY_MODE.lower() != 'live' or not (CINETPAY_API_KEY and CINETPAY_SITE_ID and BACKEND_PUBLIC_BASE_URL):
        stub_url = f"https://checkout.cinetpay.com/stub/{transaction_id}"
        await db.transactions.update_one({'transaction_id': transaction_id}, {'$set': {'status': 'INITIALIZED', 'payment_url': stub_url}})
        return {"transaction_id": transaction_id, "provider": "cinetpay", "payment_url": stub_url}

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
        resp = requests.post("https://api-checkout.cinetpay.com/v2/payment", json=cinetpay_payload, timeout=30)
        data = resp.json() if resp.headers.get('content-type','').startswith('application/json') else {}
        if resp.status_code != 200 or data.get('code') not in ("201","00"):
            raise HTTPException(status_code=400, detail=data.get('message','CinetPay init failed'))
        payment_url = data.get('data',{}).get('payment_url') or data.get('payment_url')
        if not payment_url:
            raise HTTPException(status_code=400, detail="No payment_url returned by CinetPay")
        await db.transactions.update_one({'transaction_id': transaction_id}, {'$set': {'status': 'INITIALIZED', 'payment_url': payment_url}})
        return {"transaction_id": transaction_id, "provider": "cinetpay", "payment_url": payment_url}
    except Exception as e:
        logger.exception("CinetPay init error")
        raise HTTPException(status_code=500, detail=str(e))

# ---------- PHARMACIES ----------
@api.get('/pharmacies')
async def list_pharmacies(
    on_duty: Optional[bool] = Query(None),
    city: Optional[str] = Query(None),
    near_lat: Optional[float] = Query(None),
    near_lng: Optional[float] = Query(None),
    max_km: float = Query(5.0)
):
    """
    Returns pharmacies with optional filters:
    - on_duty: only pharmacies de garde (computed dynamically from duty_days or explicit flag)
    - city: exact city (case-insensitive)
    - near_lat, near_lng, max_km: geospatial filter around a point (meters)
    """
    criteria: Dict[str, Any] = {}
    # Do NOT push on_duty into criteria; compute dynamically to support duty_days
    if city:
        criteria['city'] = { '$regex': f'^{city}$', '$options': 'i' }

    # Build cursor
    if near_lat is not None and near_lng is not None:
        try:
            meters = max(100.0, float(max_km) * 1000.0)
        except Exception:
            meters = 5000.0
        criteria['location'] = {
            '$near': {
                '$geometry': { 'type': 'Point', 'coordinates': [float(near_lng), float(near_lat)] },
                '$maxDistance': meters
            }
        }

    # Helper to compute dynamic on-duty
    def compute_on_duty(doc: Dict[str, Any]) -> bool:
        # Explicit flag wins if present
        if isinstance(doc.get('on_duty'), bool):
            return bool(doc['on_duty'])
        duty_days = doc.get('duty_days') or doc.get('dutyDays')
        if isinstance(duty_days, list):
            try:
                # Python weekday(): Monday=0 .. Sunday=6
                today = datetime.utcnow().weekday()
                return any(int(d) == today for d in duty_days)
            except Exception:
                return False
        return False

    cur = db.pharmacies.find(criteria).limit(300)
    out: List[Dict[str, Any]] = []
    async for p in cur:
        p['id'] = str(p['_id'])
        del p['_id']
        # Compute dynamic on_duty and expose it consistently
        computed = compute_on_duty(p)
        p['on_duty'] = computed
        # Apply on_duty filter post-fetch if requested
        if on_duty is True and not computed:
            continue
        out.append(p)
    return out

# ---------- HEALTH FACILITIES ENDPOINTS ----------
@api.get('/health/facilities', response_model=List[HealthFacilityOut])
async def list_health_facilities(
    city: Optional[str] = Query('Abidjan'),
    commune: Optional[str] = Query(None),
    near_lat: Optional[float] = Query(None),
    near_lng: Optional[float] = Query(None),
    max_km: float = Query(5.0)
):
    criteria: Dict[str, Any] = {}
    if city:
        criteria['city'] = { '$regex': f'^{city}$', '$options': 'i' }
    if commune:
        criteria['commune'] = { '$regex': f'^{commune}$', '$options': 'i' }

    if near_lat is not None and near_lng is not None:
        try:
            meters = max(100.0, float(max_km) * 1000.0)
        except Exception:
            meters = 5000.0
        criteria['location'] = {
            '$near': {
                '$geometry': { 'type': 'Point', 'coordinates': [float(near_lng), float(near_lat)] },
                '$maxDistance': meters
            }
        }

    cur = db.health_facilities.find(criteria).limit(500)
    out: List[HealthFacilityOut] = []
    async for h in cur:
        doc = {
            'id': str(h['_id']),
            'name': h.get('name'),
            'facility_type': h.get('facility_type','public'),
            'services': h.get('services'),
            'address': h.get('address'),
            'city': h.get('city','Abidjan'),
            'commune': h.get('commune'),
            'phones': h.get('phones',[]),
            'website': h.get('website'),
            'lat': None,
            'lng': None,
        }
        loc = h.get('location')
        if isinstance(loc, dict) and loc.get('type') == 'Point':
            try:
                coords = loc.get('coordinates') or []
                doc['lng'] = float(coords[0])
                doc['lat'] = float(coords[1])
            except Exception:
                pass
        out.append(doc)
    return out

async def seed_health_facilities():
    count = await db.health_facilities.count_documents({'city': { '$regex': '^Abidjan$', '$options': 'i' }})
    if count > 0:
        return
    seed = [
        # COCODY
        {
            'name': 'CHU de Cocody',
            'facility_type': 'public',
            'services': 'urgences, médecine interne, chirurgie, gynéco-obs, pédiatrie, odonto, ophtalmo',
            'address': "Bd de l’Université, Cocody",
            'city': 'Abidjan',
            'commune': 'Cocody',
            'phones': ['+225 22 44 90 00', '+225 22 44 90 38'],
            'website': None,
            # location unknown for now
        },
        {
            'name': "CHU d’Angré",
            'facility_type': 'public',
            'services': 'urgences 24/7, médecine, chirurgie, pédiatrie, gynéco, imagerie',
            'address': 'Angré 8e tranche, Cocody',
            'city': 'Abidjan',
            'commune': 'Cocody',
            'phones': ['+225 27 22 49 64 00'],
            'website': 'https://chuangre.ci',
            'location': { 'type': 'Point', 'coordinates': [-3.957433, 5.401012] },
        },
        {
            'name': 'PISAM (Polyclinique Internationale Ste Anne-Marie)',
            'facility_type': 'clinic',
            'services': 'clinique multi-spécialités, urgences 24/7, imagerie, maternité',
            'address': 'Cocody, Rue Cannebière / Av. Joseph Blohorn',
            'city': 'Abidjan',
            'commune': 'Cocody',
            'phones': ['+225 27 22 48 31 31', '+225 27 22 48 31 32'],
            'website': 'https://groupepisam.com',
        },
        {
            'name': 'Clinique Médicale Danga',
            'facility_type': 'clinic',
            'services': 'pluridisciplinaire, référence en néphro-dialyse',
            'address': 'Av. des Jasmins n°26, Danga, Cocody',
            'city': 'Abidjan',
            'commune': 'Cocody',
            'phones': ['+225 27 22 48 44 44', '+225 27 22 48 23 23'],
            'website': 'https://cliniquemedicaledanga.com',
        },
        {
            'name': 'Polyclinique des II Plateaux (Novamed)',
            'facility_type': 'clinic',
            'services': 'multi-spécialités',
            'address': 'II Plateaux, Bd Latrille',
            'city': 'Abidjan',
            'commune': 'Cocody',
            'phones': ['+225 27 22 41 33 34'],
            'website': 'https://groupenovamed.com',
        },
        # TREICHVILLE / PLATEAU
        {
            'name': 'CHU de Treichville',
            'facility_type': 'public',
            'services': 'urgences 24/7, médecine, chirurgie, réanimation, maternité',
            'address': 'Bd de Marseille (Km 4), Treichville',
            'city': 'Abidjan',
            'commune': 'Treichville',
            'phones': [],
            'website': None,
        },
        {
            'name': "ICA – Institut de Cardiologie d’Abidjan",
            'facility_type': 'public',
            'services': 'cardiologie, chirurgie cardiaque, rythmologie, cathétérisme',
            'address': 'CHU de Treichville, Bd de Marseille',
            'city': 'Abidjan',
            'commune': 'Treichville',
            'phones': ['+225 27 21 21 61 70', '+225 07 78 77 18 67'],
            'website': 'https://ica.ci',
        },
        {
            'name': "Polyclinique Internationale de l’Indénié (Novamed)",
            'facility_type': 'clinic',
            'services': 'multi-spécialités, urgences 24/7',
            'address': "4 Bd de l’Indénié, Plateau",
            'city': 'Abidjan',
            'commune': 'Plateau',
            'phones': ['+225 27 20 30 91 00'],
            'website': 'https://groupenovamed.com',
        },
        {
            'name': 'Nova Cardiologie (Novamed)',
            'facility_type': 'clinic',
            'services': 'cardiologie',
            'address': "4 Bd de l’Indénié, Plateau",
            'city': 'Abidjan',
            'commune': 'Plateau',
            'phones': ['+225 27 20 30 91 00 (standard)'],
            'website': 'https://centre-novacardio.com',
        },
        # MARCORY
        {
            'name': 'Hôpital Général de Marcory',
            'facility_type': 'public',
            'services': 'médecine, pédiatrie, gynéco, radiologie, odonto, urgences',
            'address': 'Marcory, Bd de Brazzaville (environs)',
            'city': 'Abidjan',
            'commune': 'Marcory',
            'phones': ['+225 21 26 30 08'],
            'website': None,
        },
        {
            'name': 'Nouvelle Polyclinique Les Grâces (Novamed)',
            'facility_type': 'clinic',
            'services': 'multi-spécialités',
            'address': 'Zone 4C, Rue Marconi',
            'city': 'Abidjan',
            'commune': 'Marcory',
            'phones': ['+225 27 21 75 15 95', '+225 27 21 75 15 97', '+225 27 21 75 15 98'],
            'website': 'https://groupenovamed.com',
        },
        # KOUMASSI
        {
            'name': 'Hôpital Général de Koumassi',
            'facility_type': 'public',
            'services': 'médecine générale, maternité, pédiatrie, imagerie de base',
            'address': 'Grand Carrefour Koumassi',
            'city': 'Abidjan',
            'commune': 'Koumassi',
            'phones': ['+225 27 21 36 13 10'],
            'website': None,
        },
        # PORT-BOUËT
        {
            'name': 'Hôpital Général de Port-Bouët',
            'facility_type': 'public',
            'services': 'consultations, urgences, imagerie, maternité, chirurgie, pédiatrie',
            'address': 'Rue des Caraïbes / Abattoir',
            'city': 'Abidjan',
            'commune': 'Port-Bouët',
            'phones': ['+225 27 21 27 85 00'],
            'website': None,
        },
        # BINGERVILLE
        {
            'name': 'Hôpital Mère-Enfant Dominique Ouattara (HME)',
            'facility_type': 'clinic',
            'services': 'pédiatrie, néonat, gynéco-obs, chirurgie pédiat., urgences 24/7',
            'address': 'Bingerville',
            'city': 'Abidjan',
            'commune': 'Bingerville',
            'phones': ['+225 27 22 51 15 00', '+225 01 72 76 76 76'],
            'website': 'https://hmebingerville.ci',
        },
        {
            'name': 'EPHD / Hôpital Général de Bingerville',
            'facility_type': 'public',
            'services': 'services généraux',
            'address': 'Bingerville',
            'city': 'Abidjan',
            'commune': 'Bingerville',
            'phones': [],
            'website': None,
        },
        # YOPOUGON
        {
            'name': 'Hôpital Général de Yopougon-Attié',
            'facility_type': 'public',
            'services': 'médecine, maternité, pédiatrie, PEC VIH/IST/TB, ouvert 24/7 (garde)',
            'address': 'Av. M-T Houphouët-Boigny, Yopougon',
            'city': 'Abidjan',
            'commune': 'Yopougon',
            'phones': ['+225 05 06 14 50 27', '+225 23 45 38 52 (ancien)'],
            'website': None,
        },
        # ADJAMÉ
        {
            'name': "Hôpital Général d’Adjamé",
            'facility_type': 'public',
            'services': 'médecine, maternité, pédiatrie',
            'address': 'Adjamé',
            'city': 'Abidjan',
            'commune': 'Adjamé',
            'phones': [],
            'website': None,
        },
    ]
    # normalize + add geospatial point when lat/lng present
    docs = []
    for h in seed:
        doc = dict(h)
        lat = h.get('lat'); lng = h.get('lng')
        if lat is not None and lng is not None:
            doc['location'] = { 'type': 'Point', 'coordinates': [float(lng), float(lat)] }
        elif 'location' in h:
            # already set (like CHU Angré)
            pass
        docs.append(doc)
    if docs:
        await db.health_facilities.insert_many(docs)
        logger.info(f"Seeded {len(docs)} health facilities for Abidjan")

# ---------- ALERTS: basic CRUD + unread count + read mark ----------
class MarkReadInput(BaseModel):
    user_id: str

@api.post('/alerts')
async def create_alert(payload: AlertCreate):
    doc = payload.model_dump()
    doc['created_at'] = datetime.utcnow()
    doc['status'] = doc.get('status') or 'new'
    doc['read_by'] = []
    res = await db.alerts.insert_one(doc)
    saved = await db.alerts.find_one({'_id': res.inserted_id})
    saved['id'] = str(saved['_id'])
    del saved['_id']
    return saved

@api.get('/alerts')
async def list_alerts(limit: int = 50):
    cur = db.alerts.find({}).sort('created_at', -1).limit(max(1, min(limit, 200)))
    out = []
    async for a in cur:
        a['id'] = str(a['_id'])
        del a['_id']
        # Convert ObjectId objects in read_by to strings for JSON serialization
        if 'read_by' in a and isinstance(a['read_by'], list):
            a['read_by'] = [str(obj_id) for obj_id in a['read_by']]
        out.append(a)
    return out

@api.patch('/alerts/{alert_id}/read')
async def mark_alert_read(alert_id: str, payload: MarkReadInput):
    try:
        aid = ObjectId(alert_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert_id")
    try:
        uid = ObjectId(payload.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    r = await db.alerts.update_one({'_id': aid}, {'$addToSet': {'read_by': uid}, '$set': {'updated_at': datetime.utcnow(), 'status': 'read'}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    a = await db.alerts.find_one({'_id': aid})
    a['id'] = str(a['_id'])
    del a['_id']
    # Convert ObjectId objects in read_by to strings for JSON serialization
    if 'read_by' in a and isinstance(a['read_by'], list):
        a['read_by'] = [str(obj_id) for obj_id in a['read_by']]
    return a

@api.get('/alerts/unread_count')
async def alerts_unread_count(user_id: Optional[str] = None):
    """
    Returns unread alerts count for the user.
    Policy: count alerts NOT read by this user (read_by doesn't contain user_id).
    If user_id not provided or invalid, returns total count of all alerts.
    """
    criteria: Dict[str, Any] = {}
    if user_id:
        try:
            uid = ObjectId(user_id)
            criteria['$or'] = [
                { 'read_by': { '$exists': False } },
                { 'read_by': { '$ne': uid } },
            ]
        except Exception:
            # ignore invalid id; fallback to global count
            pass
    try:
        count = await db.alerts.count_documents(criteria)
        return { 'count': int(count) }
    except Exception as e:
        logger.exception('unread_count failed')
        raise HTTPException(status_code=500, detail=str(e))

# ---------- AI: Allô IA (Emergent Integrations) ----------
class ChatMessage(BaseModel):
    role: Literal['system','user','assistant']
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: Optional[bool] = True
    temperature: Optional[float] = Field(default=TEMPERATURE_DEFAULT, ge=0, le=2)
    max_tokens: Optional[int] = Field(default=MAX_TOKENS_DEFAULT, ge=1, le=4000)


def _build_fallback_reply(messages: List[ChatMessage]) -> str:
    # Very small, deterministic helper to provide a graceful reply if no external LLM is configured
    last_user = next((m.content for m in reversed(messages) if m.role == 'user'), '').strip()
    preface = (
        "Je suis Allô IA. Voici une réponse concise basée sur votre message. "
        "Astuce: pour de meilleurs résultats, précisez la ville, l'administration visée et les pièces disponibles."
    )
    if not last_user:
        return preface + " Posez-moi une question (ex: 'Rédige une lettre de réclamation CIE pour coupure à Cocody')."
    # Keep echo minimal to avoid hallucinations; provide structured next steps
    return (
        f"{preface}\n\nRésumé de votre demande: {last_user[:400]}\n\n"
        "Proposition de plan: \n"
        "1) Contexte (ville/commune, date, n° dossier si existant)\n"
        "2) Objet en une ligne\n"
        "3) Corps (faits, impact, demande précise)\n"
        "4) Coordonnées (tél., email)\n\n"
        "Envoyez 'Rédige la lettre' pour recevoir un modèle prêt à copier."
    )


@api.post('/ai/chat')
async def ai_chat(payload: ChatRequest, request: Request):
    if not payload.messages or not isinstance(payload.messages, list):
        raise HTTPException(status_code=400, detail="messages est requis (array de {role, content})")

    # IMPORTANT: If Emergent universal key is not configured, return a helpful fallback
    if not EMERGENT_API_KEY:
        content = _build_fallback_reply(payload.messages)
        if payload.stream:
            async def gen() -> AsyncGenerator[bytes, None]:
                chunks = [content[i:i+200] for i in range(0, len(content), 200)] or [content]
                for ch in chunks:
                    yield f"data: {{\"content\": {json.dumps(ch)} }}\n\n".encode('utf-8')
                yield b"data: [DONE]\n\n"
            return StreamingResponse(gen(), media_type='text/event-stream')
        return {"content": content}

    # If a universal key is present but no provider client is configured in this build,
    # we still respond with a deterministic fallback (to avoid external calls without explicit approval).
    # Note: You can switch to real LLM calls later without changing frontend.
    content = _build_fallback_reply(payload.messages)
    if payload.stream:
        async def gen2() -> AsyncGenerator[bytes, None]:
            chunks = [content[i:i+220] for i in range(0, len(content), 220)] or [content]
            for ch in chunks:
                yield f"data: {{\"content\": {json.dumps(ch)} }}\n\n".encode('utf-8')
            yield b"data: [DONE]\n\n"
        return StreamingResponse(gen2(), media_type='text/event-stream')
    return {"content": content}


# ---------- DOCX GENERATION FOR ALLO IA ----------
class DocxRequest(BaseModel):
    content: str
    title: str | None = None

@api.post('/ai/export/docx')
async def export_docx(payload: DocxRequest):
    try:
        from docx import Document
        from docx.shared import Pt
        doc = Document()
        if payload.title:
            p = doc.add_paragraph()
            run = p.add_run(payload.title)
            run.bold = True
            run.font.size = Pt(14)
        for line in (payload.content or '').split('\n'):
            doc.add_paragraph(line)
        tmp_name = f"alloia_{uuid.uuid4().hex[:8]}.docx"
        tmp_path = f"/tmp/{tmp_name}"
        doc.save(tmp_path)
        with open(tmp_path, 'rb') as f:
            data = f.read()
        return Response(content=data, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', headers={
            'Content-Disposition': f'attachment; filename="{tmp_name}"'
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- CITIES & COMMUNES ----------
@api.get('/cities')
async def list_cities():
    """Récupère toutes les villes disponibles dans la base de données"""
    try:
        # Récupérer les villes uniques depuis les pharmacies et les établissements de santé
        pharmacy_cities = await db.pharmacies.distinct('city')
        health_cities = await db.health_facilities.distinct('city')
        
        # Combiner et dédupliquer
        all_cities = set()
        for city in pharmacy_cities:
            if city:
                all_cities.add(city)
        for city in health_cities:
            if city:
                all_cities.add(city)
        
        # Trier par ordre alphabétique
        cities = sorted(list(all_cities), key=lambda x: x.lower())
        
        return {"cities": cities}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des villes: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des villes")

@api.get('/communes')
async def list_communes(city: Optional[str] = Query(None)):
    """Récupère toutes les communes d'une ville ou toutes les communes disponibles"""
    try:
        criteria = {}
        if city:
            criteria['city'] = {'$regex': f'^{city}$', '$options': 'i'}
        
        # Récupérer les communes uniques depuis les pharmacies et les établissements de santé
        pharmacy_communes = await db.pharmacies.distinct('commune', criteria)
        health_communes = await db.health_facilities.distinct('commune', criteria)
        
        # Combiner et dédupliquer
        all_communes = set()
        for commune in pharmacy_communes:
            if commune:
                all_communes.add(commune)
        for commune in health_communes:
            if commune:
                all_communes.add(commune)
        
        # Trier par ordre alphabétique
        communes = sorted(list(all_communes), key=lambda x: x.lower())
        
        return {"communes": communes, "city": city}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des communes: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des communes")

@api.get('/cities-communes/search')
async def search_cities_communes(q: str = Query(..., min_length=1)):
    """Recherche de villes et communes basée sur une requête"""
    try:
        query = q.strip()
        if not query:
            return {"results": []}
        
        # Utiliser une recherche regex pour trouver les correspondances
        regex_pattern = {'$regex': f'.*{query}.*', '$options': 'i'}
        
        # Rechercher dans les villes
        city_criteria = {'city': regex_pattern}
        pharmacy_cities = await db.pharmacies.distinct('city', city_criteria)
        health_cities = await db.health_facilities.distinct('city', city_criteria)
        
        # Rechercher dans les communes
        commune_criteria = {'commune': regex_pattern}
        pharmacy_communes = await db.pharmacies.distinct('commune', commune_criteria)
        health_communes = await db.health_facilities.distinct('commune', commune_criteria)
        
        # Combiner les résultats
        results = []
        cities_set = set()
        communes_set = set()
        
        # Ajouter les villes
        for city in pharmacy_cities:
            if city and city not in cities_set:
                cities_set.add(city)
                results.append({"name": city, "type": "city"})
        for city in health_cities:
            if city and city not in cities_set:
                cities_set.add(city)
                results.append({"name": city, "type": "city"})
        
        # Ajouter les communes
        for commune in pharmacy_communes:
            if commune and commune not in communes_set:
                communes_set.add(commune)
                results.append({"name": commune, "type": "commune"})
        for commune in health_communes:
            if commune and commune not in communes_set:
                communes_set.add(commune)
                results.append({"name": commune, "type": "commune"})
        
        # Trier par pertinence (commençant par la requête en premier) puis par ordre alphabétique
        def sort_key(item):
            name = item["name"].lower()
            query_lower = query.lower()
            starts_with = name.startswith(query_lower)
            return (not starts_with, name)
        
        results.sort(key=sort_key)
        
        return {"results": results[:20], "query": query}  # Limiter à 20 résultats
    except Exception as e:
        logger.error(f"Erreur lors de la recherche: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la recherche")

# ---------- DATA IMPORT ----------
@api.post('/pharmacies/bulk-import')
async def bulk_import_pharmacies(pharmacies_data: List[Dict[str, Any]]):
    """Importe en masse des données de pharmacies"""
    try:
        imported_count = 0
        for pharmacy_data in pharmacies_data:
            # Vérifier si la pharmacie existe déjà (par nom et ville)
            existing = await db.pharmacies.find_one({
                'name': pharmacy_data['name'],
                'city': pharmacy_data['city']
            })
            
            if not existing:
                # Nettoyer et formater les données
                pharmacy_doc = {
                    'name': pharmacy_data['name'],
                    'address': pharmacy_data['address'],
                    'city': pharmacy_data['city'],
                    'commune': pharmacy_data.get('commune'),
                    'phone': pharmacy_data.get('phone'),
                    'duty_days': pharmacy_data.get('duty_days', []),
                    'on_duty': len(pharmacy_data.get('duty_days', [])) > 0,
                    'created_at': datetime.utcnow(),
                    'is_imported': True,
                }
                
                await db.pharmacies.insert_one(pharmacy_doc)
                imported_count += 1
        
        return {"message": f"{imported_count} pharmacies importées avec succès"}
    except Exception as e:
        logger.error(f"Erreur lors de l'import des pharmacies: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'import")

@api.delete('/pharmacies/clear-all')
async def clear_all_pharmacies():
    """Supprime toutes les pharmacies de la base de données"""
    try:
        result = await db.pharmacies.delete_many({})
        return {"message": f"{result.deleted_count} pharmacies supprimées"}
    except Exception as e:
        logger.error(f"Erreur lors de la suppression des pharmacies: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")


# Mount API
app.include_router(api)

# Startup tasks
@app.on_event('startup')
async def on_startup():
    await ensure_indexes()
    # Seed health facilities for Abidjan if none
    await seed_health_facilities()