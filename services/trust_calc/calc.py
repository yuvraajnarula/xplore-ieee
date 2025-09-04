"""
Trust Calculator service (FastAPI).

Endpoints:
- POST /compute-trust         -> Compute and persist trust score for an identity.
- GET  /trust/{identity_id}   -> Retrieve current trust score for identity.
- GET  /rank                  -> Return ranking of identities by trust.
- POST /bulk-update           -> Accept array of measurement events to update many identities.
"""

from __future__ import annotations
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import time
from core.identity_core.dynamic_trust import DynamicTrustEngine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title='trust calc')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TrustReq(BaseModel):
    identity_id: str = Field(..., example="alice")
    agreement_rate: float = Field(..., ge=0.0, le=1.0, example=0.98)
    biometric_fidelity: float = Field(..., ge=0.0, le=1.0, example=0.997)
    witness_score: float = Field(..., ge=0.0, le=1.0, example=0.95)
    

class TrustRes(BaseModel):
    identity_id: str
    trust_score: float
    entropy: float
    updated_at: float
    
class BulkUpdateItem(BaseModel):
    identity_id: str
    agreement_rate: float
    biometric_fidelity: float
    witness_score: float

_last_updated: Dict[str, float] = {}

engine = DynamicTrustEngine(decay=0.9)

@app.post('/compute-trust', response_model=TrustRes)
def compute(req: TrustReq):
    try:
        new_score, entropy = engine.update_trust(
            req.identity_id, req.agreement_rate, req.biometric_fidelity, req.witness_score
        )
        _last_updated[req.identity_id] = time.time()
        return TrustRes(
            identity_id=req.identity_id,
            trust_score=float(new_score),
            entropy=float(entropy),
            updated_at=_last_updated[req.identity_id]
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.get('/trust/{identity_id}', response_model=TrustRes)
def fetch_trust(identity_id: str):
    score = engine.get_trust(identity_id)
    if score == 0.0:
        raise HTTPException(status_code=404, detail="identity not found")
    ts = _last_updated.get(identity_id, time.time())
    # recompute entropy for current values if needed (or store separately)
    entropy = 0.0  # placeholder if you don’t store per-id entropy
    return TrustRes(identity_id=identity_id, trust_score=float(score), entropy=float(entropy), updated_at=ts)


@app.get("/rank")
def rank(top: Optional[int] = None):
    ranked = engine.rank_identities()
    if top is not None:
        ranked = ranked[:int(top)]
    return {"total": len(ranked), "rank": [{"identity_id": k, "trust_score": v} for k, v in ranked]}

@app.post("/bulk-update")
def bulk_update(items: List[BulkUpdateItem]):
    results = []
    for it in items:
        try:
            score, entropy = engine.update_trust(
                it.identity_id, it.agreement_rate, it.biometric_fidelity, it.witness_score
            )
            _last_updated[it.identity_id] = time.time()
            results.append({
                "identity_id": it.identity_id,
                "trust_score": float(score),
                "entropy": float(entropy)
            })
        except Exception as exc:
            results.append({"identity_id": it.identity_id, "error": str(exc)})
    return {"results": results}
