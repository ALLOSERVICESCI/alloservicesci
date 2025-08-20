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
app = FastAPI(title="Allô Services CI API", version="0.5.0")
api = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMWARE := CORSMiddleware,
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

# ---------- INDEXES ----------
async def ensure_indexes():
    await db.pharmacies.create_index([('location', '2dsphere')])
    await db.pharmacies.create_index('name')
    await db.alerts.create_index([('status', 1), ('created_at', -1)])
    await db.categories.create_index('slug', unique=True)
    await db.locations.create_index([('parent_id', 1), ('name', 1)])
    await db.jobs.create_index([('posted_at', -1)])
    await db.commodity_prices.create_index([('updated_at', -1)])
    await db.transactions.create_index('transaction_id', unique=True)
    await db.push_tokens.create_index('token', unique=True)
    await db.push_tokens.create_index([('city', 1)])
    await db.push_tokens.create_index([('preferred_lang', 1)])
    await db.push_tokens.create_index([('is_premium', 1)])

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
    except HTTPException:
        raise
    except Exception:
        stub_url = f"https://checkout.cinetpay.com/stub/{transaction_id}"
        await db.transactions.update_one({'transaction_id': transaction_id}, {'$set': {'status': 'INITIALIZED', 'payment_url': stub_url}})
        return {"transaction_id": transaction_id, "provider": "cinetpay", "payment_url": stub_url}

class PaymentValidateInput(BaseModel):
    transaction_id: str
    success: bool

@api.post("/payments/cinetpay/validate")
async def cinetpay_validate(payload: PaymentValidateInput):
    tr = await db.transactions.find_one({'transaction_id': payload.transaction_id})
    if not tr:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await db.transactions.update_one({'_id': tr['_id']}, {'$set': {'status': 'ACCEPTED' if payload.success else 'REFUSED', 'updated_at': datetime.utcnow()}})
    if payload.success:
        exp = datetime.utcnow() + timedelta(days=365)
        await db.subscriptions.insert_one({'user_id': tr['user_id'], 'amount_fcfa': tr['amount'], 'provider': 'cinetpay', 'status': 'active', 'transaction_id': payload.transaction_id, 'created_at': datetime.utcnow(), 'expires_at': exp})
        await db.users.update_one({'_id': tr['user_id']}, {'$set': {'is_premium': True}})
        # Update push token premium flags for this user
        await db.push_tokens.update_many({'user_id': tr['user_id']}, {'$set': {'is_premium': True}})
    return {"status": 'paid' if payload.success else 'failed'}

@api.get("/payments/cinetpay/return")
async def cinetpay_return(transaction_id: str, status: Optional[str] = None):
    tr = await db.transactions.find_one({'transaction_id': transaction_id})
    current = tr.get('status') if tr else None
    final_status = status or current or 'PENDING'
    return {"transaction_id": transaction_id, "status": final_status}

# ---------- PHARMACIES (NEARBY) ----------
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
    items = await db.pharmacies.find(query).to_list(50)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# ---------- ALERTS ----------
@api.get("/alerts")
@api.get("/alerts/")
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

@api.post("/alerts")
@api.post("/alerts/")
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

# ---------- USEFUL NUMBERS ----------
@api.get('/useful-numbers')
async def get_useful():
    items = await db.useful_numbers.find().to_list(100)
    for i in items:
        i['id'] = str(i['_id'])
        del i['_id']
    return items

# ---------- PUSH NOTIFICATIONS ----------

def _chunk_list(items: List[str], size: int = 100) -> List[List[str]]:
    return [items[i:i+size] for i in range(0, len(items), size)]

async def _send_expo_push(tokens: List[str], payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not tokens:
        return []
    messages = []
    for t in tokens:
        messages.append({'to': t,'sound': 'default','title': payload.get('title'),'body': payload.get('body'),'data': payload.get('data') or {}})
    results: List[Dict[str, Any]] = []
    for batch in _chunk_list(messages, 100):
        try:
            r = requests.post('https://exp.host/--/api/v2/push/send', json=batch, timeout=30)
            if r.headers.get('content-type','').startswith('application/json'):
                results.append(r.json())
            else:
                results.append({'status_code': r.status_code, 'text': r.text})
        except Exception as e:
            results.append({'error': str(e)})
    return results

@api.post('/notifications/register')
async def register_push_token(payload: PushTokenRegister):
    doc: Dict[str, Any] = {
        'token': payload.token,
        'platform': payload.platform,
        'city': payload.city,
        'device_info': payload.device_info,
        'last_seen': datetime.utcnow()
    }
    if payload.user_id:
        try:
            uid = ObjectId(payload.user_id)
            user = await db.users.find_one({'_id': uid})
            if user:
                doc['user_id'] = uid
                doc['preferred_lang'] = user.get('preferred_lang')
                doc['is_premium'] = await _is_user_premium(uid)
        except Exception:
            pass
    await db.push_tokens.update_one({'token': payload.token}, {'$set': doc}, upsert=True)
    return {'status': 'ok'}

@api.post('/notifications/unregister')
async def unregister_push_token(token: str):
    await db.push_tokens.delete_one({'token': token})
    return {'status': 'ok'}

@api.post('/notifications/send')
async def send_push(payload: PushSendInput):
    query: Dict[str, Any] = {}
    if payload.city:
        query['city'] = payload.city
    if payload.lang:
        query['preferred_lang'] = payload.lang
    if payload.premium_only:
        query['is_premium'] = True
    tokens = [pt['token'] async for pt in db.push_tokens.find(query, {'token': 1})]
    results = await _send_expo_push(tokens, {'title': payload.title, 'body': payload.body, 'data': payload.data})
    return {'count': len(tokens), 'results': results}

# ---------- INCLUDE ROUTER ----------
app.include_router(api)

@app.on_event("startup")
async def on_startup():
    await ensure_indexes()
    try:
        paths = [r.path for r in app.router.routes]
        logger.info(f"Registered routes: {paths}")
    except Exception:
        pass

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()