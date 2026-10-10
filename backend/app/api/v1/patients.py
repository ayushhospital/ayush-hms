from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import re

from app.core.database import get_db
from app.schemas.schemas import PatientCreate, PatientResponse, PatientSearchResponse
from app.services.patient_service import register_patient, search_patients_by_phone, get_patient_by_id

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/search", response_model=PatientSearchResponse)
def search_patients(phone: str, db: Session = Depends(get_db)):
    """Search patients by phone number. Returns all family members linked to this number."""
    phone_clean = re.sub(r"\D", "", phone)
    if len(phone_clean) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number must have at least 10 digits",
        )
    return search_patients_by_phone(db, phone_clean)


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient_data: PatientCreate, db: Session = Depends(get_db)):
    """Register a new patient with a unique UHID."""
    try:
        patient = register_patient(db, patient_data)
        return patient
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve a single patient by ID."""
    patient = get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.get("/{patient_id}/consultations")
def get_patient_consultations(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve consultation history for a patient."""
    from app.services.consultation_service import get_consultations_by_patient, consultation_to_response
    patient = get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    consultations = get_consultations_by_patient(db, patient_id)
    return [consultation_to_response(c) for c in consultations]