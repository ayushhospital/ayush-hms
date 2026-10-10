from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text
from datetime import datetime, date, timedelta
import pytz
from typing import Optional

from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.doctor import Doctor
from app.schemas.schemas import ConsultationCreate, ConsultationResponse


def generate_consultation_number(db: Session) -> str:
    """Generate a unique consultation number using a database sequence."""
    # First ensure the sequence exists
    try:
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS consultation_seq START 1"))
        db.commit()
    except Exception:
        db.rollback()
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS consultation_seq START 1"))
        db.commit()

    # Now get the next value
    result = db.execute(text("SELECT nextval('consultation_seq')"))
    next_id = result.scalar()
    return f"CNL-{next_id:06d}"


def calculate_valid_until(consultation_date: date) -> datetime:
    """A consultation created on date D is valid through D+6, expiring at end of D+6.
    Returns timezone-aware datetime in Asia/Kolkata."""
    tz = pytz.timezone("Asia/Kolkata")
    # End of day on D+6
    expiry_date = consultation_date + timedelta(days=6)
    valid_until = tz.localize(datetime(
        expiry_date.year, expiry_date.month, expiry_date.day,
        23, 59, 59, 999999
    ))
    return valid_until


def create_consultation(db: Session, data: ConsultationCreate, consultation_number: Optional[str] = None) -> Consultation:
    """Create a new consultation record."""
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise ValueError("Patient not found")

    # When custom_doctor_name is provided, skip doctor FK validation
    if not data.custom_doctor_name:
        doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
        if not doctor:
            raise ValueError("Doctor not found")

    consultation_date = datetime.combine(data.consultation_date, datetime.min.time())
    tz = pytz.timezone("Asia/Kolkata")
    consultation_date_aware = tz.localize(consultation_date)
    valid_until = calculate_valid_until(data.consultation_date)

    consultation = Consultation(
        consultation_number=consultation_number or generate_consultation_number(db),
        patient_id=data.patient_id,
        doctor_id=data.doctor_id if data.doctor_id and not data.custom_doctor_name else None,
        custom_doctor_name=data.custom_doctor_name,
        consultation_date=consultation_date_aware,
        visit_type=data.visit_type,
        fee_amount=data.fee_amount,
        payment_mode=data.payment_mode,
        payment_status="Paid",
        valid_until=valid_until,
        notes=data.notes,
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    consultation_with_relations = db.query(Consultation).options(
        joinedload(Consultation.patient),
        joinedload(Consultation.doctor),
    ).filter(Consultation.id == consultation.id).first()

    return consultation_with_relations


def get_consultation_by_id(db: Session, consultation_id: int) -> Optional[Consultation]:
    return db.query(Consultation).options(
        joinedload(Consultation.patient),
        joinedload(Consultation.doctor),
    ).filter(Consultation.id == consultation_id).first()


def get_consultations_by_patient(db: Session, patient_id: int) -> list[Consultation]:
    return db.query(Consultation).options(
        joinedload(Consultation.doctor),
    ).filter(
        Consultation.patient_id == patient_id
    ).order_by(Consultation.consultation_date.desc()).all()


def consultation_to_response(consultation: Consultation) -> ConsultationResponse:
    """Convert a Consultation ORM object to a ConsultationResponse schema.
    Returns the custom doctor name if set, otherwise the linked doctor's name."""
    doctor_name = consultation.custom_doctor_name or (consultation.doctor.name if consultation.doctor else None)
    return ConsultationResponse(
        id=consultation.id,
        consultation_number=consultation.consultation_number,
        patient_id=consultation.patient_id,
        doctor_id=consultation.doctor_id,
        custom_doctor_name=consultation.custom_doctor_name,
        consultation_date=consultation.consultation_date,
        visit_type=consultation.visit_type,
        fee_amount=float(consultation.fee_amount) if consultation.fee_amount else 0,
        payment_mode=consultation.payment_mode,
        payment_status=consultation.payment_status,
        valid_until=consultation.valid_until,
        notes=consultation.notes,
        created_at=consultation.created_at,
        patient_name=consultation.patient.name if consultation.patient else None,
        patient_uhid=consultation.patient.uhid if consultation.patient else None,
        patient_age=consultation.patient.age if consultation.patient else None,
        patient_gender=consultation.patient.gender if consultation.patient else None,
        patient_phone=consultation.patient.phone_number if consultation.patient else None,
        doctor_name=doctor_name,
        doctor_department=consultation.doctor.department if consultation.doctor else None,
    )