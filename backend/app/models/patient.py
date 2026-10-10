from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    uhid = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    gender = Column(String(10), nullable=False)
    age = Column(Integer, nullable=False)
    phone_number = Column(String(20), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)