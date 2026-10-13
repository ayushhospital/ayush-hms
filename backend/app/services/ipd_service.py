# Append activity logging and helper functions below

def _log_activity(db: Session, admission_id: int, action: str, section: str = None, description: str = None):
    """Record an activity log entry for an admission."""
    log = IPDActivityLog(admission_id=admission_id, action=action, section=section, description=description)
    db.add(log)
    db.commit()

def _log_create(adm_id, db): _log_activity(db, adm_id, 'Admission Created', 'Admission')
def _log_test_add(adm_id, db, desc): _log_activity(db, adm_id, 'Test Added', 'Tests', desc)
def _log_test_result(adm_id, db, desc): _log_activity(db, adm_id, 'Test Result', 'Tests', desc)
def _log_med_add(adm_id, db, desc): _log_activity(db, adm_id, 'Medication Added', 'Medications', desc)
def _log_ins_add(adm_id, db, desc): _log_activity(db, adm_id, 'Insurance Added', 'Insurance', desc)
def _log_charge(adm_id, db, desc): _log_activity(db, adm_id, 'Charge Added', 'Billing', desc)
def _log_payment(adm_id, db, desc): _log_activity(db, adm_id, 'Payment Recorded', 'Billing', desc)
def _log_discharge_saved(adm_id, db): _log_activity(db, adm_id, 'Discharge Summary Saved', 'Discharge')
def _log_discharge_finalize(adm_id, db): _log_activity(db, adm_id, 'Discharge Finalized', 'Discharge')
def generate_receipt_number(db: Session) -> str:
    try:
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS ipd_receipt_seq START 1"))
        db.commit()
    except Exception:
        db.rollback()
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS ipd_receipt_seq START 1"))
        db.commit()
    result = db.execute(text("SELECT nextval('ipd_receipt_seq')"))
    return f"RCT-{result.scalar():06d}"


def generate_refund_number(db: Session) -> str:
    try:
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS ipd_refund_seq START 1"))
        db.commit()
    except Exception:
        db.rollback()
        db.execute(text("CREATE SEQUENCE IF NOT EXISTS ipd_refund_seq START 1"))
        db.commit()
    result = db.execute(text("SELECT nextval('ipd_refund_seq')"))
    return f"RFN-{result.scalar():06d}"
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, or_, and_
from datetime import datetime, date, timedelta
import pytz
from typing import Optional

from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.ipd import IPDAdmission, IPDAttendant, IPDActivityLog
from app.schemas.ipd import IPDAdmissionCreate, IPDAttendantUpdate, IPDAdmissionResponse, IPDAdmissionSummary, IPDAdmissionListResponse


def generate_admission_number(db: Session) -> str:
    try:
        db.execute(text('CREATE SEQUENCE IF NOT EXISTS ipd_admission_seq START 1'))
        db.commit()
    except Exception:
        db.rollback()
        db.execute(text('CREATE SEQUENCE IF NOT EXISTS ipd_admission_seq START 1'))
        db.commit()
    result = db.execute(text("SELECT nextval('ipd_admission_seq')"))
    return f"IPD-{result.scalar():06d}"


def create_admission(db: Session, data: IPDAdmissionCreate) -> IPDAdmission:
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise ValueError('Patient not found')
    doctor = db.query(Doctor).filter(Doctor.id == data.admitting_doctor_id).first()
    if not doctor:
        raise ValueError('Admitting doctor not found')
    existing = db.query(IPDAdmission).filter(IPDAdmission.patient_id == data.patient_id, IPDAdmission.status == 'Open').first()
    if existing:
        raise ValueError(f'Patient already has an open admission ({existing.admission_number}). Discharge it first.')

    admission = IPDAdmission(
        admission_number=generate_admission_number(db),
        patient_id=data.patient_id, admission_datetime=data.admission_datetime,
        admission_type=data.admission_type, admitting_doctor_id=data.admitting_doctor_id,
        department=data.department, reason_for_admission=data.reason_for_admission,
        initial_diagnosis=data.initial_diagnosis, referral_source=data.referral_source,
        referring_provider=data.referring_provider, ward_bed=data.ward_bed,
        admission_notes=data.admission_notes, status='Open',
    )
    db.add(admission)
    db.flush()
    attendant = IPDAttendant(
        admission_id=admission.id, name=data.attendant_name,
        relation=data.attendant_relationship, phone_number=data.attendant_phone,
        alternate_phone_number=data.attendant_alternate_phone,
        address=data.attendant_address, notes=data.attendant_notes,
    )
    db.add(attendant)
    db.commit()
    db.refresh(admission)
    _log_activity(db, admission.id, 'Admission Created', 'Admission', f'{admission.admission_number}')
    return admission


