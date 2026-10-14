from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, Date, ForeignKey, func
from app.core.database import Base


class PharmacyVendor(Base):
    __tablename__ = "pharmacy_vendors"
    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String(200), nullable=False)
    drug_license_number = Column(String(100), nullable=False)
    drug_license_file = Column(Text, nullable=True)  # filename or path
    gst_number = Column(String(50), nullable=False)
    gst_file = Column(Text, nullable=True)
    pancard_number = Column(String(30), nullable=True)
    pancard_file = Column(Text, nullable=True)
    contact_number = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=False)
    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class PharmacyDrug(Base):
    __tablename__ = "pharmacy_drugs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False, index=True)
    drug_type = Column(String(50), nullable=True)
    strength = Column(String(100), nullable=True)
    manufacturer = Column(String(200), nullable=True)
    batch_number = Column(String(100), nullable=True)
    expiry_date = Column(Date, nullable=True)
    purchase_price = Column(Numeric(10, 2), nullable=True)
    selling_price = Column(Numeric(10, 2), nullable=True)
    quantity_in_stock = Column(Numeric(10, 0), nullable=False, default=0)
    vendor_id = Column(Integer, ForeignKey("pharmacy_vendors.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class PharmacyPurchase(Base):
    __tablename__ = "pharmacy_purchases"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("pharmacy_vendors.id"), nullable=False)
    invoice_number = Column(String(100), nullable=False)
    invoice_date = Column(Date, nullable=False)
    invoice_amount = Column(Numeric(12, 2), nullable=False)
    pay_type = Column(String(20), nullable=False)  # credit / cash
    discount_type = Column(String(20), nullable=False)  # percentage / cash
    discount = Column(Numeric(10, 2), nullable=False, default=0)
    gross_amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    vendor = None  # relationship placeholder


class PharmacyPurchaseItem(Base):
    __tablename__ = "pharmacy_purchase_items"
    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("pharmacy_purchases.id"), nullable=False, index=True)
    drug_name = Column(String(300), nullable=False)
    drug_type = Column(String(50), nullable=True)
    strength = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=True)
    expiry_date = Column(Date, nullable=True)
    quantity = Column(Numeric(10, 0), nullable=False)
    purchase_price = Column(Numeric(10, 2), nullable=False)
    selling_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PharmacySale(Base):
    __tablename__ = "pharmacy_sales"
    id = Column(Integer, primary_key=True, index=True)
    sale_number = Column(String(20), unique=True, nullable=False, index=True)
    customer_type = Column(String(20), nullable=False)  # patient / self
    patient_id = Column(Integer, nullable=True)
    patient_name = Column(String(200), nullable=True)
    phone_number = Column(String(20), nullable=True)
    doctor_name = Column(String(100), nullable=True)
    reference_no = Column(String(100), nullable=True)  # consultation no / IP no / manual
    discount_type = Column(String(20), nullable=True)  # percentage / cash / null
    discount_value = Column(Numeric(10, 2), nullable=True, default=0)
    total_amount = Column(Numeric(12, 2), nullable=False)
    net_amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PharmacySaleItem(Base):
    __tablename__ = "pharmacy_sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("pharmacy_sales.id"), nullable=False, index=True)
    drug_id = Column(Integer, ForeignKey("pharmacy_drugs.id"), nullable=True)
    drug_name = Column(String(300), nullable=False)
    strength = Column(String(100), nullable=True)
    quantity = Column(Numeric(10, 0), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)