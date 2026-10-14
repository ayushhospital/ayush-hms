import hashlib
import json
import os
import secrets

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserSession

MODULES = ["opd", "ipd", "reports", "pharmacy"]


def hash_password(password: str) -> str:
    """PBKDF2-SHA256 hash with a random per-password salt."""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return salt.hex() + "$" + dk.hex()


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, dk_hex = stored.split("$")
        dk = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), 100_000
        )
        return secrets.compare_digest(dk.hex(), dk_hex)
    except Exception:
        return False


def parse_modules(modules_str: str) -> list[str]:
    try:
        data = json.loads(modules_str or "[]")
    except Exception:
        data = []
    return [m for m in data if m in MODULES]


def serialize_modules(modules: list[str]) -> str:
    cleaned = [m for m in (modules or []) if m in MODULES]
    # Super users always have every module.
    return json.dumps(list(dict.fromkeys(cleaned)))


def issue_login(db: Session, username: str, password: str) -> tuple[User, str]:
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = secrets.token_hex(32)
    db.add(UserSession(token=token, user_id=user.id))
    db.commit()
    return user, token


def logout_session(db: Session, token: str) -> None:
    db.query(UserSession).filter(UserSession.token == token).delete()
    db.commit()


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    token = authorization[7:].strip()
    session = db.query(UserSession).filter(UserSession.token == token).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired, please login again",
        )
    user = db.query(User).filter(User.id == session.user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )
    return user


def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "super":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super users can perform this action",
        )
    return current_user


def require_modules(*modules: str):
    """Dependency factory: allow super users and users granted at least one of the modules."""

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "super":
            return current_user
        user_modules = parse_modules(current_user.modules)
        if not any(m in user_modules for m in modules):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account does not have access to this module",
            )
        return current_user

    return dependency