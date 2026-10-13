from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from datetime import date, datetime
from typing import Optional
from app.core.database import get_db
from app.models.ipd import (IPDAdmission, IPDAttendant, IPDTests, IPDMedication,
    IPDInsurancePolicy, IPDCharge, IPDPayment, IPDRefund, IPDDischargeSummary, IPDActivityLog)
from app.services.ipd_service import (create_admission, get_admission_by_id, list_admissions,
    admission_to_response, update_attendant, generate_receipt_number, generate_refund_number,
    _log_activity)
from app.schemas.ipd import (
    IPDAdmissionCreate, IPDAdmissionResponse, IPDAdmissionListResponse, IPDAdmissionUpdate, IPDAttendantResponse, IPDAttendantUpdate,
    IPDTestsCreate, IPDTestsResponse, IPDTestResultUpdate,
    IPDMedicationCreate, IPDMedicationResponse, IPDMedicationUpdate,
    IPDInsuranceCreate, IPDInsuranceUpdate, IPDInsuranceResponse,
    IPDChargeCreate, IPDChargeResponse,
    IPDPaymentCreate, IPDPaymentResponse,
    IPDRefundCreate, IPDRefundResponse, IPDBillingSummary,
    IPDDischargeSummaryCreate, IPDDischargeSummaryResponse,
    IPDActivityLogResponse,
)

router = APIRouter(prefix='/ipd', tags=['ipd'])
import pytz
from sqlalchemy import func, text

def tz(): return pytz.timezone('Asia/Kolkata')

@router.get('/admissions', response_model=IPDAdmissionListResponse)
def get_admissions(status_filter: str = Query(None, alias='status'), search: str = Query(None),
                   start_date: date = Query(None), end_date: date = Query(None),
                   discharged_start: date = Query(None), discharged_end: date = Query(None),
                   recent_days: int = Query(None), view: str = Query(None),
                   limit: int = Query(100, le=200), offset: int = Query(0, ge=0),
                   db: Session = Depends(get_db)):
    return list_admissions(db, status_filter, search, start_date, end_date,
                           discharged_start, discharged_end, recent_days, view, limit, offset)

