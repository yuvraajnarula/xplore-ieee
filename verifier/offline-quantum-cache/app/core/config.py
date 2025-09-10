from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_URL : str 
    key : str 
    access_token_expire : int = 60 

    class Config :
        env_file = ".env"
        
        
settings = Settings()