from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.doctor import Doctor
from app.models.user import User  # noqa: F401 - ensures users table is created
from app.api.v1.patients import router as patients_router
from app.api.v1.consultations import router as consultations_router
from app.api.v1.doctors import router as doctors_router
from app.api.v1.reports import router as reports_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.services.auth_service import hash_password

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Ayush Hospital Management System - OPD Module",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers under versioned prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(patients_router, prefix="/api/v1")
app.include_router(consultations_router, prefix="/api/v1")
app.include_router(doctors_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
from app.api.v1.ipd import router as ipd_router

app.include_router(ipd_router, prefix="/api/v1")


DEFAULT_DOCTORS = [
    {"name": "Dr. K Radhika", "department": "MS DGO", "consultation_fee": 500.0},
    {"name": "Dr. K V Subba Rao", "department": "MD Pediatrics", "consultation_fee": 500.0},
    {"name": "Dr. Uma Sai Manukonda", "department": "MS Ortho", "consultation_fee": 500.0},
]

SUPER_USER_USERNAME = "kvsubbarao"
SUPER_USER_PASSWORD = "Kolla@1960"


def seed_super_user(db: Session) -> None:
    if db.query(User).filter(User.username == SUPER_USER_USERNAME).first():
        return
    db.add(User(
        username=SUPER_USER_USERNAME,
        password_hash=hash_password(SUPER_USER_PASSWORD),
        role="super",
        modules=json.dumps(["opd", "ipd", "reports"]),
    ))
    db.commit()
    print(f"Seeded super user: {SUPER_USER_USERNAME}")


@app.on_event("startup")
def on_startup():
    """Create all tables and seed default doctors + super user on startup."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        existing = db.query(Doctor).count()
        if existing == 0:
            for doc_data in DEFAULT_DOCTORS:
                db.add(Doctor(**doc_data))
            db.commit()
            print(f"Seeded {len(DEFAULT_DOCTORS)} default doctors.")
        seed_super_user(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.app_name}