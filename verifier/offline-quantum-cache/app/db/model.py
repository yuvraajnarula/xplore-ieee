from sqlalchemy import Column, Integer, String, DateTime, LargeBinary 
from sqlalchemy.sql import func 
from app.db.base import Base 

class QuantumSnapshotModel(Base):
    _tablename_ = "quantumsnapshots"
    id = Column(Integer, primary_key=True, index=True)
    snapshot_id = Column(String, unique=True, index=True, nullable=False)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
