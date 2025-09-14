from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class TimelockCreate(BaseModel):
    owner: str
    payload: dict  # will be stored as JSON string
    unlock_at: datetime
    on_chain: bool = False
    idempotency_key: Optional[str] = None

class TimelockResponse(BaseModel):
    id: int
    owner: str
    payload: dict
    unlock_at: datetime
    status: str
    attempts: int
    on_chain: bool
    on_chain_tx: Optional[str]
