from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional
from datetime import datetime
import enum
from sqlalchemy.sql import func

class TimelockStatus(str, enum.Enum):
    PENDING = "pending"
    EXECUTING = "executing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

class TimeLock(SQLModel, table=True):
    __tablename__ = "timelocks"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner: str  # user or service id that created the timelock
    payload: str  # opaque JSON string / or encrypted blob
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    unlock_at: datetime = Field(sa_column_kwargs={"index": True})
    status: TimelockStatus = Field(default=TimelockStatus.PENDING)
    attempts: int = 0
    last_error: Optional[str] = None
    on_chain: bool = False
    on_chain_tx: Optional[str] = None
    idempotency_key: Optional[str] = Field(default=None, index=True)  # to ensure dedupe

# Helper to create engine (non-async for simple worker and migrations)
def get_engine(sync_url: str):
    from sqlalchemy.engine import Engine
    return create_engine(sync_url, pool_pre_ping=True)

def create_tables(sync_url: str):
    engine = get_engine(sync_url)
    SQLModel.metadata.create_all(engine)
