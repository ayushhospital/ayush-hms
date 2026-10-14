from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field


# === Vendors ===
class PharmacyVendorCreate(BaseModel):
    vendor_name: str = Field(..., min_length=1)
    drug_license_number: str = Field(..., min_length=1)
    gst_number: str = Field(..., min_length=1)
    contact_number: str = Field(..., min_length=1)
    pincode: str = Field(..., min_length=1)
    country: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    address: str = Field(..., min_length=1)
    email: Optional[str] = None
    pancard_number: Optional[str] = None
    drug_license_file: Optional[str] = None
    gst_file: Optional[str] = None
    pancard_file: Optional[str] = None


class PharmacyVendorUpdate(BaseModel):
    vendor_name: Optional[str] = None
    drug_license_number: Optional[str] = None
    gst_number: Optional[str] = None
    contact_number: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    pancard_number: Optional[str] = None
    drug_license_file: Optional[str] = None
    gst_file: Optional[str] = None
    pancard_file: Optional[str] = None


class PharmacyVendorResponse(BaseModel):
    id: int
    vendor_name: str
    drug_license_number: str
    gst_number: str
    contact_number: str
    pincode: str
    country: str
    city: str
    address: str
    email: Optional[str] = None
    pancard_number: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# === Drugs (stock) ===
class PharmacyDrugResponse(BaseModel):
    id: int
    name: str
    drug_type: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    quantity_in_stock: float
    vendor_id: Optional[int] = None

    model_config = {"from_attributes": True}


# === Purchase Items (within a purchase entry) ===
class PharmacyPurchaseItemInput(BaseModel):
    drug_name: str = Field(..., min_length=1)
    drug_type: Optional[str] = None
    drug_type: Optional[str] = None
    strength: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: float = Field(..., gt=0)
    purchase_price: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)


class PharmacyPurchaseCreate(BaseModel):
    vendor_id: int
    invoice_number: str = Field(..., min_length=1)
    invoice_date: date
    invoice_amount: float = Field(..., ge=0)
    pay_type: str = Field(..., pattern="^(credit|cash|Credit|Cash)$")
    discount_type: str = Field(..., pattern="^(percentage|cash|Percentage|Cash)$")
    discount: float = Field(..., ge=0)
    gross_amount: float = Field(..., ge=0)
    items: list[PharmacyPurchaseItemInput]


class PharmacyPurchaseResponse(BaseModel):
    id: int
    vendor_id: int
    invoice_number: str
    invoice_date: date
    invoice_amount: float
    pay_type: str
    discount_type: str
    discount: float
    gross_amount: float
    created_at: datetime

    model_config = {"from_attributes": True}


# === Sales ===
class PharmacySaleItemInput(BaseModel):
    drug_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


class PharmacySaleCreate(BaseModel):
    customer_type: str = Field(..., pattern="^(patient|self)$")
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    phone_number: Optional[str] = None
    doctor_name: Optional[str] = None
    reference_no: Optional[str] = None
    payment_mode: Optional[str] = Field(None, pattern="^(cash|upi|card)$")
    payment_reference: Optional[str] = None
    discount_type: Optional[str] = Field(None, pattern="^(percentage|cash)$")
    discount_value: float = 0
    items: list[PharmacySaleItemInput]


class PharmacySaleItemResponse(BaseModel):
    id: int
    drug_type: Optional[str] = None
    drug_name: str
    strength: Optional[str] = None
    quantity: float
    unit_price: float
    line_total: float

    model_config = {"from_attributes": True}


class PharmacySaleResponse(BaseModel):
    id: int
    sale_number: str
    customer_type: str
    patient_name: Optional[str] = None
    phone_number: Optional[str] = None
    doctor_name: Optional[str] = None
    reference_no: Optional[str] = None
    payment_mode: Optional[str] = None
    payment_reference: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: float
    total_amount: float
    net_amount: float
    created_at: datetime
    items: list[PharmacySaleItemResponse] = []

    model_config = {"from_attributes": True}