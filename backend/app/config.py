from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Still Breathing"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./sb_panel.db"
    
    # JWT
    jwt_secret: str = "CHANGE-ME-IN-PRODUCTION-use-openssl-rand-hex-32"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days
    
    # WebAuthn
    rp_id: str = "localhost"  # Change to your domain in production
    rp_name: str = "Still Breathing"
    rp_origin: str = "http://localhost:5173"  # Vite dev server
    
    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
