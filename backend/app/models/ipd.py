from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class IPDAdmission(Base):
    __tablename__ = "ipd_admissions"

    id = Column(Integer, primary_key=True, index=True)
    admission_number = Column(String(20), unique=True, nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    admission_datetime = Column(DateTime(timezone=True), nullable=False)
    admission_type = Column(String(20), nullable=False)  # Planned, Emergency, Referral
    admitting_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    department = Column(String(100), nullable=True)
    reason_for_admission = Column(Text, nullable=False)
    initial_diagnosis = Column(Text, nullable=True)
    referral_source = Column(String(30), nullable=True)  # Self, Doctor, Hospital, Other
    referring_provider = Column(String(200), nullable=True)
    ward_bed = Column(String(50), nullable=True)
    admission_notes = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="Open")  # Open, Discharged
    discharge_datetime = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    patient = relationship("Patient", backref="ipd_admissions")
    admitting_doctor = relationship("Doctor", backref="ipd_admissions")
    attendant = relationship("IPDAttendant", uselist=False, back_populates="admission")


class IPDAttendant(Base):
    __tablename__ = "ipd_attendants"

    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(Integer, ForeignKey("ipd_admissions.id"), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    relation = Column(String(30), nullable=False)
    phone_number = Column(String(20), nullable=False)
    alternate_phone_number = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    admission = relationship("IPDAdmission", back_populates="attendant")