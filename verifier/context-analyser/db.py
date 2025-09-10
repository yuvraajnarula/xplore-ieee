from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class VerificationLogs(Base):
    __tablename__ = "verification_logs"
    id = Column(Integer, primary_key=True, index=True)
    identity_id = Column(String, index=True)
    verified = Column(Integer)  # 0 or 1
    trust_score = Column(Float)
    reason = Column(String, nullable=True)
    device_info = Column(JSON, nullable=True)
    location = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