@router.post('/admissions', response_model=IPDAdmissionResponse, status_code=status.HTTP_201_CREATED)
def create_new_admission(data: IPDAdmissionCreate, db: Session = Depends(get_db)):
    try:
        adm = create_admission(db, data)
        return admission_to_response(get_admission_by_id(db, adm.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put('/admissions/{admission_id}', response_model=IPDAdmissionResponse)
def update_admission(admission_id: int, data: IPDAdmissionUpdate, db: Session = Depends(get_db)):
    adm = get_admission_by_id(db, admission_id)
    if not adm: raise HTTPException(status_code=404, detail='Admission not found')
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(adm, k, v)
    db.commit()
    _log_activity(db, admission_id, "Admission Updated", "Overview", "Admission details updated")
    return admission_to_response(get_admission_by_id(db, admission_id))

@router.get('/admissions/{admission_id}', response_model=IPDAdmissionResponse)
def get_admission(admission_id: int, db: Session = Depends(get_db)):
    adm = get_admission_by_id(db, admission_id)
    if not adm: raise HTTPException(status_code=404, detail='Admission not found')
    return admission_to_response(adm)

@router.get('/admissions/{admission_id}/attendant', response_model=IPDAttendantResponse)
def get_attendant(admission_id: int, db: Session = Depends(get_db)):
    att = db.query(IPDAttendant).filter(IPDAttendant.admission_id == admission_id).first()
    if not att: raise HTTPException(status_code=404, detail='Attendant not found')
    return att

@router.put('/admissions/{admission_id}/attendant', response_model=IPDAttendantResponse)
def update_attendant_endpoint(admission_id: int, data: IPDAttendantUpdate, db: Session = Depends(get_db)):
    att = update_attendant(db, admission_id, data)
    if not att: raise HTTPException(status_code=404)
    return att

@router.get('/admissions/{admission_id}/tests', response_model=list[IPDTestsResponse])
def list_tests(admission_id: int, db: Session = Depends(get_db)):
    return db.query(IPDTests).filter(IPDTests.admission_id == admission_id).order_by(IPDTests.ordered_datetime.desc()).all()

@router.post('/admissions/{admission_id}/tests', response_model=IPDTestsResponse, status_code=201)
def create_test(admission_id: int, data: IPDTestsCreate, db: Session = Depends(get_db)):
    test = IPDTests(admission_id=admission_id, **data.model_dump(exclude_none=True))
    test.ordered_datetime = data.ordered_datetime or datetime.now(tz())
    db.add(test); db.commit(); db.refresh(test)
    _log_activity(db, admission_id, "Test Added", "Tests", test.test_name)
    return test

@router.patch('/tests/{test_id}', response_model=IPDTestsResponse)
def update_test(test_id: int, data: IPDTestsCreate, db: Session = Depends(get_db)):
    test = db.query(IPDTests).filter(IPDTests.id == test_id).first()
    if not test: raise HTTPException(404)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(test, k, v)
    db.commit(); db.refresh(test)
    return test

@router.post('/tests/{test_id}/result', response_model=IPDTestsResponse)
def record_test_result(test_id: int, data: IPDTestResultUpdate, db: Session = Depends(get_db)):
    test = db.query(IPDTests).filter(IPDTests.id == test_id).first()
    if not test: raise HTTPException(404)
    test.result_text = data.result_text
    test.result_datetime = data.result_datetime or datetime.now(tz())
    test.result_status = data.result_status; test.status = 'Completed'
    db.commit(); db.refresh(test)
    return test

@router.get('/admissions/{admission_id}/medications', response_model=list[IPDMedicationResponse])
def list_medications(admission_id: int, db: Session = Depends(get_db)):
    return db.query(IPDMedication).filter(IPDMedication.admission_id == admission_id).order_by(IPDMedication.start_date.desc()).all()

@router.post('/admissions/{admission_id}/medications', response_model=IPDMedicationResponse, status_code=201)
def create_medication(admission_id: int, data: IPDMedicationCreate, db: Session = Depends(get_db)):
    med = IPDMedication(admission_id=admission_id, **data.model_dump(exclude_none=True))
    db.add(med); db.commit(); db.refresh(med)
    _log_activity(db, admission_id, "Medication Added", "Medications", med.medicine_name)
    return med

@router.patch('/medications/{medication_id}', response_model=IPDMedicationResponse)
def update_medication(medication_id: int, data: IPDMedicationUpdate, db: Session = Depends(get_db)):
    med = db.query(IPDMedication).filter(IPDMedication.id == medication_id).first()
    if not med: raise HTTPException(404)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(med, k, v)
    db.commit(); db.refresh(med)
    return med

@router.get('/admissions/{admission_id}/insurance', response_model=list[IPDInsuranceResponse])
def list_insurance(admission_id: int, db: Session = Depends(get_db)):
    return db.query(IPDInsurancePolicy).filter(IPDInsurancePolicy.admission_id == admission_id).all()

@router.post('/admissions/{admission_id}/insurance', response_model=IPDInsuranceResponse, status_code=201)
def create_insurance(admission_id: int, data: IPDInsuranceCreate, db: Session = Depends(get_db)):
    ins = IPDInsurancePolicy(admission_id=admission_id, **data.model_dump(exclude_none=True))
    db.add(ins); db.commit(); db.refresh(ins)
    return ins

@router.put('/admissions/{admission_id}/insurance/{policy_id}', response_model=IPDInsuranceResponse)
def update_insurance(admission_id: int, policy_id: int, data: IPDInsuranceUpdate, db: Session = Depends(get_db)):
    ins = db.query(IPDInsurancePolicy).filter(IPDInsurancePolicy.id == policy_id, IPDInsurancePolicy.admission_id == admission_id).first()
    if not ins: raise HTTPException(404)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(ins, k, v)
    db.commit(); db.refresh(ins)
    return ins

@router.get('/admissions/{admission_id}/charges', response_model=list[IPDChargeResponse])
def list_charges(admission_id: int, db: Session = Depends(get_db)):
    return db.query(IPDCharge).filter(IPDCharge.admission_id == admission_id).order_by(IPDCharge.charge_datetime.desc()).all()

@router.post('/admissions/{admission_id}/charges', response_model=IPDChargeResponse, status_code=201)
def create_charge(admission_id: int, data: IPDChargeCreate, db: Session = Depends(get_db)):
    total = data.quantity * data.unit_price
    charge = IPDCharge(admission_id=admission_id, charge_datetime=data.charge_datetime or datetime.now(tz()),
        charge_date=data.charge_date or date.today(),
        category=data.category, description=data.description, quantity=data.quantity,
        unit_price=data.unit_price, total_amount=total, notes=data.notes)
    db.add(charge); db.commit(); db.refresh(charge)
    _log_activity(db, admission_id, "Charge Added", "Billing", charge.description)
    return charge

@router.get('/admissions/{admission_id}/payments', response_model=list[IPDPaymentResponse])
def list_payments(admission_id: int, db: Session = Depends(get_db)):
    return db.query(IPDPayment).filter(IPDPayment.admission_id == admission_id).order_by(IPDPayment.payment_datetime.desc()).all()

@router.post('/admissions/{admission_id}/payments', response_model=IPDPaymentResponse, status_code=201)
def create_payment(admission_id: int, data: IPDPaymentCreate, db: Session = Depends(get_db)):
    pay = IPDPayment(admission_id=admission_id, receipt_number=generate_receipt_number(db),
        payment_datetime=data.payment_datetime or datetime.now(tz()),
        amount=data.amount, payment_mode=data.payment_mode,
        transaction_reference=data.transaction_reference, notes=data.notes)
    db.add(pay); db.commit(); db.refresh(pay)
    _log_activity(db, admission_id, "Payment Recorded", "Billing", f"{pay.receipt_number} INR {pay.amount}")
    return pay

@router.post('/admissions/{admission_id}/refunds', response_model=IPDRefundResponse, status_code=201)
def create_refund(admission_id: int, data: IPDRefundCreate, db: Session = Depends(get_db)):
    ref = IPDRefund(admission_id=admission_id, refund_number=generate_refund_number(db),
        refund_datetime=data.refund_datetime or datetime.now(tz()),
        amount=data.amount, refund_mode=data.refund_mode, reason=data.reason, payment_id=data.payment_id)
    db.add(ref); db.commit(); db.refresh(ref)
    return ref

@router.get('/admissions/{admission_id}/billing-summary', response_model=IPDBillingSummary)
def billing_summary(admission_id: int, db: Session = Depends(get_db)):
    charges = db.query(func.coalesce(func.sum(IPDCharge.total_amount), 0)).filter(IPDCharge.admission_id == admission_id).scalar()
    payments = db.query(func.coalesce(func.sum(IPDPayment.amount), 0)).filter(IPDPayment.admission_id == admission_id, IPDPayment.status == 'Successful').scalar()
    refunds = db.query(func.coalesce(func.sum(IPDRefund.amount), 0)).filter(IPDRefund.admission_id == admission_id).scalar()
    tc = float(charges or 0); tp = float(payments or 0); tr = float(refunds or 0)
    return IPDBillingSummary(total_charges=tc, total_payments=tp, total_refunds=tr, outstanding_balance=tc - tp + tr)

@router.get('/admissions/{admission_id}/discharge-summary', response_model=Optional[IPDDischargeSummaryResponse])
def get_discharge_summary(admission_id: int, db: Session = Depends(get_db)):
    return db.query(IPDDischargeSummary).filter(IPDDischargeSummary.admission_id == admission_id).first()

@router.put('/admissions/{admission_id}/discharge-summary', response_model=IPDDischargeSummaryResponse)
def save_discharge_summary(admission_id: int, data: IPDDischargeSummaryCreate, db: Session = Depends(get_db)):
    existing = db.query(IPDDischargeSummary).filter(IPDDischargeSummary.admission_id == admission_id).first()
    if existing:
        for k, v in data.model_dump(exclude_none=True).items():
            setattr(existing, k, v)
        db.commit(); db.refresh(existing)
        return existing
    ds = IPDDischargeSummary(admission_id=admission_id, **data.model_dump(exclude_none=True))
    db.add(ds); db.commit(); db.refresh(ds)
    return ds

@router.post('/admissions/{admission_id}/discharge-summary/finalize', response_model=IPDDischargeSummaryResponse)
def finalize_discharge(admission_id: int, db: Session = Depends(get_db)):
    ds = db.query(IPDDischargeSummary).filter(IPDDischargeSummary.admission_id == admission_id).first()
    if not ds: raise HTTPException(400, detail='Save a discharge summary first')
    if not ds.condition_at_discharge or not ds.discharging_doctor_id:
        raise HTTPException(400, detail='Condition at discharge and discharging doctor are required')
    if ds.status == 'Finalized': raise HTTPException(400, detail='Already finalized')
    ds.status = 'Finalized'
    ds.finalized_at = datetime.now(tz())
    adm = db.query(IPDAdmission).filter(IPDAdmission.id == admission_id).first()
    if adm:
        adm.status = 'Discharged'
        adm.discharge_datetime = ds.discharge_datetime or datetime.now(tz())
    _log_activity(db, admission_id, "Discharge Finalized", "Discharge", f"{adm.admission_number} discharged")
    db.commit(); db.refresh(ds)
    return ds

@router.get('/admissions/{admission_id}/activity', response_model=list[IPDActivityLogResponse])
def list_activity(admission_id: int, db: Session = Depends(get_db)):
    return db.query(IPDActivityLog).filter(IPDActivityLog.admission_id == admission_id).order_by(IPDActivityLog.created_at.desc()).limit(50).all()

@router.get('/payments/{payment_id}/receipt')
def get_payment_receipt(payment_id: int, db: Session = Depends(get_db)):
    """Get payment with admission context for receipt printing."""
    pay = db.query(IPDPayment).filter(IPDPayment.id == payment_id).first()
    if not pay:
        raise HTTPException(status_code=404, detail='Payment not found')
    adm = db.query(IPDAdmission).options(
        joinedload(IPDAdmission.patient), joinedload(IPDAdmission.admitting_doctor)
    ).filter(IPDAdmission.id == pay.admission_id).first()
    # Build response with all needed data
    import json
    from app.services.ipd_service import admission_to_response
    from app.schemas.ipd import IPDPaymentResponse
    pay_resp = IPDPaymentResponse.model_validate(pay)
    data = pay_resp.model_dump()
    if adm:
        data['patient_name'] = adm.patient.name if adm.patient else None
        data['patient_uhid'] = adm.patient.uhid if adm.patient else None
        data['patient_age'] = adm.patient.age if adm.patient else None
        data['patient_gender'] = adm.patient.gender if adm.patient else None
        data['admission_number'] = adm.admission_number
    return data
