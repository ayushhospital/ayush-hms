from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.patients import router as patients_router
from app.api.v1.consultations import router as consultations_router
from app.api.v1.doctors import router as doctors_router
from app.api.v1.reports import router as reports_router

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
app.include_router(patients_router, prefix="/api/v1")
app.include_router(consultations_router, prefix="/api/v1")
app.include_router(doctors_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    """Create all tables on startup (development only)."""
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.app_name}