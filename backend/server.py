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
app = FastAPI(title="Allô Services CI API", version="0.7.2")
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

# ---------- ALERTS: basic CRUD + unread count + read mark ----------
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

class MarkReadInput(BaseModel):
    user_id: str

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
    Policy: count alerts with status in ['new','unread'] and NOT read by this user (read_by doesn't contain user_id).
    If user_id not provided or invalid, returns total of 'new'/'unread' alerts.
    """
    criteria: Dict[str, Any] = { 'status': { '$in': ['new', 'unread'] } }
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
    temperature: Optional[float] = TEMPERATURE_DEFAULT
    max_tokens: Optional[int] = MAX_TOKENS_DEFAULT

LAYAH_SYSTEM_PROMPT = (
    "Assistant IA — Allô Services CI (Périmètre strict : Côte d'Ivoire)\n\n"
    "RÔLE & MISSION\nTu es l'assistant IA de l'application 'Allô Services CI'. Ton unique mission est d'aider les utilisateurs sur des sujets liés à la Côte d'Ivoire (CI) et de générer des documents conformes au contexte ivoirien.\n\n"
    "PÉRIMÈTRE GÉOGRAPHIQUE\n- Tu ne traites QUE des informations concernant la Côte d'Ivoire.\n- Si la demande ne concerne pas la CI, refuse poliment et invite à reformuler en contexte ivoirien.\n\n"
    "LANGUE & TON\n- Langue : Français (comprends le nouchi et normalise en français clair).\n- Ton : professionnel, respectueux, concis et actionnable.\n\n"
    "FONCTIONS\n1) Réponses et conseils pratiques 100% CI.\n2) Génération de documents 100% CI (CV ATS, lettres, ordres de mission, attestations, etc.) sans inventer d'informations.\n3) Reformulation/synthèse/structuration.\n\n"
    "FORMATAGE LOCAL\nTéléphone '+225 xx xx xx xx', dates FR, FCFA, adresses 'Quartier – Commune – Ville, Côte d'Ivoire'.\n\n"
    "SÉCURITÉ CONTENUS\nRefuse injures/violence/incitation. En cas d'urgence: orienter vers services locaux.\n\n"
    "DONNÉES & SOURCES\nUtilise le contexte fourni (CI uniquement). Si incertitude: demande des précisions ou oriente. Ne pas halluciner.\n\n"
    "PROCESSUS\n1) Vérifie le contexte CI. 2) Contrôle sûreté. 3) Si document: vérifier champs minimaux, demander manquants, formats locaux, ne pas inventer. 4) Si info: CI uniquement; si incertain: le dire + prochaine étape. 5) Re-scanne: aucune mention hors CI, pas d'insulte/violence, formats locaux."
)

# Emergent client (lazy import to avoid hard fail if key missing)
_llm_chat_client = None

def get_llm_chat_client():
    global _llm_chat_client
    if _llm_chat_client is None:
        if not EMERGENT_API_KEY:
            raise HTTPException(status_code=500, detail="EMERGENT_API_KEY not configured")
        try:
            # Use Emergent Integrations LlmChat client
            from emergentintegrations.llm.chat import LlmChat
            _llm_chat_client = LlmChat(
                api_key=EMERGENT_API_KEY,
                session_id="allo-services-ci",
                system_message=LAYAH_SYSTEM_PROMPT
            )
        except Exception as e:
            logger.exception("Failed to init Emergent LlmChat client")
            raise HTTPException(status_code=500, detail=f"Emergent client init failed: {e}")
    return _llm_chat_client

async def stream_chat(messages: List[Dict[str,str]], temperature: float, max_tokens: int) -> AsyncGenerator[str, None]:
    # Initialize client to ensure it's available
    get_llm_chat_client()
    
    try:
        # Use litellm directly for streaming since LlmChat doesn't expose streaming
        import litellm
        
        # Prepare parameters for Emergent proxy
        params = {
            "model": OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
            "api_key": EMERGENT_API_KEY,
        }
        
        # Configure for Emergent proxy
        if EMERGENT_API_KEY.startswith("sk-emergent-"):
            proxy_url = os.environ.get("INTEGRATION_PROXY_URL", "https://integrations.emergentagent.com")
            params["api_base"] = proxy_url + "/llm"
            params["custom_llm_provider"] = "openai"
        
        stream = litellm.completion(**params)
        
        for chunk in stream:
            try:
                if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                    choice = chunk.choices[0]
                    delta = getattr(choice, 'delta', None)
                    if delta and hasattr(delta, 'content') and delta.content:
                        yield f"data: {json.dumps({'content': delta.content})}\n\n"
            except Exception:
                continue
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

async def complete_chat(messages: List[Dict[str,str]], temperature: float, max_tokens: int) -> Dict[str, Any]:
    # Initialize client to ensure it's available
    get_llm_chat_client()
    
    try:
        # Use litellm directly for non-streaming
        import litellm
        
        # Prepare parameters for Emergent proxy
        params = {
            "model": OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
            "api_key": EMERGENT_API_KEY,
        }
        
        # Configure for Emergent proxy
        if EMERGENT_API_KEY.startswith("sk-emergent-"):
            proxy_url = os.environ.get("INTEGRATION_PROXY_URL", "https://integrations.emergentagent.com")
            params["api_base"] = proxy_url + "/llm"
            params["custom_llm_provider"] = "openai"
        
        response = litellm.completion(**params)
        
        return {
            "content": response.choices[0].message.content,
            "finish_reason": response.choices[0].finish_reason,
            "usage": getattr(response, 'usage', None) and {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat completion failed: {str(e)}")

@api.post('/ai/chat')
async def ai_chat(req: ChatRequest):
    if not req.messages or not isinstance(req.messages, list):
        raise HTTPException(status_code=422, detail="messages required")
    # prepend system prompt
    msgs = [{"role": "system", "content": LAYAH_SYSTEM_PROMPT}] + [m.model_dump() for m in req.messages]
    if req.stream:
        return StreamingResponse(stream_chat(msgs, req.temperature or TEMPERATURE_DEFAULT, req.max_tokens or MAX_TOKENS_DEFAULT), media_type='text/event-stream')
    else:
        return await complete_chat(msgs, req.temperature or TEMPERATURE_DEFAULT, req.max_tokens or MAX_TOKENS_DEFAULT)

# Mount router
app.include_router(api)

# Startup hooks
@app.on_event('startup')
async def on_startup():
  try:
    await ensure_indexes()
  except Exception:
    logger.exception('Index init failed')