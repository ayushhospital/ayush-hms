from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import date, datetime, timedelta

from app.models.consultation import Consultation
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.schemas import (
    RevenueReport, RevenueReportRow,
    FootfallReport,
    DoctorSummaryReport, DoctorSummaryRow,
    PatientListReport, PatientListRow,
)


def _get_date_bounds(start_date: date, end_date: date) -> tuple[datetime, datetime]:
    """Get inclusive start and exclusive end datetimes."""
    start_dt = datetime.combine(start_date, datetime.min.time())
    end_dt = datetime.combine(end_date + timedelta(days=1), datetime.min.time())
    return start_dt, end_dt


def get_revenue_report(db: Session, start_date: date, end_date: date) -> RevenueReport:
    """Calculate revenue broken down by visit type and payment mode."""
    start_dt, end_dt = _get_date_bounds(start_date, end_date)

    rows = db.query(
        Consultation.visit_type,
        Consultation.payment_mode,
        func.coalesce(func.sum(Consultation.fee_amount), 0).label("total"),
    ).filter(
        Consultation.consultation_date >= start_dt,
        Consultation.consultation_date < end_dt,
        Consultation.payment_status == "Paid",
    ).group_by(
        Consultation.visit_type,
        Consultation.payment_mode,
    ).all()

    totals = {}
    for r in rows:
        totals[(r.visit_type, r.payment_mode)] = float(r.total)

    report_rows = []
    for vt in ["New", "Follow-up"]:
        cash = totals.get((vt, "Cash"), 0.0)
        upi = totals.get((vt, "UPI"), 0.0)
        report_rows.append(RevenueReportRow(
            visit_type=vt, cash_amount=cash, upi_amount=upi, total=cash + upi,
        ))

    grand_cash = sum(totals.get((vt, "Cash"), 0.0) for vt in ["New", "Follow-up"])
    grand_upi = sum(totals.get((vt, "UPI"), 0.0) for vt in ["New", "Follow-up"])

    return RevenueReport(
        start_date=start_date, end_date=end_date,
        rows=report_rows,
        grand_total_cash=grand_cash, grand_total_upi=grand_upi,
        grand_total=grand_cash + grand_upi,
    )


def get_footfall_report(db: Session, start_date: date, end_date: date) -> FootfallReport:
    """Calculate patient footfall in date range."""
    start_dt, end_dt = _get_date_bounds(start_date, end_date)

    total_visits = db.query(func.count(Consultation.id)).filter(
        Consultation.consultation_date >= start_dt,
        Consultation.consultation_date < end_dt,
        Consultation.payment_status == "Paid",
    ).scalar()

    unique_patients = db.query(func.count(func.distinct(Consultation.patient_id))).filter(
        Consultation.consultation_date >= start_dt,
        Consultation.consultation_date < end_dt,
        Consultation.payment_status == "Paid",
    ).scalar()

    day_wise = db.query(
        func.date(Consultation.consultation_date).label("date"),
        func.count(Consultation.id).label("visits"),
        func.count(func.distinct(Consultation.patient_id)).label("unique_patients"),
    ).filter(
        Consultation.consultation_date >= start_dt,
        Consultation.consultation_date < end_dt,
        Consultation.payment_status == "Paid",
    ).group_by(
        func.date(Consultation.consultation_date),
    ).order_by(
        func.date(Consultation.consultation_date),
    ).all()

    day_wise_list = [
        {"date": str(row.date), "visits": row.visits, "unique_patients": row.unique_patients}
        for row in day_wise
    ]

    return FootfallReport(
        start_date=start_date, end_date=end_date,
        total_visits=total_visits or 0,
        unique_patients=unique_patients or 0,
        day_wise=day_wise_list,
    )


def get_doctor_summary_report(db: Session, start_date: date, end_date: date) -> DoctorSummaryReport:
    """Calculate doctor-wise consultation summary."""
    start_dt, end_dt = _get_date_bounds(start_date, end_date)

    doctor_summary = db.query(
        Doctor.id,
        Doctor.name,
        Doctor.department,
        func.count(Consultation.id).label("total"),
        func.coalesce(
            func.sum(case((Consultation.visit_type == "New", 1), else_=0)),
            0,
        ).label("new_count"),
        func.coalesce(
            func.sum(case((Consultation.visit_type == "Follow-up", 1), else_=0)),
            0,
        ).label("followup_count"),
        func.coalesce(func.sum(Consultation.fee_amount), 0).label("revenue"),
    ).outerjoin(
        Consultation,
        (Consultation.doctor_id == Doctor.id)
        & (Consultation.consultation_date >= start_dt)
        & (Consultation.consultation_date < end_dt)
        & (Consultation.payment_status == "Paid"),
    ).group_by(
        Doctor.id,
        Doctor.name,
        Doctor.department,
    ).order_by(
        Doctor.name,
    ).all()

    rows = []
    grand_total = 0.0
    for doc_id, name, dept, total, new_count, followup_count, revenue in doctor_summary:
        revenue_float = float(revenue)
        grand_total += revenue_float
        rows.append(DoctorSummaryRow(
            doctor_id=doc_id,
            doctor_name=name,
            department=dept,
            total_consultations=total,
            new_visits=int(new_count),
            follow_up_visits=int(followup_count),
            total_revenue=revenue_float,
        ))

    return DoctorSummaryReport(
        start_date=start_date, end_date=end_date,
        rows=rows, grand_total=grand_total,
    )
def get_patient_list_report(db: Session, start_date: date, end_date: date) -> PatientListReport:
    """Get individual patient visit list for a date range."""
    start_dt, end_dt = _get_date_bounds(start_date, end_date)

    rows = db.query(
        Consultation.consultation_number,
        Consultation.consultation_date,
        Patient.name.label("patient_name"),
        Patient.uhid.label("patient_uhid"),
        Patient.phone_number.label("patient_phone"),
        func.coalesce(Consultation.custom_doctor_name, Doctor.name).label("doctor_name"),
        Consultation.visit_type,
        Consultation.fee_amount,
        Consultation.payment_mode,
    ).join(
        Patient, Consultation.patient_id == Patient.id,
    ).outerjoin(
        Doctor, Consultation.doctor_id == Doctor.id,
    ).filter(
        Consultation.consultation_date >= start_dt,
        Consultation.consultation_date < end_dt,
        Consultation.payment_status == "Paid",
    ).order_by(
        Consultation.consultation_date.desc(),
    ).all()

    report_rows = []
    for r in rows:
        report_rows.append(PatientListRow(
            consultation_number=r.consultation_number,
            consultation_date=r.consultation_date,
            patient_name=r.patient_name,
            patient_uhid=r.patient_uhid,
            patient_phone=r.patient_phone,
            doctor_name=r.doctor_name,
            visit_type=r.visit_type,
            fee_amount=float(r.fee_amount) if r.fee_amount else 0.0,
            payment_mode=r.payment_mode,
        ))

    return PatientListReport(
        start_date=start_date, end_date=end_date,
        rows=report_rows, total_count=len(report_rows),
    )