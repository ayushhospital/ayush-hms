from datetime import datetime
from typing import Optional
import json
from pydantic import BaseModel, Field, model_validator
from app.services.auth_service import hash_password, verify_password


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=4)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=100)


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4, max_length=100)
    role: str = Field(..., pattern="^(super|normal)$")
    modules: list[str] = []


class UserUpdate(BaseModel):
    password: Optional[str] = Field(None, min_length=4, max_length=100)
    role: Optional[str] = Field(None, pattern="^(super|normal)$")
    modules: Optional[list[str]] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    modules: list[str] = []
    is_active: bool
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def parse_modules(cls, data):
        # data may be a dict (JSON) or an ORM object
        modules = data.get("modules") if isinstance(data, dict) else getattr(data, "modules", None)
        if isinstance(modules, str):
            try:
                modules = json.loads(modules)
            except Exception:
                modules = []
            if isinstance(data, dict):
                data["modules"] = modules
            else:
                setattr(data, "modules", modules)
        return data

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    token: str
    user: UserResponse