def admission_to_response(admission: IPDAdmission) -> IPDAdmissionResponse:
    return IPDAdmissionResponse(
        id=admission.id, admission_number=admission.admission_number,
        patient_id=admission.patient_id,
        admission_datetime=admission.admission_datetime,
        admission_type=admission.admission_type,
        admitting_doctor_id=admission.admitting_doctor_id,
        department=admission.department,
        reason_for_admission=admission.reason_for_admission,
        initial_diagnosis=admission.initial_diagnosis,
        referral_source=admission.referral_source,
        referring_provider=admission.referring_provider,
        ward_bed=admission.ward_bed, admission_notes=admission.admission_notes,
        status=admission.status, discharge_datetime=admission.discharge_datetime,
        created_at=admission.created_at, updated_at=admission.updated_at,
        patient_name=admission.patient.name if admission.patient else None,
        patient_uhid=admission.patient.uhid if admission.patient else None,
        patient_age=admission.patient.age if admission.patient else None,
        patient_gender=admission.patient.gender if admission.patient else None,
        patient_phone=admission.patient.phone_number if admission.patient else None,
        doctor_name=admission.admitting_doctor.name if admission.admitting_doctor else None,
        doctor_department=admission.admitting_doctor.department if admission.admitting_doctor else None,
    )


def get_admission_by_id(db: Session, admission_id: int) -> Optional[IPDAdmission]:
    return db.query(IPDAdmission).options(
        joinedload(IPDAdmission.patient), joinedload(IPDAdmission.admitting_doctor),
        joinedload(IPDAdmission.attendant),
    ).filter(IPDAdmission.id == admission_id).first()


def list_admissions(db: Session, status_filter=None, search=None, start_date=None, end_date=None,
                    discharged_start=None, discharged_end=None, recent_days=None, view=None, limit=50, offset=0):
    query = db.query(IPDAdmission).options(
        joinedload(IPDAdmission.patient), joinedload(IPDAdmission.admitting_doctor))
    tz_now = datetime.now(pytz.timezone('Asia/Kolkata'))
    if view == 'active':
        week_ago = tz_now - timedelta(days=7)
        query = query.filter(or_(
            IPDAdmission.status == 'Open',
            and_(IPDAdmission.status == 'Discharged', IPDAdmission.discharge_datetime >= week_ago)
        ))
    elif status_filter == 'open':
        query = query.filter(IPDAdmission.status == 'Open')
    elif status_filter == 'discharged':
        query = query.filter(IPDAdmission.status == 'Discharged')
        if recent_days:
            cutoff = tz_now - timedelta(days=recent_days)
            query = query.filter(IPDAdmission.discharge_datetime >= cutoff)
    if start_date:
        sd = datetime.combine(start_date, datetime.min.time())
        query = query.filter(IPDAdmission.admission_datetime >= sd)
    if end_date:
        ed = datetime.combine(end_date + timedelta(days=1), datetime.min.time())
        query = query.filter(IPDAdmission.admission_datetime < ed)
    if discharged_start:
        ds = datetime.combine(discharged_start, datetime.min.time())
        query = query.filter(IPDAdmission.discharge_datetime >= ds)
    if discharged_end:
        de = datetime.combine(discharged_end + timedelta(days=1), datetime.min.time())
        query = query.filter(IPDAdmission.discharge_datetime < de)
    if search:
        st = f'%{search}%'
        query = query.join(Patient).filter(or_(
            Patient.name.ilike(st), Patient.uhid.ilike(st), Patient.phone_number.ilike(st),
            IPDAdmission.admission_number.ilike(st)
        ))
    total = query.count()
    tz = pytz.timezone('Asia/Kolkata')
    today_start = datetime.now(tz).replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    open_count = db.query(IPDAdmission).filter(IPDAdmission.status == 'Open').count()
    today_admissions = db.query(IPDAdmission).filter(
        IPDAdmission.admission_datetime >= today_start, IPDAdmission.admission_datetime < today_end).count()
    discharged_today = db.query(IPDAdmission).filter(
        IPDAdmission.status == 'Discharged', IPDAdmission.discharge_datetime >= today_start,
        IPDAdmission.discharge_datetime < today_end).count()
    admissions = query.order_by(IPDAdmission.admission_datetime.desc()).offset(offset).limit(limit).all()
    summaries = []
    for a in admissions:
        summaries.append(IPDAdmissionSummary(
            id=a.id, admission_number=a.admission_number, patient_id=a.patient_id,
            patient_name=a.patient.name if a.patient else None,
            patient_uhid=a.patient.uhid if a.patient else None,
            patient_phone=a.patient.phone_number if a.patient else None,
            admission_datetime=a.admission_datetime,
            discharge_datetime=a.discharge_datetime,
            admitting_doctor_id=a.admitting_doctor_id,
            doctor_name=a.admitting_doctor.name if a.admitting_doctor else None,
            ward_bed=a.ward_bed, status=a.status,
        ))
    return IPDAdmissionListResponse(
        admissions=summaries, total=total, open_count=open_count,
        today_admissions=today_admissions, discharged_today=discharged_today,
    )


def update_attendant(db: Session, admission_id: int, data: IPDAttendantUpdate):
    att = db.query(IPDAttendant).filter(IPDAttendant.admission_id == admission_id).first()
    if not att:
        return None
    att.name = data.name
    att.relation = data.relation
    att.phone_number = data.phone_number
    att.alternate_phone_number = data.alternate_phone_number
    att.address = data.address
    att.notes = data.notes
    db.commit()
    db.refresh(att)
    return att
