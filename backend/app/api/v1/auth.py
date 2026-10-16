from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserResponse, ChangePasswordRequest
from app.services.auth_service import (
    issue_login,
    logout_session,
    get_current_user,
    verify_password,
    hash_password,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user, token = issue_login(db, data.username, data.password)
    return TokenResponse(token=token, user=user)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    if authorization and authorization.startswith("Bearer "):
        logout_session(db, authorization[7:].strip())
    return {"status": "logged_out"}


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"status": "password_updated"}