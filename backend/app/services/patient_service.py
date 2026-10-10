from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, date, timedelta, timezone
import pytz
import re
from typing import Optional

from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.doctor import Doctor
from app.schemas.schemas import PatientCreate, PatientSearchResult, PatientSearchResponse
from datetime import date as date_type


def generate_uhid(db: Session) -> str:
    """Generate a unique UHID using a database sequence.
    Format: AYH-XXXXXX where XXXXXX is a zero-padded 6-digit number.
    """
    # First ensure the sequence exists (do this outside of any aborted txn)
    try:
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS uhid_seq START 1"))
        db.commit()
    except Exception:
        db.rollback()
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS uhid_seq START 1"))
        db.commit()

    # Now get the next value
    result = db.execute(text("SELECT nextval('uhid_seq')"))
    next_id = result.scalar()
    return f"AYH-{next_id:06d}"


def register_patient(db: Session, patient_data: PatientCreate) -> Patient:
    """Register a new patient with a unique UHID."""
    phone = re.sub(r"\D", "", patient_data.phone_number)

    patient = Patient(
        uhid=generate_uhid(db),
        name=patient_data.name.strip(),
        gender=patient_data.gender,
        age=patient_data.age,
        phone_number=phone,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def search_patients_by_phone(db: Session, phone: str) -> PatientSearchResponse:
    """Search all patients linked to a phone number with their consultation status."""
    phone_normalized = re.sub(r"\D", "", phone)

    patients = db.query(Patient).filter(
        Patient.phone_number == phone_normalized
    ).order_by(Patient.created_at.desc()).all()

    results = []
    for patient in patients:
        status, consultation_id, valid_until = get_consultation_status(db, patient.id)
        results.append(PatientSearchResult(
            patient=patient,
            consultation_status=status,
            active_consultation_id=consultation_id,
            valid_until=valid_until,
        ))

    return PatientSearchResponse(
        phone_number=phone_normalized,
        patients=results,
    )


def get_patient_by_id(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()


def get_consultation_status(db: Session, patient_id: int) -> tuple[str, Optional[int], Optional[datetime]]:
    """Determine consultation status for a patient.
    Returns (status_text, active_consultation_id, valid_until).
    """
    now = datetime.now(pytz.timezone("Asia/Kolkata"))

    active_consultation = db.query(Consultation).filter(
        Consultation.patient_id == patient_id,
        Consultation.payment_status == "Paid",
        Consultation.valid_until >= now,
    ).order_by(Consultation.consultation_date.desc()).first()

    if active_consultation:
        return ("Active Consultation", active_consultation.id, active_consultation.valid_until)

    expired = db.query(Consultation).filter(
        Consultation.patient_id == patient_id,
        Consultation.payment_status == "Paid",
        Consultation.valid_until < now,
    ).first()

    if expired:
        return ("Expired", None, None)

    return ("No Consultation", None, None)