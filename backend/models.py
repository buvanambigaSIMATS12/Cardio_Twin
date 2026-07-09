from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    reset_otp = Column(String, nullable=True)
    reset_otp_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    health_profile = relationship("HealthProfile", back_populates="user", uselist=False)
    ecg_scans = relationship("ECGScan", back_populates="user")
    digital_twins = relationship("DigitalTwin", back_populates="user")
    medications = relationship("Medication", back_populates="user")
    vitals = relationship("Vital", back_populates="user")

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    history_high_bp = Column(Boolean, default=False)
    history_diabetes = Column(Boolean, default=False)
    history_smoking = Column(Boolean, default=False)
    family_history_heart = Column(Boolean, default=False)
    activity_level = Column(String, nullable=True)
    
    user = relationship("User", back_populates="health_profile")

class ECGScan(Base):
    __tablename__ = "ecg_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String)
    heatmap_url = Column(String, nullable=True)
    diagnosis = Column(String)
    confidence = Column(Float)
    ai_explanation = Column(String, nullable=True)
    scan_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ecg_scans")

class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    risk_score = Column(Float)
    state_description = Column(String) # "Baseline", "Post-Diagnosis", "Under Treatment"
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="digital_twins")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    start_date = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)

    user = relationship("User", back_populates="medications")
    logs = relationship("MedicationLog", back_populates="medication")

class MedicationLog(Base):
    __tablename__ = "medication_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    taken_at = Column(DateTime, default=datetime.utcnow)
    
    medication = relationship("Medication", back_populates="logs")

class SymptomLog(Base):
    __tablename__ = "symptom_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symptoms = Column(String)  # comma-separated
    severity = Column(Integer)
    notes = Column(String, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    relationship = Column(String)
    phone = Column(String)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)
    title = Column(String)
    body = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vital(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    systolic_bp = Column(Integer)
    diastolic_bp = Column(Integer)
    heart_rate = Column(Integer)
    spo2 = Column(Integer, nullable=True)
    blood_sugar = Column(Integer, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="vitals")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, nullable=True, index=True)
    name = Column(String)
    specialty = Column(String)
    hospital = Column(String)
    rating = Column(Float)
    reviews = Column(Integer)
    distance = Column(String)
    image = Column(String, nullable=True)
    experience_years = Column(Integer, default=10)
    availability = Column(String, default="Available Today")
    fee = Column(String, default="$150")
    about = Column(String, nullable=True)
    languages = Column(String, default="English, Regional")
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    doctor_reviews = relationship("DoctorReview", back_populates="doctor")

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)
    distance = Column(String)
    time = Column(String)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

class DoctorReview(Base):
    __tablename__ = "doctor_reviews"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    patient_name = Column(String)
    rating = Column(Integer, default=5)
    review_text = Column(String)
    review_date = Column(String, default="Recent")

    doctor = relationship("Doctor", back_populates="doctor_reviews")

