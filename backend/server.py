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
    email: Optional[EmailStr] = None
    phone: str
    city_id: Optional[str] = None
    city: Optional[str] = None
    accept_terms: bool = True
    preferred_lang: LangKey = 'fr'
    photo_base64: Optional[str] = None

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

async def _is_user_premium(uid: ObjectId) -&gt; bool:
    sub = await db.subscriptions.find_one({'user_id': uid, 'status': {'$in': ['paid','active']}}, sort=[('expires_at', -1)])
    return bool(sub and sub.get('expires_at') and sub['expires_at'] &gt; datetime.utcnow())

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
    if count &gt; 0:
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

# Mount API
app.include_router(api)

# Startup tasks
@app.on_event('startup')
async def on_startup():
    await ensure_indexes()
    # Seed health facilities for Abidjan if none
    await seed_health_facilities()