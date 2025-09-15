from fastapi import FastAPI
from .api import router as context_router
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response

app = FastAPI()

app.include_router(context_router, prefix="/context-analyzer", tags=["context-analyzer"])

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
