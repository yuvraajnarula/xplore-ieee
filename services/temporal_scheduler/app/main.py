from fastapi import FastAPI, HTTPException, Depends, status
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
from .config import settings
from .schemas import TimelockCreate, TimelockResponse
from .crud import TimelockRepo
from .queues import schedule_execution
from .auth import get_current_admin, create_access_token
from datetime import datetime, timezone
import json
from fastapi.responses import JSONResponse
import uvicorn
import logging

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="Temporal Scheduler")

repo = TimelockRepo(sync_db_url=settings.DATABASE_URL)

@app.on_event("startup")
def startup():
    # quick table creation if needed (dev only) — use Alembic in prod
    from .models import create_tables
    create_tables(settings.DATABASE_URL)

@app.post("/admin/token")
def admin_token():
    # very minimal — in prod validate a username/password or OAuth
    token = create_access_token("admin", expires_delta=None)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/timelocks", response_model=TimelockResponse, status_code=201)
def create_timelock(payload: TimelockCreate, admin=Depends(get_current_admin)):
    # basic validation
    if payload.unlock_at.tzinfo is None:
        # force UTC for consistency
        unlock_at = payload.unlock_at.replace(tzinfo=timezone.utc)
    else:
        unlock_at = payload.unlock_at.astimezone(timezone.utc)

    tl = repo.create(
        owner=payload.owner,
        payload=payload.payload,
        unlock_at=unlock_at,
        on_chain=payload.on_chain,
        idempotency_key=payload.idempotency_key
    )
    # schedule execution
    schedule_execution("app.worker.execute_timelock_job", tl.id, unlock_at)
    # Return response
    return TimelockResponse(
        id=tl.id,
        owner=tl.owner,
        payload=json.loads(tl.payload),
        unlock_at=tl.unlock_at,
        status=tl.status,
        attempts=tl.attempts,
        on_chain=tl.on_chain,
        on_chain_tx=tl.on_chain_tx
    )

@app.get("/timelocks/{id}", response_model=TimelockResponse)
def get_timelock(id: int, admin=Depends(get_current_admin)):
    tl = repo.get(id)
    if not tl:
        raise HTTPException(status_code=404, detail="Not found")
    return TimelockResponse(
        id=tl.id,
        owner=tl.owner,
        payload=json.loads(tl.payload),
        unlock_at=tl.unlock_at,
        status=tl.status,
        attempts=tl.attempts,
        on_chain=tl.on_chain,
        on_chain_tx=tl.on_chain_tx
    )

@app.post("/timelocks/{id}/cancel")
def cancel_timelock(id: int, admin=Depends(get_current_admin)):
    tl = repo.cancel(id)
    if not tl:
        raise HTTPException(status_code=404, detail="Not found")
    return JSONResponse({"status": "cancelled"})

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.APP_HOST, port=settings.APP_PORT, reload=False)

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
