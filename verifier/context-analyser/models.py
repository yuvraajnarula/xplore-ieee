from pydantic import BaseModel
from typing import Dict, Optional


class VerificationRequest(BaseModel):
    id : str 
    device_info: Optional[Dict[str, str]] = None
    location: Optional[str] = None
    timestamp: Optional[str] = None
    quantum_state_id: Optional[str] = None
    
class VerificationResponse(BaseModel):
    verifed : bool 
    trust_score  : int 
    reason : Optional[str] = None