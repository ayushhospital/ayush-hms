from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


# --- Admission ---

class IPDAdmissionCreate(BaseModel):
    patient_id: int
    admission_datetime: datetime
    admission_type: str = Field(..., pattern="^(Planned|Emergency|Referral)$")
    admitting_doctor_id: int
    department: Optional[str] = None
    reason_for_admission: str = Field(..., min_length=1)
    initial_diagnosis: Optional[str] = None
    referral_source: Optional[str] = Field(None, pattern="^(Self|Doctor|Hospital|Other)$")
    referring_provider: Optional[str] = None
    ward_bed: Optional[str] = None
    admission_notes: Optional[str] = None
    attendant_name: str = Field(..., min_length=1)
    attendant_relationship: str = Field(..., pattern="^(Spouse|Parent|Child|Sibling|Relative|Friend|Other)$")
    attendant_phone: str = Field(..., min_length=10)
    attendant_alternate_phone: Optional[str] = None
    attendant_address: Optional[str] = None
    attendant_notes: Optional[str] = None


class IPDAdmissionResponse(BaseModel):
    id: int
    admission_number: str
    patient_id: int
    admission_datetime: datetime
    admission_type: str
    admitting_doctor_id: int
    department: Optional[str] = None
    reason_for_admission: str
    initial_diagnosis: Optional[str] = None
    referral_source: Optional[str] = None
    referring_provider: Optional[str] = None
    ward_bed: Optional[str] = None
    admission_notes: Optional[str] = None
    status: str
    discharge_datetime: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    patient_uhid: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    patient_phone: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_department: Optional[str] = None

    model_config = {"from_attributes": True}


class IPDAdmissionSummary(BaseModel):
    id: int
    admission_number: str
    patient_id: int
    patient_name: Optional[str] = None
    patient_uhid: Optional[str] = None
    patient_phone: Optional[str] = None
    admission_datetime: datetime
    admitting_doctor_id: int
    doctor_name: Optional[str] = None
    ward_bed: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}


class IPDAdmissionListResponse(BaseModel):
    admissions: list[IPDAdmissionSummary]
    total: int
    open_count: int
    today_admissions: int
    discharged_today: int


# --- Attendant ---

class IPDAttendantResponse(BaseModel):
    id: int
    admission_id: int
    name: str
    relation: str
    phone_number: str
    alternate_phone_number: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class IPDAttendantUpdate(BaseModel):
    name: str = Field(..., min_length=1)
    relation: str = Field(..., pattern="^(Spouse|Parent|Child|Sibling|Relative|Friend|Other)$")
    phone_number: str = Field(..., min_length=10)
    alternate_phone_number: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None