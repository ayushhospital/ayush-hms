from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Ayush HMS"
    environment: str = "development"
    timezone: str = "Asia/Kolkata"
    database_url: str = "postgresql+psycopg://ayushhms:postgres@localhost:5432/ayush_hms"
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173", "http://127.0.0.1:4173"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()