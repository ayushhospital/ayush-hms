from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.schemas.ipd import IPDAdmissionCreate, IPDAdmissionResponse, IPDAdmissionListResponse, IPDAttendantResponse, IPDAttendantUpdate
from app.services.ipd_service import create_admission, get_admission_by_id, list_admissions, admission_to_response, update_attendant

router = APIRouter(prefix='/ipd', tags=['ipd'])


@router.get('/admissions', response_model=IPDAdmissionListResponse)
def get_admissions(
    status_filter: str = Query(None, alias='status'),
    search: str = Query(None),
    start_date: date = Query(None),
    end_date: date = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return list_admissions(db, status_filter, search, start_date, end_date, limit, offset)


@router.post('/admissions', response_model=IPDAdmissionResponse, status_code=status.HTTP_201_CREATED)
def create_new_admission(data: IPDAdmissionCreate, db: Session = Depends(get_db)):
    try:
        admission = create_admission(db, data)
        return admission_to_response(get_admission_by_id(db, admission.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get('/admissions/{admission_id}', response_model=IPDAdmissionResponse)
def get_admission(admission_id: int, db: Session = Depends(get_db)):
    admission = get_admission_by_id(db, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail='Admission not found')
    return admission_to_response(admission)


@router.get('/admissions/{admission_id}/attendant', response_model=IPDAttendantResponse)
def get_attendant(admission_id: int, db: Session = Depends(get_db)):
    from app.models.ipd import IPDAttendant
    admission = get_admission_by_id(db, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail='Admission not found')
    att = db.query(IPDAttendant).filter(IPDAttendant.admission_id == admission_id).first()
    if not att:
        raise HTTPException(status_code=404, detail='Attendant not found')
    return att


@router.put('/admissions/{admission_id}/attendant', response_model=IPDAttendantResponse)
def update_attendant_endpoint(admission_id: int, data: IPDAttendantUpdate, db: Session = Depends(get_db)):
    admission = get_admission_by_id(db, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail='Admission not found')
    att = update_attendant(db, admission_id, data)
    if not att:
        raise HTTPException(status_code=404, detail='Attendant not found')
    return att
