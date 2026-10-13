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


class IPDAdmissionUpdate(BaseModel):
    admission_type: Optional[str] = Field(None, pattern="^(Planned|Emergency|Referral)$")
    admitting_doctor_id: Optional[int] = None
    department: Optional[str] = None
    ward_bed: Optional[str] = None
    reason_for_admission: Optional[str] = None
    referral_source: Optional[str] = Field(None, pattern="^(Self|Doctor|Hospital|Other)$")
    referring_provider: Optional[str] = None
    admission_notes: Optional[str] = None
    initial_diagnosis: Optional[str] = None


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
# --- Tests ---
class IPDTestsCreate(BaseModel):
    test_name: str = Field(..., min_length=1)
    category: Optional[str] = None
    ordered_datetime: Optional[datetime] = None
    ordered_by: Optional[int] = None
    instructions: Optional[str] = None
    status: str = "Ordered"
    notes: Optional[str] = None

class IPDTestsResponse(BaseModel):
    id: int; admission_id: int; test_name: str; category: Optional[str] = None
    ordered_datetime: datetime; ordered_by: Optional[int] = None
    instructions: Optional[str] = None; status: str
    result_text: Optional[str] = None; result_datetime: Optional[datetime] = None
    result_status: Optional[str] = None; notes: Optional[str] = None
    model_config = {"from_attributes": True}

class IPDTestResultUpdate(BaseModel):
    result_text: str; result_datetime: datetime = None
    result_status: Optional[str] = None

# --- Medications ---
class IPDMedicationCreate(BaseModel):
    medicine_name: str = Field(..., min_length=1)
    strength: Optional[str] = None
    dose: str = Field(..., min_length=1)
    route: str = Field(..., min_length=1)
    frequency: str = Field(..., min_length=1)
    start_date: date
    end_date: Optional[date] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    prescribing_doctor_id: Optional[int] = None
    status: str = "Active"
    notes: Optional[str] = None

class IPDMedicationResponse(BaseModel):
    id: int; admission_id: int; medicine_name: str; strength: Optional[str] = None
    dose: str; route: str; frequency: str
    start_date: date; end_date: Optional[date] = None
    duration: Optional[str] = None; instructions: Optional[str] = None
    prescribing_doctor_id: Optional[int] = None
    status: str; discontinued_at: Optional[datetime] = None
    discontinuation_reason: Optional[str] = None; notes: Optional[str] = None
    model_config = {"from_attributes": True}

class IPDMedicationUpdate(BaseModel):
    status: Optional[str] = None
    discontinued_at: Optional[datetime] = None
    discontinuation_reason: Optional[str] = None
    notes: Optional[str] = None

# --- Insurance ---
class IPDInsuranceCreate(BaseModel):
    provider: str = Field(..., min_length=1)
    policy_number: Optional[str] = None
    policyholder_name: Optional[str] = None
    member_id: Optional[str] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    sum_insured: Optional[float] = None
    tpa_name: Optional[str] = None
    contact_number: Optional[str] = None

class IPDInsuranceUpdate(BaseModel):
    provider: Optional[str] = None
    policy_number: Optional[str] = None
    policyholder_name: Optional[str] = None
    member_id: Optional[str] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    sum_insured: Optional[float] = None
    tpa_name: Optional[str] = None
    contact_number: Optional[str] = None
    claim_number: Optional[str] = None
    preauthorization_number: Optional[str] = None
    requested_amount: Optional[float] = None
    approved_amount: Optional[float] = None
    settled_amount: Optional[float] = None
    claim_status: Optional[str] = None
    claim_notes: Optional[str] = None

class IPDInsuranceResponse(BaseModel):
    id: int; admission_id: int; provider: str; policy_number: Optional[str] = None
    policyholder_name: Optional[str] = None; member_id: Optional[str] = None
    valid_from: Optional[date] = None; valid_to: Optional[date] = None
    sum_insured: Optional[float] = None; tpa_name: Optional[str] = None
    contact_number: Optional[str] = None; claim_number: Optional[str] = None
    preauthorization_number: Optional[str] = None
    requested_amount: Optional[float] = None; approved_amount: Optional[float] = None
    settled_amount: Optional[float] = None; claim_status: Optional[str] = None
    claim_notes: Optional[str] = None
    model_config = {"from_attributes": True}

# --- Charges & Payments ---
class IPDChargeCreate(BaseModel):
    charge_datetime: datetime = None
    charge_date: Optional[date] = None
    category: Optional[str] = None
    description: str = Field(..., min_length=1)
    quantity: float = 1
    unit_price: float = Field(..., gt=0)
    notes: Optional[str] = None

class IPDChargeResponse(BaseModel):
    id: int; admission_id: int; charge_datetime: datetime
    charge_date: Optional[date] = None
    category: Optional[str] = None; description: str
    quantity: float; unit_price: float; total_amount: float
    notes: Optional[str] = None
    model_config = {"from_attributes": True}

class IPDPaymentCreate(BaseModel):
    payment_datetime: datetime = None
    amount: float = Field(..., gt=0)
    payment_mode: str = Field(..., min_length=1)
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None

class IPDPaymentResponse(BaseModel):
    id: int; admission_id: int; receipt_number: str
    payment_datetime: datetime; amount: float
    payment_mode: str; transaction_reference: Optional[str] = None
    status: str; notes: Optional[str] = None
    model_config = {"from_attributes": True}

class IPDRefundCreate(BaseModel):
    payment_id: Optional[int] = None
    amount: float = Field(..., gt=0)
    refund_mode: str = Field(..., min_length=1)
    reason: str = Field(..., min_length=1)
    refund_datetime: datetime = None

class IPDRefundResponse(BaseModel):
    id: int; admission_id: int; payment_id: Optional[int] = None
    refund_number: str; refund_datetime: datetime
    amount: float; refund_mode: str; reason: str
    model_config = {"from_attributes": True}

class IPDBillingSummary(BaseModel):
    total_charges: float
    total_payments: float
    total_refunds: float
    outstanding_balance: float

# --- Discharge Summary ---
class IPDDischargeSummaryCreate(BaseModel):
    discharge_datetime: Optional[datetime] = None
    discharging_doctor_id: Optional[int] = None
    final_diagnosis: Optional[str] = None
    clinical_history: Optional[str] = None
    examination_findings: Optional[str] = None
    investigations: Optional[str] = None
    treatment_given: Optional[str] = None
    procedures_performed: Optional[str] = None
    condition_at_discharge: Optional[str] = None
    discharge_medications: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    diet_activity_advice: Optional[str] = None
    warning_signs: Optional[str] = None
    additional_notes: Optional[str] = None
    status: str = "Draft"

class IPDDischargeSummaryResponse(BaseModel):
    id: int; admission_id: int; status: str
    discharge_datetime: Optional[datetime] = None
    discharging_doctor_id: Optional[int] = None
    final_diagnosis: Optional[str] = None
    clinical_history: Optional[str] = None
    examination_findings: Optional[str] = None
    investigations: Optional[str] = None
    treatment_given: Optional[str] = None
    procedures_performed: Optional[str] = None
    condition_at_discharge: Optional[str] = None
    discharge_medications: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    diet_activity_advice: Optional[str] = None
    warning_signs: Optional[str] = None
    additional_notes: Optional[str] = None
    finalized_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# --- Activity ---
class IPDActivityLogResponse(BaseModel):
    id: int; admission_id: int; action: str
    section: Optional[str] = None; description: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}
