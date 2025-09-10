from fastapi import FastAPI
from app.api.routes import snapshots

app = FastAPI(title="Offline Quantum Cache")

app.include_router(snapshots.router, prefix="/snapshots", tags=["snapshots"])

@app.get("/")
def read_root():
    return {"msg": "Offline Quantum Cache Service is running"}

@app.get("/health")
def health():
    return {"health": "ok"}
