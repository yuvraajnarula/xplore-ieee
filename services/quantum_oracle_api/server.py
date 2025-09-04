"""
Quantum Oracle API (FastAPI mock)

Endpoints:
- GET  /random-bits?n=128             -> return cryptographically-random bits (hex/base64)
- POST /create-offer                  -> create entanglement offer metadata
- GET  /offer/{offer_id}              -> get offer metadata (if not expired)
- GET  /offers                        -> list persisted offers (pagination)
- POST /fidelity-check                -> compute fidelity between two numeric vectors (uses biometric_quantum if available)
- POST /issue-nonce                   -> issue a nonce (ttl)
- POST /verify-nonce                  -> verify a nonce
"""

from __future__ import annotations
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Tuple
import time
import secrets
from core.identity_core.holographic_identity import HolographicIdentity
from core.quantum_engine.biometric_quantum import BiometricEncoder, fidelity
import numpy as np
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Quantum Oracle API (mock)", version="0.1")


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Offer(BaseModel):
    offer_id: str
    shard_indices: Tuple[int, ...]
    kind: str = Field("ghz", pattern="^(ghz|bell)$")
    expected_qubits: int
    created_at: float
    ttl_seconds: int = 30
    verification_hint: Optional[Dict] = None


_OFFERS: Dict[str, Offer] = {}
_LEDGER: List[Offer] = {}
_NONCES: Dict[str, float] = {}


# --- Request/response models --- #
class CreateOfferRequest(BaseModel):
    shard_indices: List[int] = Field(..., min_items=2, example=[0,1,2])
    kind: str = Field("ghz", pattern="^(ghz|bell)$")
    ttl_seconds: int = Field(30, ge=1)


class CreateOfferResponse(BaseModel):
    offer_id: str
    created_at: float
    ttl_seconds: int


class RandomBitsResponse(BaseModel):
    n_bits: int
    hex: str


class FidelityRequest(BaseModel):
    a: List[float]
    b: List[float]


class FidelityResponse(BaseModel):
    fidelity: float
    method: str


class NonceRequest(BaseModel):
    ttl_seconds: int = Field(60, ge=1)


class VerifyNonceRequest(BaseModel):
    nonce: str

def _now() -> float:
    return time.time()


def _expire_offer(offer: Offer) -> bool:
    return (_now() - offer.created_at) > offer.ttl_seconds

@app.get("/random-bits", response_model=RandomBitsResponse)
def random_bits(n: int = Query(128, ge=1, le=65536)):
    # Use secrets to produce cryptographically secure bits, present as hex string
    n_bytes = (n + 7) // 8
    raw = secrets.token_bytes(n_bytes)
    hexstr = raw.hex()
    return RandomBitsResponse(n_bits=n, hex=hexstr)


@app.post("/create-offer", response_model=CreateOfferResponse)
def create_offer(req: CreateOfferRequest):
    offer_id = secrets.token_hex(12)
    offer = Offer(
        offer_id=offer_id,
        shard_indices=tuple(req.shard_indices),
        kind=req.kind,
        expected_qubits=len(req.shard_indices),
        created_at=_now(),
        ttl_seconds=req.ttl_seconds,
        verification_hint=None,
    )
    _OFFERS[offer_id] = offer
    # append to ledger (persist in-memory)
    _LEDGER.setdefault("offers", []).append(offer)
    print("Created offer %s", offer_id)
    return CreateOfferResponse(offer_id=offer_id, created_at=offer.created_at, ttl_seconds=offer.ttl_seconds)


@app.get("/offer/{offer_id}", response_model=Offer)
def get_offer(offer_id: str):
    offer = _OFFERS.get(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="offer not found")
    if _expire_offer(offer):
        _OFFERS.pop(offer_id, None)
        raise HTTPException(status_code=410, detail="offer expired")
    return offer


@app.get("/offers")
def list_offers(page: int = 1, page_size: int = 20):
    ledger = _LEDGER.get("offers", [])
    total = len(ledger)
    page = max(1, int(page))
    start = (page - 1) * page_size
    end = start + page_size
    items = ledger[start:end]
    return {"page": page, "page_size": page_size, "total": total, "offers": [i.dict() for i in items]}


@app.post("/fidelity-check", response_model=FidelityResponse)
def fidelity_check(req: FidelityRequest):
    a = np.array(req.a, dtype=float)
    b = np.array(req.b, dtype=float)
    if a.size == 0 or b.size == 0:
        raise HTTPException(status_code=400, detail="empty vectors")

    # If BiometricQuantumEncoder & fidelity are available, use that
    if BiometricEncoder is not None and fidelity is not None:
        # choose number of qubits to fit both vectors
        max_dim = max(a.size, b.size)
        num_qubits = int(np.ceil(np.log2(max_dim)))
        # guard: limit qubits to reasonable number (e.g., <= 10)
        num_qubits = min(max(num_qubits, 1), 10)
        try:
            enc = BiometricEncoder(num_qubits=num_qubits)
            sa, _ = enc.encode(a.tolist())
            sb, _ = enc.encode(b.tolist())
            fid = fidelity(sa, sb)
            return FidelityResponse(fidelity=float(fid), method="quantum-encoder")
        except Exception as exc:
            print("quantum encoder fidelity failed: %s", exc)

    # Fallback: cosine similarity squared (proxy for fidelity)
    dot = float(np.dot(a, b))
    na = float(np.linalg.norm(a))
    nb = float(np.linalg.norm(b))
    if na == 0 or nb == 0:
        raise HTTPException(status_code=400, detail="zero-vector encountered")
    cos_sim = dot / (na * nb)
    proxy_fid = float(max(min(cos_sim, 1.0), -1.0)) ** 2
    return FidelityResponse(fidelity=proxy_fid, method="cosine-proxy")


@app.post("/issue-nonce")
def issue_nonce(req: NonceRequest):
    n = secrets.token_hex(16)
    _NONCES[n] = _now() + req.ttl_seconds
    return {"nonce": n, "expires_at": _NONCES[n]}


@app.post("/verify-nonce")
def verify_nonce(req: VerifyNonceRequest):
    exp = _NONCES.get(req.nonce)
    if exp is None:
        return {"valid": False, "reason": "not_found"}
    if _now() > exp:
        _NONCES.pop(req.nonce, None)
        return {"valid": False, "reason": "expired"}
    # consume
    _NONCES.pop(req.nonce, None)
    return {"valid": True}