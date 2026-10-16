from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import re


class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    age: int = Field(..., ge=0, le=150)
    phone_number: str = Field(..., min_length=1, max_length=20)

    @field_validator("phone_number")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Phone number must have 10-15 digits")
        return digits

    model_config = {"json_schema_extra": {"example": {
        "name": "Ravi Kumar",
        "gender": "Male",
        "age": 30,
        "phone_number": "9876543210"
    }}}

class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    gender: Optional[str] = Field(None, pattern="^(Male|Female|Other)$")
    age: Optional[int] = Field(None, ge=0, le=150)

class PatientResponse(BaseModel):
    id: int
    uhid: str
    name: str
    gender: str
    age: int
    phone_number: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PatientSearchResult(BaseModel):
    patient: PatientResponse
    consultation_status: str
    active_consultation_id: Optional[int] = None
    valid_until: Optional[datetime] = None


class PatientSearchResponse(BaseModel):
    phone_number: str
    patients: list[PatientSearchResult]


class ConsultationCreate(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None  # null when using custom_doctor_name
    custom_doctor_name: Optional[str] = Field(None, max_length=100)
    consultation_date: date
    visit_type: str = Field(..., pattern="^(New|Follow-up)$")
    fee_amount: float = Field(..., ge=0)
    payment_mode: str = Field(..., pattern="^(Cash|UPI)$")
    notes: Optional[str] = None

    model_config = {"json_schema_extra": {"example": {
        "patient_id": 1,
        "doctor_id": 1,
        "consultation_date": "2026-10-10",
        "visit_type": "New",
        "fee_amount": 300.0,
        "payment_mode": "Cash",
        "notes": ""
    }}}


class ConsultationResponse(BaseModel):
    id: int
    consultation_number: str
    patient_id: int
    doctor_id: Optional[int] = None
    custom_doctor_name: Optional[str] = None
    consultation_date: datetime
    visit_type: str
    fee_amount: float
    payment_mode: str
    payment_status: str
    valid_until: datetime
    notes: Optional[str] = None
    created_at: datetime
    patient_name: Optional[str] = None
    patient_uhid: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    patient_phone: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_department: Optional[str] = None

    model_config = {"from_attributes": True}


class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    department: str = Field(..., min_length=1, max_length=100)
    consultation_fee: float = Field(..., ge=0)

    model_config = {"json_schema_extra": {"example": {
        "name": "Dr. Sharma",
        "department": "General Medicine",
        "consultation_fee": 300.0
    }}}


class DoctorResponse(BaseModel):
    id: int
    name: str
    department: str
    consultation_fee: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RevenueReportRow(BaseModel):
    visit_type: str
    cash_amount: float
    upi_amount: float
    total: float


class RevenueReport(BaseModel):
    start_date: date
    end_date: date
    rows: list[RevenueReportRow]
    grand_total_cash: float
    grand_total_upi: float
    grand_total: float


class FootfallReport(BaseModel):
    start_date: date
    end_date: date
    total_visits: int
    unique_patients: int
    day_wise: Optional[list[dict]] = None


class DoctorSummaryRow(BaseModel):
    doctor_id: int
    doctor_name: str
    department: str
    total_consultations: int
    new_visits: int
    follow_up_visits: int
    total_revenue: float


class DoctorSummaryReport(BaseModel):
    start_date: date
    end_date: date
    rows: list[DoctorSummaryRow]
    grand_total: float


class DailySummaryRow(BaseModel):
    date: date
    new_visits: int
    followup_visits: int
    cash_amount: float
    upi_amount: float
    total_amount: float
    total_visits: int
    unique_patients: int


class DailySummaryReport(BaseModel):
    start_date: date
    end_date: date
    rows: list[DailySummaryRow]
    grand_total_visits: int
    grand_total_cash: float
    grand_total_upi: float
    grand_total: float


class PatientListRow(BaseModel):
    consultation_number: str
    consultation_date: datetime
    patient_name: str
    patient_uhid: str
    patient_phone: str
    doctor_name: Optional[str] = None
    visit_type: str
    fee_amount: float
    payment_mode: str


class PatientListReport(BaseModel):
    start_date: date
    end_date: date
    rows: list[PatientListRow]
    total_count: int


class IPDAdmissionsRow(BaseModel):
    date: date
    total_admissions: int
    open_count: int
    discharged_count: int
    planned: int
    emergency: int
    referral: int


class IPDAdmissionsReport(BaseModel):
    start_date: date
    end_date: date
    rows: list[IPDAdmissionsRow]
    grand_total: int
    grand_open: int
    grand_discharged: int


class IPDBillingRow(BaseModel):
    admission_number: str
    admission_date: datetime
    patient_name: str
    patient_uhid: str
    ward_bed: Optional[str] = None
    total_charges: float
    total_paid: float
    outstanding: float


class IPDBillingReport(BaseModel):
    start_date: date
    end_date: date
    rows: list[IPDBillingRow]
    grand_charges: float
    grand_paid: float
    grand_outstanding: float