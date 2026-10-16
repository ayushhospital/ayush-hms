import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Ayush HMS"
    environment: str = os.getenv("ENVIRONMENT", "development")
    timezone: str = "Asia/Kolkata"
    
    # Prioritize the Render environment variable; fallback to local Postgres
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg://ayushhms:postgres@localhost:5432/ayush_hms"
    )
    
    # Added "*" to allow cross-origin requests from your Netlify domain
    cors_origins: List[str] = [
        "http://localhost:5173", 
        "http://localhost:4173", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:4173",
        "*"
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()