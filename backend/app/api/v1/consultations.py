from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.schemas.schemas import ConsultationCreate, ConsultationResponse
from app.services.consultation_service import create_consultation, get_consultation_by_id, consultation_to_response
from app.services.patient_service import get_patient_by_id
from app.services.auth_service import require_modules

router = APIRouter(
    prefix="/consultations",
    tags=["consultations"],
    dependencies=[Depends(require_modules("opd"))],
)


@router.post("", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_new_consultation(data: ConsultationCreate, db: Session = Depends(get_db)):
    """Create a new consultation for a patient."""
    try:
        consultation = create_consultation(db, data)
        return consultation_to_response(consultation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation(consultation_id: int, db: Session = Depends(get_db)):
    """Retrieve consultation details by ID."""
    consultation = get_consultation_by_id(db, consultation_id)
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")
    return consultation_to_response(consultation)


@router.get("/{consultation_id}/status")
def get_consultation_status_endpoint(consultation_id: int, db: Session = Depends(get_db)):
    """Retrieve consultation validity status."""
    consultation = get_consultation_by_id(db, consultation_id)
    if not consultation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")

    import pytz
    now = datetime.now(pytz.timezone("Asia/Kolkata"))
    is_active = consultation.valid_until >= now

    return {
        "consultation_id": consultation.id,
        "valid_until": consultation.valid_until.isoformat(),
        "is_active": is_active,
        "payment_status": consultation.payment_status,
    }