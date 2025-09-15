from fastapi import FastAPI
from .api.routes import snapshot as snapshots
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response

app = FastAPI(title="Offline Quantum Cache")

app.include_router(snapshots.router, prefix="/snapshots", tags=["snapshots"])

@app.get("/")
def read_root():
    return {"msg": "Offline Quantum Cache Service is running"}

@app.get("/health")
def health():
    return {"health": "ok"}

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
