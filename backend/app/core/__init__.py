from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    app_name: str = "Ayush HMS"
    environment: str = "development"
    timezone: str = "Asia/Kolkata"

    database_url: str = "postgresql://chaitanya@localhost:5433/ayush_hms"
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:4173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()