from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.doctor import Doctor
from app.schemas.schemas import DoctorCreate, DoctorResponse

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("", response_model=list[DoctorResponse])
def list_doctors(db: Session = Depends(get_db)):
    """List all active doctors in the order they were created."""
    doctors = db.query(Doctor).filter(Doctor.is_active == True).order_by(Doctor.id).all()
    return doctors


@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(data: DoctorCreate, db: Session = Depends(get_db)):
    """Create a new doctor (admin only in production)."""
    doctor = Doctor(
        name=data.name.strip(),
        department=data.department.strip(),
        consultation_fee=data.consultation_fee,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor