from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import re
from typing import Optional

from app.core.database import get_db
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.schemas.schemas import PatientCreate, PatientUpdate, PatientResponse, PatientSearchResponse
from app.services.patient_service import register_patient, search_patients_by_phone, get_patient_by_id, update_patient_info
from app.services.auth_service import require_modules

router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    dependencies=[Depends(require_modules("opd", "ipd"))],  # patient registry is shared by OPD & IPD
)

# Static routes MUST come before parameterized routes

@router.get("/search", response_model=PatientSearchResponse)
def search_patients(phone: str, db: Session = Depends(get_db)):
    """Search patients by phone number. Returns all family members linked to this number."""
    phone_clean = re.sub(r"\D", "", phone)
    if len(phone_clean) < 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number must have at least 10 digits")
    return search_patients_by_phone(db, phone_clean)


@router.get("/by-uhid")
def search_by_uhid(uhid: str, db: Session = Depends(get_db)):
    """Search patient by UHID."""
    patient = db.query(Patient).filter(Patient.uhid == uhid.upper().strip()).first() if uhid else None
    if not patient:
        return {"phone_number": "", "patients": []}
    from app.services.patient_service import get_consultation_status
    status, cid, vu = get_consultation_status(db, patient.id)
    return {
        "phone_number": patient.phone_number,
        "patients": [{
            "patient": patient,
            "consultation_status": status,
            "active_consultation_id": cid,
            "valid_until": vu.isoformat() if vu else None,
        }]
    }


@router.get("/by-date-range")
def search_by_date_range(start: str, end: str, db: Session = Depends(get_db)):
    """Search patients who had consultations in a date range."""
    from datetime import datetime, timedelta
    from app.models.consultation import Consultation
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d") + timedelta(days=1)
    patients = db.query(Patient).join(Consultation).filter(
        Consultation.patient_id == Patient.id,
        Consultation.consultation_date >= start_dt,
        Consultation.consultation_date < end_dt,
    ).distinct().all()
    results = []
    for patient in patients:
        from app.services.patient_service import get_consultation_status
        st, cid, vu = get_consultation_status(db, patient.id)
        results.append({
            "patient": patient,
            "consultation_status": st,
            "active_consultation_id": cid,
            "valid_until": vu.isoformat() if vu else None,
        })
    return {"phone_number": "", "patients": results}


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


@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, data: PatientUpdate, db: Session = Depends(get_db)):
    """Update patient information (name, gender, age)."""
    patient = update_patient_info(db, patient_id, data)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient
