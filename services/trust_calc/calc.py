"""
Trust Calculator service (FastAPI) + Blockchain Oracle.

Endpoints:
- POST /compute-trust         -> Compute and persist trust score for an identity (pushes on-chain).
- GET  /trust/{identity_id}   -> Retrieve current trust score for identity (reads from chain).
- GET  /rank                  -> Return ranking of identities by trust (local cache ranking).
- POST /bulk-update           -> Accept array of measurement events to update many identities.
"""

from __future__ import annotations
import os, time
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional

from core.identity_core.dynamic_trust import DynamicTrustEngine

from blockchain.web3.trust_fabric_cli import TrustFabricClient
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST
from monitoring.ml import ml_detector
# Prometheus metrics
TRUST_UPDATES = Counter("trust_updates_total", "Total number of trust score updates")
LOW_TRUST_ALERTS = Gauge("low_trust_alerts", "Current number of low-trust identities")

app = FastAPI(title="Trust Calculator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = TrustFabricClient(
    rpc_url=os.getenv("ETH_RPC_URL"),
    private_key=os.getenv("ORACLE_PRIVATE_KEY"),
    contract_addr=os.getenv("TRUSTFABRIC_CONTRACT"),
    abi_path="blockchain/contracts/abis/TrustFabric.json"
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
    tx_hash: Optional[str] = None

class BulkUpdateItem(BaseModel):
    identity_id: str
    agreement_rate: float
    biometric_fidelity: float
    witness_score: float

_last_updated: Dict[str, float] = {}
engine = DynamicTrustEngine(decay=0.9)

from .repo import TrustRepo

DB_URL = os.getenv("DATABASE_URL")
trust_repo = TrustRepo(DB_URL)

def push_trust_on_chain(identity_id: str, score: float, entropy: float) -> Optional[str]:
    try:
        tx_hash = client.publish_trust(identity_id, score, entropy)
        print(f"Pushed trust for {identity_id} (tx={tx_hash})")
        return tx_hash
    except Exception as e:
        print(f"Failed on-chain push for {identity_id}")
        return None


@app.post("/compute-trust", response_model=TrustRes)
def compute(req: TrustReq):
    try:
        new_score, entropy = engine.update_trust(
            req.identity_id, req.agreement_rate, req.biometric_fidelity, req.witness_score
        )
        _last_updated[req.identity_id] = time.time()

        # Update Prometheus metrics
        TRUST_UPDATES.inc()
        if new_score < 0.5:
            LOW_TRUST_ALERTS.inc()

        # Update ML detector
        ml_detector.add_record(req.identity_id, new_score, entropy)

        # Push to blockchain
        tx_hash = push_trust_on_chain(req.identity_id, new_score, entropy)
        if tx_hash:
            print("On-chain tx hash:", tx_hash)

        return TrustRes(
            identity_id=req.identity_id,
            trust_score=float(new_score),
            entropy=float(entropy),
            updated_at=_last_updated[req.identity_id],
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/trust/{identity_id}", response_model=TrustRes)
def fetch_trust(identity_id: str):
    try:
        # Always resolve from chain (source of truth)
        trust_data = client.fetch_trust(identity_id)
        if not trust_data:
            raise HTTPException(status_code=404, detail="identity not found")

        score, entropy, updated_at = trust_data
        return TrustRes(
            identity_id=identity_id,
            trust_score=float(score),
            entropy=float(entropy),
            updated_at=updated_at,
        )
    except Exception as exc:
        print("Fetch trust failed")
        raise HTTPException(status_code=500, detail=str(exc))


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

            # Update Prometheus metrics
            TRUST_UPDATES.inc()
            if score < 0.5:
                LOW_TRUST_ALERTS.inc()

            # Update ML detector
            ml_detector.add_record(it.identity_id, score, entropy)

            # Push to blockchain
            tx_hash = push_trust_on_chain(it.identity_id, score, entropy)

            results.append({
                "identity_id": it.identity_id,
                "trust_score": float(score),
                "entropy": float(entropy),
                "tx_hash": tx_hash,
            })
        except Exception as exc:
            results.append({"identity_id": it.identity_id, "error": str(exc)})
    return {"results": results}

@app.get("/metrics")
def metrics():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)
