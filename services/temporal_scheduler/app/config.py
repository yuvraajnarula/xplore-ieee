from pydantic import BaseSettings, AnyUrl
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    WEB3_PROVIDER_URL: Optional[AnyUrl] = None
    CONTRACT_ADDRESS: Optional[str] = None
    WORKER_CONCURRENCY: int = 2

    class Config:
        env_file = ".env"

settings = Settings()
