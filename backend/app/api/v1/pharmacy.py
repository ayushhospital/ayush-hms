from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth_service import require_modules
from app.services.pharmacy_service import (
    list_vendors, create_vendor, get_vendor, update_vendor, delete_vendor,
    search_drugs, list_drugs_with_stock,
    create_purchase, create_sale, get_sale, list_sales,
)
from app.schemas.pharmacy import (
    PharmacyVendorCreate, PharmacyVendorUpdate, PharmacyVendorResponse,
    PharmacyDrugResponse,
    PharmacyPurchaseCreate, PharmacyPurchaseResponse,
    PharmacySaleCreate, PharmacySaleResponse,
)

router = APIRouter(prefix="/pharmacy", tags=["pharmacy"], dependencies=[Depends(require_modules("pharmacy"))])


# ---- Vendors ----
@router.get("/vendors", response_model=list[PharmacyVendorResponse])
def get_vendors(db: Session = Depends(get_db)):
    return list_vendors(db)


@router.post("/vendors", response_model=PharmacyVendorResponse, status_code=201)
def add_vendor(data: PharmacyVendorCreate, db: Session = Depends(get_db)):
    return create_vendor(db, data)


@router.put("/vendors/{vendor_id}", response_model=PharmacyVendorResponse)
def edit_vendor(vendor_id: int, data: PharmacyVendorUpdate, db: Session = Depends(get_db)):
    v = update_vendor(db, vendor_id, data)
    if not v:
        raise HTTPException(404, "Vendor not found")
    return v


@router.delete("/vendors/{vendor_id}", status_code=204)
def remove_vendor(vendor_id: int, db: Session = Depends(get_db)):
    if not delete_vendor(db, vendor_id):
        raise HTTPException(404, "Vendor not found")


# ---- Drugs ----
@router.get("/drugs", response_model=list[PharmacyDrugResponse])
def get_drugs(q: str = Query(""), db: Session = Depends(get_db)):
    return search_drugs(db, q)


# ---- Purchase ----
@router.post("/purchases", response_model=PharmacyPurchaseResponse, status_code=201)
def add_purchase(data: PharmacyPurchaseCreate, db: Session = Depends(get_db)):
    try:
        return create_purchase(db, data)
    except ValueError as e:
        raise HTTPException(400, str(e))


# ---- Sales ----
@router.post("/sales", response_model=PharmacySaleResponse, status_code=201)
def add_sale(data: PharmacySaleCreate, db: Session = Depends(get_db)):
    try:
        return create_sale(db, data)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/sales/{sale_id}", response_model=PharmacySaleResponse)
def get_sale_by_id(sale_id: int, db: Session = Depends(get_db)):
    s = get_sale(db, sale_id)
    if not s:
        raise HTTPException(404, "Sale not found")
    return s


@router.get("/sales", response_model=list[PharmacySaleResponse])
def all_sales(db: Session = Depends(get_db)):
    return list_sales(db)