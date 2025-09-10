from pydantic import BaseModel
from datetime import datetime

class QuantumSnapshotBase(BaseModel):
    snapshot_id: str

class QuantumSnapshotCreate(QuantumSnapshotBase):
    data: bytes

class QuantumSnapshot(QuantumSnapshotBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True