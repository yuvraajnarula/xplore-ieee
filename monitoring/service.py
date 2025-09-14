from fastapi import FastAPI
from fastapi.responses import Response
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST
from typing import List, Dict
import statistics
import time
import numpy as np
from sklearn.ensemble import IsolationForest

# --- In-memory state / ephemeral ---
from core.identity_core.dynamic_trust import DynamicTrustEngine
from core.quantum_engine.temporal_locks import TemporalLockManager

# Optional audit repository
from services.trust_calc.repo import TrustRepo
import os

app = FastAPI(title="Monitoring + ML Threat Detection")

# --- Shared instances ---
engine = DynamicTrustEngine(decay=0.9)
temporal_manager = TemporalLockManager()
DB_URL = os.getenv("DATABASE_URL")
trust_repo = TrustRepo(DB_URL)

# --- Prometheus metrics ---
TRUST_UPDATES = Counter("trust_updates_total", "Total number of trust score updates")
LOW_TRUST_ALERTS = Gauge("low_trust_alerts", "Current number of low-trust identities")
LOCKED_SHARDS = Gauge("locked_shards", "Number of locked quantum shards")
UNLOCKED_SHARDS = Gauge("unlocked_shards", "Number of unlocked quantum shards")
ML_ANOMALIES = Gauge("ml_anomalies_total", "Current number of ML-detected anomalies")

# --- ML Threat Detector ---
class TrustAnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05)
        self.history: List[Dict] = []

    def add_record(self, identity_id: str, trust_score: float, entropy: float):
        self.history.append({"id": identity_id, "score": trust_score, "entropy": entropy})
        if len(self.history) > 1000:
            self.history.pop(0)

    def detect_anomalies(self) -> List[Dict]:
        if len(self.history) < 10:
            return []
        X = np.array([[r["score"], r["entropy"]] for r in self.history])
        self.model.fit(X)
        preds = self.model.predict(X)
        anomalies = [
            {"identity_id": r["id"], "score": r["score"], "entropy": r["entropy"]}
            for r, p in zip(self.history, preds) if p == -1
        ]
        ML_ANOMALIES.set(len(anomalies))
        return anomalies

ml_detector = TrustAnomalyDetector()

# --- Quantum Metrics ---
@app.get("/quantum-metrics")
def quantum_metrics():
    total_shards = 100
    unlocked = temporal_manager.unlocked_shards(total_shards, None)
    locked = total_shards - len(unlocked)

    LOCKED_SHARDS.set(locked)
    UNLOCKED_SHARDS.set(len(unlocked))

    return {"total_shards": total_shards, "locked_shards": locked, "unlocked_shards": len(unlocked)}


# --- Trust Analytics ---
@app.get("/trust-analytics")
def trust_analytics(top: int = 10):
    all_scores = engine.rank_identities()
    TRUST_UPDATES.inc(len(all_scores))

    if not all_scores:
        return {"summary": {}, "top": [], "bottom": []}

    scores = [score for _, score in all_scores]
    summary = {
        "mean": statistics.mean(scores),
        "median": statistics.median(scores),
        "variance": statistics.variance(scores) if len(scores) > 1 else 0.0,
        "total_identities": len(scores),
    }

    top_identities = [{"identity_id": k, "trust_score": v} for k, v in all_scores[:top]]
    bottom_identities = [{"identity_id": k, "trust_score": v} for k, v in all_scores[-top:]]

    low_alerts = sum(1 for s in scores if s < 0.5)
    LOW_TRUST_ALERTS.set(low_alerts)

    # Update ML detector
    for identity, score in all_scores:
        ml_detector.add_record(identity, score, 0.0)  # entropy optional

    return {"summary": summary, "top": top_identities, "bottom": bottom_identities}


# --- ML Threat Detection Endpoint ---
@app.get("/ml-threats")
def ml_threats():
    anomalies = ml_detector.detect_anomalies()
    return {"total_anomalies": len(anomalies), "anomalies": anomalies}


@app.get("/audit/{identity_id}")
def audit(identity_id: str):
    history = trust_repo.fetch_history(identity_id)
    return {"identity_id": identity_id, "history": history}


@app.get("/metrics")
def metrics():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)
