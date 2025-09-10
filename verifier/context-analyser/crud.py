from sqlalchemy.orm import Session 
from . import db,models

def create_log(db: Session, log: models.VerificationRequest, verified: bool, trust_score: float, reason: str = None):
    db_log = db.VerificationLog(
        identity_id=log.identity_id,
        verified=int(verified),
        trust_score=trust_score,
        reason=reason,
        device_info=log.device_info,
        location=log.location,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log