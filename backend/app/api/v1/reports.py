from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.services.auth_service import require_modules

from app.services.report_service import (
    get_daily_summary_report,
    get_doctor_summary_report,
    get_patient_list_report,
    get_ipd_admissions_report,
    get_ipd_billing_report,
)
from app.schemas.schemas import (
    DailySummaryReport,
    DoctorSummaryReport,
    PatientListReport,
    IPDAdmissionsReport,
    IPDBillingReport,
)

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(require_modules("reports"))])


@router.get("/daily-summary", response_model=DailySummaryReport)
def daily_summary_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_daily_summary_report(db, start_date, end_date)


@router.get("/doctor-summary", response_model=DoctorSummaryReport)
def doctor_summary_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_doctor_summary_report(db, start_date, end_date)


@router.get("/patient-list", response_model=PatientListReport)
def patient_list_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_patient_list_report(db, start_date, end_date)


@router.get("/ipd-admissions-summary", response_model=IPDAdmissionsReport)
def ipd_admissions_summary_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_ipd_admissions_report(db, start_date, end_date)


@router.get("/ipd-billing", response_model=IPDBillingReport)
def ipd_billing_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_ipd_billing_report(db, start_date, end_date)
