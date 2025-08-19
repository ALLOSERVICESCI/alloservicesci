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
app = FastAPI(title="Allô Services CI API", version="0.4.0")
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

# ---------- MODELS (existing omitted for brevity in this snippet) ----------
# ... (keep all previous models)

# New models: Push notifications
class PushTokenRegister(BaseModel):
    token: str
    user_id: Optional[str] = None
    platform: Optional[str] = None  # ios | android | web
    city: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None

class PushSendInput(BaseModel):
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None
    city: Optional[str] = None  # optional filter

# ---------- PREMIUM GUARD, INDEXES & SEED (keep existing) ----------
# ... (keep existing functions ensure_indexes and seed_data)
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

# ---------- ROUTES (existing ones stay unchanged) ----------
# ... (keep existing routes)

# ---- PUSH NOTIFICATIONS ----

def _chunk_list(items: List[str], size: int = 100) -> List[List[str]]:
    return [items[i:i+size] for i in range(0, len(items), size)]

async def _send_expo_push(tokens: List[str], payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not tokens:
        return []
    messages = []
    for t in tokens:
        messages.append({
            'to': t,
            'sound': 'default',
            'title': payload.get('title'),
            'body': payload.get('body'),
            'data': payload.get('data') or {}
        })
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
            doc['user_id'] = ObjectId(payload.user_id)
        except Exception:
            pass
    # upsert by token
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
    tokens = [pt['token'] async for pt in db.push_tokens.find(query, {'token': 1})]
    results = await _send_expo_push(tokens, {'title': payload.title, 'body': payload.body, 'data': payload.data})
    return {'count': len(tokens), 'results': results}

# Hook: broadcast basic alert notification (city-targeted if available)
# Modify existing create_alert to send push after saving

# We re-define create_alert here to append push logic; ensure only one definition exists.
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

    # Push notify (limit broadcast size in this MVP)
    try:
        query: Dict[str, Any] = {}
        if payload.city:
            query['city'] = payload.city
        tokens = [pt['token'] async for pt in db.push_tokens.find(query, {'token': 1}).limit(500)]
        await _send_expo_push(tokens, {
            'title': f"Alerte: {payload.type}",
            'body': payload.title,
            'data': {'alert_id': saved['id'], 'city': payload.city or ''}
        })
    except Exception as e:
        logger.warning(f"Push broadcast failed: {e}")

    return saved

# Keep the rest of routes and lifecycle handlers
@app.on_event("startup")
async def on_startup():
    await ensure_indexes()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()