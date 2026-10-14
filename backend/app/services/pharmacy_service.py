from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.models.pharmacy import (
    PharmacyVendor, PharmacyDrug, PharmacyPurchase,
    PharmacyPurchaseItem, PharmacySale, PharmacySaleItem,
)
from app.schemas.pharmacy import PharmacyVendorCreate, PharmacyVendorUpdate

# ---- Vendors ----

def list_vendors(db: Session) -> list[PharmacyVendor]:
    return db.query(PharmacyVendor).order_by(PharmacyVendor.vendor_name).all()

def get_vendor(db: Session, vendor_id: int) -> Optional[PharmacyVendor]:
    return db.query(PharmacyVendor).filter(PharmacyVendor.id == vendor_id).first()

def create_vendor(db: Session, data: PharmacyVendorCreate) -> PharmacyVendor:
    v = PharmacyVendor(**data.model_dump())
    db.add(v); db.commit(); db.refresh(v)
    return v

def update_vendor(db: Session, vendor_id: int, data: PharmacyVendorUpdate) -> Optional[PharmacyVendor]:
    v = get_vendor(db, vendor_id)
    if not v: return None
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(v, key, val)
    db.commit(); db.refresh(v)
    return v

def delete_vendor(db: Session, vendor_id: int) -> bool:
    v = get_vendor(db, vendor_id)
    if not v: return False
    db.delete(v); db.commit()
    return True

# ---- Drugs ----

def search_drugs(db: Session, q: str = "", vendor_id: Optional[int] = None) -> list[PharmacyDrug]:
    qry = db.query(PharmacyDrug)
    if q:
        qry = qry.filter(PharmacyDrug.name.ilike(f"%{q}%"))
    if vendor_id:
        qry = qry.filter(PharmacyDrug.vendor_id == vendor_id)
    return qry.order_by(PharmacyDrug.name).all()

def get_drug(db: Session, drug_id: int) -> Optional[PharmacyDrug]:
    return db.query(PharmacyDrug).filter(PharmacyDrug.id == drug_id).first()

def list_drugs_with_stock(db: Session) -> list[PharmacyDrug]:
    return db.query(PharmacyDrug).order_by(PharmacyDrug.name).all()

# ---- Purchase (adds stock) ----

def create_purchase(db: Session, data) -> PharmacyPurchase:
    purchase = PharmacyPurchase(
        vendor_id=data.vendor_id,
        invoice_number=data.invoice_number,
        invoice_date=data.invoice_date,
        invoice_amount=data.invoice_amount,
        pay_type=data.pay_type.lower(),
        discount_type=data.discount_type.lower(),
        discount=data.discount,
        gross_amount=data.gross_amount,
    )
    db.add(purchase); db.flush()
    for item in data.items:
        pi = PharmacyPurchaseItem(
            purchase_id=purchase.id, drug_name=item.drug_name,
            drug_type=item.drug_type,
            strength=item.strength, batch_number=item.batch_number,
            expiry_date=item.expiry_date, quantity=item.quantity,
            purchase_price=item.purchase_price, selling_price=item.selling_price,
        )
        db.add(pi)
        existing = db.query(PharmacyDrug).filter(
            PharmacyDrug.name == item.drug_name,
            PharmacyDrug.strength == item.strength,
            PharmacyDrug.vendor_id == data.vendor_id,
        ).first()
        if existing:
            existing.quantity_in_stock += item.quantity
            existing.purchase_price = item.purchase_price
            existing.selling_price = item.selling_price
        else:
            db.add(PharmacyDrug(
                name=item.drug_name, drug_type=item.drug_type, strength=item.strength,
                batch_number=item.batch_number, expiry_date=item.expiry_date,
                purchase_price=item.purchase_price, selling_price=item.selling_price,
                quantity_in_stock=item.quantity, vendor_id=data.vendor_id,
            ))
    db.commit(); db.refresh(purchase)
    return purchase

# ---- Sale ----
SALE_PREFIX = "PH-"

def _next_sale_no(db: Session) -> str:
    last = db.query(PharmacySale).order_by(PharmacySale.id.desc()).first()
    n = (last.id + 1) if last else 1
    return f"{SALE_PREFIX}{n:06d}"

def create_sale(db: Session, data) -> PharmacySale:
    sale_number = _next_sale_no(db)
    total_amount = 0.0
    items_data = []
    for item in data.items:
        drug = get_drug(db, item.drug_id)
        if not drug:
            raise ValueError(f"Drug #{item.drug_id} not found")
        if drug.quantity_in_stock < item.quantity:
            raise ValueError(f"Insufficient stock for '{drug.name}'")
        lt = item.quantity * item.unit_price
        total_amount += lt
        items_data.append({"drug_id": item.drug_id, "drug_name": drug.name,
            "strength": drug.strength, "quantity": item.quantity,
            "unit_price": item.unit_price, "line_total": lt})
        drug.quantity_in_stock -= item.quantity
    disc = data.discount_value or 0
    net = total_amount
    if data.discount_type == "percentage":
        net = total_amount * (100 - disc) / 100
    elif data.discount_type == "cash":
        net = max(0, total_amount - disc)
    sale = PharmacySale(
        sale_number=sale_number, customer_type=data.customer_type,
        patient_id=data.patient_id, patient_name=data.patient_name,
        phone_number=data.phone_number, doctor_name=data.doctor_name,
        discount_type=data.discount_type, discount_value=disc,
        total_amount=round(total_amount, 2), net_amount=round(net, 2),
    )
    db.add(sale); db.flush()
    for sd in items_data:
        db.add(PharmacySaleItem(sale_id=sale.id, **sd))
    db.commit(); db.refresh(sale)
    sale.items = db.query(PharmacySaleItem).filter(PharmacySaleItem.sale_id == sale.id).all()
    return sale

def get_sale(db: Session, sale_id: int) -> Optional[PharmacySale]:
    s = db.query(PharmacySale).filter(PharmacySale.id == sale_id).first()
    if s:
        s.items = db.query(PharmacySaleItem).filter(PharmacySaleItem.sale_id == s.id).all()
    return s

def list_sales(db: Session, limit: int = 50) -> list[PharmacySale]:
    return db.query(PharmacySale).order_by(PharmacySale.id.desc()).limit(limit).all()
