from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.services.report_service import (
    get_revenue_report,
    get_footfall_report,
    get_doctor_summary_report,
)
from app.schemas.schemas import RevenueReport, FootfallReport, DoctorSummaryReport

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/revenue", response_model=RevenueReport)
def revenue_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Get revenue report for a date range, broken down by visit type and payment mode."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_revenue_report(db, start_date, end_date)


@router.get("/footfall", response_model=FootfallReport)
def footfall_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Get patient footfall report for a date range."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_footfall_report(db, start_date, end_date)


@router.get("/doctor-summary", response_model=DoctorSummaryReport)
def doctor_summary_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Get doctor-wise consultation summary for a date range."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
    return get_doctor_summary_report(db, start_date, end_date)