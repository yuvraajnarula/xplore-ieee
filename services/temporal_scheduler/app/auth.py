from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .config import settings
from jose import jwt, JWTError
from pydantic import BaseModel
from datetime import datetime, timedelta

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class TokenData(BaseModel):
    sub: str

def create_access_token(subject: str, expires_delta: timedelta = None):
    payload = {"sub": subject}
    if expires_delta:
        payload.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return TokenData(sub=sub)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
