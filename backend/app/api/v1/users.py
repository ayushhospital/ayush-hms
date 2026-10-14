from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.auth_service import (
    hash_password,
    require_superuser,
    serialize_modules,
)

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(require_superuser)])


def _user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    username = data.username.strip()
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(
        username=username,
        password_hash=hash_password(data.password),
        role=data.role,
        modules=serialize_modules(data.modules),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = _user_or_404(db, user_id)
    if data.password:
        user.password_hash = hash_password(data.password)
    if data.role is not None:
        user.role = data.role
    if data.modules is not None:
        user.modules = serialize_modules(data.modules)
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_superuser)):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    user = _user_or_404(db, user_id)
    db.delete(user)
    db.commit()