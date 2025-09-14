from sqlmodel import Session, select
from .models import TimeLock, TimelockStatus, get_engine
from typing import Optional
import json
from datetime import datetime

class TimelockRepo:
    def __init__(self, sync_db_url: str):
        self.engine = get_engine(sync_db_url)

    def create(self, *, owner: str, payload: dict, unlock_at: datetime, on_chain: bool=False, idempotency_key: Optional[str]=None) -> TimeLock:
        with Session(self.engine) as session:
            # dedupe with idempotency
            if idempotency_key:
                existing = session.exec(select(TimeLock).where(TimeLock.idempotency_key == idempotency_key)).first()
                if existing:
                    return existing
            tl = TimeLock(
                owner=owner,
                payload=json.dumps(payload),
                unlock_at=unlock_at,
                on_chain=on_chain,
                idempotency_key=idempotency_key
            )
            session.add(tl)
            session.commit()
            session.refresh(tl)
            return tl

    def get(self, id: int) -> Optional[TimeLock]:
        with Session(self.engine) as session:
            return session.get(TimeLock, id)

    def list_pending(self, limit: int=100):
        with Session(self.engine) as session:
            return session.exec(select(TimeLock).where(TimeLock.status == TimelockStatus.PENDING).limit(limit)).all()

    def mark_executing(self, id: int):
        with Session(self.engine) as session:
            tl = session.get(TimeLock, id)
            if not tl:
                return None
            tl.status = TimelockStatus.EXECUTING
            tl.attempts += 1
            session.add(tl)
            session.commit()
            session.refresh(tl)
            return tl

    def mark_completed(self, id: int, on_chain_tx: Optional[str]=None):
        with Session(self.engine) as session:
            tl = session.get(TimeLock, id)
            tl.status = TimelockStatus.COMPLETED
            if on_chain_tx:
                tl.on_chain_tx = on_chain_tx
            session.add(tl)
            session.commit()
            session.refresh(tl)
            return tl

    def mark_failed(self, id: int, error: str):
        with Session(self.engine) as session:
            tl = session.get(TimeLock, id)
            tl.status = TimelockStatus.FAILED
            tl.last_error = error[:2000]
            session.add(tl)
            session.commit()
            session.refresh(tl)
            return tl

    def cancel(self, id: int):
        with Session(self.engine) as session:
            tl = session.get(TimeLock, id)
            if not tl:
                return None
            tl.status = TimelockStatus.CANCELLED
            session.add(tl)
            session.commit()
            session.refresh(tl)
            return tl