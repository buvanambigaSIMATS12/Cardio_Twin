from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from database import get_db
from services import ml_service
from auth_utils import get_current_user
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    twin = db.query(models.DigitalTwin).filter(
        models.DigitalTwin.user_id == current_user.id
    ).order_by(models.DigitalTwin.recorded_at.desc()).first()

    vitals = db.query(models.Vital).filter(
        models.Vital.user_id == current_user.id
    ).order_by(models.Vital.recorded_at.desc()).first()

    health_profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == current_user.id
    ).first()

    # Real BP from last logged vitals
    bp = f"{vitals.systolic_bp}/{vitals.diastolic_bp}" if (vitals and vitals.systolic_bp and vitals.diastolic_bp) else "--/--"
    # Real blood sugar from last logged vitals
    blood_sugar = f"{vitals.blood_sugar} mg/dL" if (vitals and vitals.blood_sugar) else "--"
    # Real diabetes flag from health profile
    diabetes = "Yes" if (health_profile and health_profile.history_diabetes) else "No"

    risk_score = twin.risk_score if twin else 15.0
    health_score = max(0, min(100, 100 - int(risk_score)))
    
    name = current_user.full_name or "User"
    initials = "".join([n[0].upper() for n in name.split() if n])[:2] if name else "U"

    return {
        "name": name,
        "initials": initials,
        "health_score": health_score,
        "cardiac_risk": risk_score,
        "bp": bp,
        "blood_sugar": blood_sugar,
        "diabetes": diabetes,
    }

@router.get("/detail")
def get_digital_twin(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    twin = db.query(models.DigitalTwin).filter(
        models.DigitalTwin.user_id == current_user.id
    ).order_by(models.DigitalTwin.recorded_at.desc()).first()

    if not twin:
        # Create baseline using real vitals if available
        vitals = db.query(models.Vital).filter(
            models.Vital.user_id == current_user.id
        ).order_by(models.Vital.recorded_at.desc()).first()

        base_risk = 15.0
        if vitals:
            if vitals.systolic_bp and vitals.systolic_bp > 140:
                base_risk += 15.0
            if vitals.blood_sugar and vitals.blood_sugar > 126:
                base_risk += 10.0
            if vitals.spo2 and vitals.spo2 < 95:
                base_risk += 10.0

        twin = models.DigitalTwin(
            user_id=current_user.id,
            risk_score=round(base_risk, 1),
            state_description="Baseline"
        )
        db.add(twin)
        db.commit()
        db.refresh(twin)

    return twin

class SimulateRequest(BaseModel):
    sleep_hours: float
    weight_kg: float
    med_adherence: float

@router.post("/simulate")
def simulate_twin(req: SimulateRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get the user's real latest vitals to use as baseline
    vitals = db.query(models.Vital).filter(
        models.Vital.user_id == current_user.id
    ).order_by(models.Vital.recorded_at.desc()).first()

    health_profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == current_user.id
    ).first()

    # Start with real baseline risk derived from vitals
    base_risk = 10.0

    if vitals:
        if vitals.systolic_bp and vitals.systolic_bp > 140:
            base_risk += 20.0
        elif vitals.systolic_bp and vitals.systolic_bp > 120:
            base_risk += 8.0
        if vitals.blood_sugar and vitals.blood_sugar > 126:
            base_risk += 15.0
        elif vitals.blood_sugar and vitals.blood_sugar > 100:
            base_risk += 5.0
        if vitals.spo2 and vitals.spo2 < 95:
            base_risk += 12.0
        if vitals.heart_rate and vitals.heart_rate > 100:
            base_risk += 8.0

    if health_profile:
        if health_profile.history_high_bp:
            base_risk += 10.0
        if health_profile.history_diabetes:
            base_risk += 10.0
        if health_profile.history_smoking:
            base_risk += 15.0

    # Apply lifestyle simulation adjustments
    if req.sleep_hours < 6:
        base_risk += (6 - req.sleep_hours) * 3.0
    elif req.sleep_hours >= 7:
        base_risk -= (req.sleep_hours - 7) * 1.5

    if req.weight_kg > 90:
        base_risk += (req.weight_kg - 90) * 0.5
    elif req.weight_kg < 70:
        base_risk -= (70 - req.weight_kg) * 0.3

    if req.med_adherence < 80:
        base_risk += (80 - req.med_adherence) * 0.4
    elif req.med_adherence >= 95:
        base_risk -= 5.0

    simulated_risk = round(max(5.0, min(99.0, base_risk)), 1)
    return {"simulated_risk_score": simulated_risk}

@router.get("/timeline")
def get_twin_timeline(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    twins = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.asc()).all()
    return twins

@router.get("/insights")
def get_twin_insights(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    twin = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.desc()).first()
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).first()
    health_profile = db.query(models.HealthProfile).filter(models.HealthProfile.user_id == current_user.id).first()

    risk_score = twin.risk_score if twin else 15.0
    health_score = max(0, min(100, 100 - int(risk_score)))
    latest_bp = f"{vitals.systolic_bp}/{vitals.diastolic_bp}" if vitals and vitals.systolic_bp and vitals.diastolic_bp else "--/--"
    
    risk_factors = {
        "high_bp": health_profile.history_high_bp if health_profile else False,
        "diabetes": health_profile.history_diabetes if health_profile else False,
        "smoking": health_profile.history_smoking if health_profile else False,
        "activity_level": health_profile.activity_level if health_profile else "Sedentary"
    }
    
    age = current_user.age or 35
    age_group = f"{(age // 10) * 10}-{(age // 10) * 10 + 10}"

    return {
        "risk_score": risk_score,
        "population_avg_risk": 35.0,
        "health_score": health_score,
        "population_avg_health": 72,
        "latest_bp": latest_bp,
        "risk_factors": risk_factors,
        "age_group": age_group
    }
