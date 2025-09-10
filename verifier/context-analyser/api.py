from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import schemas, crud, core
from session import get_db
router = APIRouter()

@router.post("/verify", response_model=schemas.VerificationResponse)
def verify_identity(request: schemas.VerificationRequest, db: Session = Depends(get_db)):
    verified, trust_score, reason = core.analyze_context(request)
    crud.create_log(db, request, verified, trust_score, reason)
    return schemas.VerificationResponse(verified=verified, trust_score=trust_score, reason=reason)
