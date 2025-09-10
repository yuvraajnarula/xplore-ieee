from fastapi import FastAPI
from api import router as context_router

app = FastAPI()

app.include_router(context_router, prefix="/context-analyzer", tags=["context-analyzer"])
