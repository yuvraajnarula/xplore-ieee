from .models import VerificationRequest

def analyze_context(request: VerificationRequest):
    """
    Dummy logic:
    - If device_info has 'trusted_device'==True, trust is high
    - Else, trust is low
    """
    trusted = False
    reason = "Unknown device"

    device_info = request.device_info or {}
    if device_info.get("trusted_device") == "true":
        trusted = True
        trust_score = 0.95
        reason = "Trusted device detected"
    else:
        trust_score = 0.25

    return trusted, trust_score, reason

from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
