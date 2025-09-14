from sklearn.ensemble import IsolationForest
import numpy as np
from typing import List, Dict
from prometheus_client import Gauge

ML_ANOMALIES = Gauge("ml_anomalies_total", "Current number of ML-detected anomalies")

class TrustAnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05)
        self.history: List[Dict] = []

    def add_record(self, identity_id: str, trust_score: float, entropy: float = 0.0):
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

# Shared instance
ml_detector = TrustAnomalyDetector()