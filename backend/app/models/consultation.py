from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    consultation_number = Column(String(20), unique=True, nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    consultation_date = Column(DateTime(timezone=True), nullable=False)
    visit_type = Column(String(10), nullable=False)  # "New" or "Follow-up"
    fee_amount = Column(Numeric(10, 2), nullable=False, default=0)
    payment_mode = Column(String(10), nullable=False)  # "Cash" or "UPI"
    payment_status = Column(String(20), nullable=False, default="Paid")  # Paid, Pending, Cancelled
    valid_until = Column(DateTime(timezone=True), nullable=False)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    patient = relationship("Patient", backref="consultations")
    doctor = relationship("Doctor", backref="consultations")