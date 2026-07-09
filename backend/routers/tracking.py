from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
from database import get_db
from auth_utils import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter()

class VitalCreate(BaseModel):
    systolic_bp: int
    diastolic_bp: int
    heart_rate: int
    spo2: Optional[int] = None
    blood_sugar: Optional[int] = None

@router.post("/vitals")
def add_vital(vital: VitalCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_vital = models.Vital(
        user_id=current_user.id,
        **vital.dict()
    )
    db.add(new_vital)
    
    if vital.systolic_bp > 140 or vital.diastolic_bp > 90:
        alert = models.Notification(
            user_id=current_user.id,
            type="alert",
            title="Elevated Blood Pressure",
            body=f"Your recent BP reading ({vital.systolic_bp}/{vital.diastolic_bp} mmHg) is elevated. Please rest and recheck."
        )
        db.add(alert)
    elif vital.blood_sugar and vital.blood_sugar > 180:
        alert = models.Notification(
            user_id=current_user.id,
            type="alert",
            title="High Blood Glucose Alert",
            body=f"Your recent blood sugar level ({vital.blood_sugar} mg/dL) is above the target range."
        )
        db.add(alert)
        
    db.commit()
    db.refresh(new_vital)
    return new_vital

@router.get("/vitals")
def get_vitals(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).all()
    return vitals

@router.get("/weekly-summary")
def get_weekly_summary(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # Fetch all vitals from the last 7 days
    vitals_this_week = db.query(models.Vital).filter(
        models.Vital.user_id == current_user.id,
        models.Vital.recorded_at >= week_ago
    ).order_by(models.Vital.recorded_at.asc()).all()

    # Fetch previous week's vitals for comparison
    two_weeks_ago = now - timedelta(days=14)
    vitals_last_week = db.query(models.Vital).filter(
        models.Vital.user_id == current_user.id,
        models.Vital.recorded_at >= two_weeks_ago,
        models.Vital.recorded_at < week_ago
    ).all()

    # Fetch ECG scans from this week
    ecg_this_week = db.query(models.ECGScan).filter(
        models.ECGScan.user_id == current_user.id,
        models.ECGScan.scan_date >= week_ago
    ).all()

    # Fetch Digital Twin risk scores for the 7 day trend
    twin_records = db.query(models.DigitalTwin).filter(
        models.DigitalTwin.user_id == current_user.id,
        models.DigitalTwin.recorded_at >= week_ago
    ).order_by(models.DigitalTwin.recorded_at.asc()).all()

    # Calculate avg BP this week
    avg_systolic, avg_diastolic = None, None
    if vitals_this_week:
        avg_systolic = round(sum(v.systolic_bp for v in vitals_this_week) / len(vitals_this_week))
        avg_diastolic = round(sum(v.diastolic_bp for v in vitals_this_week) / len(vitals_this_week))

    # Fetch the current twin (for health score)
    twin = db.query(models.DigitalTwin).filter(
        models.DigitalTwin.user_id == current_user.id
    ).order_by(models.DigitalTwin.recorded_at.desc()).first()

    current_risk = twin.risk_score if twin else 15.0
    health_score = max(0, min(100, 100 - int(current_risk)))

    # Get previous week's health score
    prev_twin = db.query(models.DigitalTwin).filter(
        models.DigitalTwin.user_id == current_user.id,
        models.DigitalTwin.recorded_at < week_ago
    ).order_by(models.DigitalTwin.recorded_at.desc()).first()
    prev_health_score = (100 - int(prev_twin.risk_score)) if prev_twin else health_score
    health_score_delta = health_score - prev_health_score

    # Build 7-day risk trend from twin records (one per day)
    day_labels = ["MON","TUE","WED","THU","FRI","SAT","SUN"]
    risk_trend = []
    for i in range(7):
        day = week_ago + timedelta(days=i)
        day_end = day + timedelta(days=1)
        record = next((t for t in twin_records if day <= t.recorded_at < day_end), None)
        risk_trend.append({
            "day": day_labels[day.weekday()],
            "risk": round(record.risk_score) if record else None
        })

    # Determine ECG scan summary
    ecg_count = len(ecg_this_week)
    ecg_abnormal = sum(1 for e in ecg_this_week if "normal" not in e.diagnosis.lower())
    ecg_status = "Abnormal" if ecg_abnormal > 0 else ("Normal" if ecg_count > 0 else "None")

    # Med adherence: approximate from how many days vitals were logged vs 7
    days_logged = len(set(v.recorded_at.date() for v in vitals_this_week))
    med_adherence_pct = round((days_logged / 7) * 100)

    bp_label = "High" if (avg_systolic and avg_systolic > 140) else \
               "Elevated" if (avg_systolic and avg_systolic > 120) else \
               "Normal" if avg_systolic else "No data"

    trend_direction = "IMPROVING" if health_score_delta >= 0 else "DECLINING"

    return {
        "week_start": week_ago.strftime("%b %d"),
        "week_end": now.strftime("%b %d, %Y"),
        "health_score": health_score,
        "health_score_delta": health_score_delta,
        "health_label": "Good" if health_score >= 80 else "Moderate" if health_score >= 60 else "At Risk",
        "avg_bp": f"{avg_systolic}/{avg_diastolic}" if avg_systolic else "--/--",
        "bp_label": bp_label,
        "ecg_count": ecg_count,
        "ecg_status": ecg_status,
        "med_adherence": med_adherence_pct,
        "med_label": "On Track" if med_adherence_pct >= 80 else "Needs Attention",
        "days_logged": days_logged,
        "risk_trend": risk_trend,
        "trend_direction": trend_direction,
    }

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    start_date: Optional[datetime] = None
    notes: Optional[str] = None

@router.get("/medications")
def get_medications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    meds = db.query(models.Medication).filter(
        models.Medication.user_id == current_user.id,
        models.Medication.active == True
    ).all()
    
    today = datetime.utcnow().date()
    result = []
    for med in meds:
        # Check if taken today
        taken_today = db.query(models.MedicationLog).filter(
            models.MedicationLog.medication_id == med.id,
            models.MedicationLog.taken_at >= datetime.combine(today, datetime.min.time())
        ).first() is not None
        
        result.append({
            "id": med.id,
            "name": med.name,
            "dosage": med.dosage,
            "frequency": med.frequency,
            "start_date": med.start_date.isoformat() if med.start_date else None,
            "taken_today": taken_today
        })
    return result

@router.post("/medications")
def add_medication(med: MedicationCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_med = models.Medication(
        user_id=current_user.id,
        name=med.name,
        dosage=med.dosage,
        frequency=med.frequency,
        start_date=med.start_date
    )
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    return new_med

@router.delete("/medications/{id}")
def delete_medication(id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    med = db.query(models.Medication).filter(
        models.Medication.id == id,
        models.Medication.user_id == current_user.id
    ).first()
    if med:
        med.active = False
        db.commit()
    return {"message": "Medication deleted"}

@router.post("/medications/{id}/taken")
def mark_medication_taken(id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    med = db.query(models.Medication).filter(
        models.Medication.id == id,
        models.Medication.user_id == current_user.id
    ).first()
    if not med:
        return {"message": "Medication not found"}
        
    log = models.MedicationLog(
        medication_id=id,
        user_id=current_user.id
    )
    db.add(log)
    db.commit()
    return {"message": "Marked as taken"}

@router.get("/medications/adherence")
def get_medication_adherence(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    meds = db.query(models.Medication).filter(
        models.Medication.user_id == current_user.id,
        models.Medication.active == True
    ).all()
    
    if not meds:
        return {"today_adherence": 100.0, "weekly_adherence": 100.0}
        
    today = datetime.utcnow().date()
    taken_count = 0
    for med in meds:
        taken = db.query(models.MedicationLog).filter(
            models.MedicationLog.medication_id == med.id,
            models.MedicationLog.taken_at >= datetime.combine(today, datetime.min.time())
        ).first()
        if taken:
            taken_count += 1
            
    today_adherence = (taken_count / len(meds)) * 100
    return {"today_adherence": today_adherence, "weekly_adherence": today_adherence}

class SymptomCreate(BaseModel):
    symptoms: list[str]
    severity: int
    notes: Optional[str] = None

@router.post("/symptoms")
def log_symptoms(symp: SymptomCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = models.SymptomLog(
        user_id=current_user.id,
        symptoms=",".join(symp.symptoms),
        severity=symp.severity,
        notes=symp.notes
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/symptoms")
def get_symptoms(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id
    ).order_by(models.SymptomLog.logged_at.desc()).limit(30).all()
    return logs

@router.get("/streak")
def get_streak(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).all()
    
    if not vitals:
        return {"current_streak": 0, "longest_streak": 0, "last_logged": None}
    
    logged_dates = sorted(list(set([v.recorded_at.date() for v in vitals])), reverse=True)
    today = datetime.utcnow().date()
    
    current_streak = 0
    if logged_dates and (logged_dates[0] == today or logged_dates[0] == today - timedelta(days=1)):
        current_streak = 1
        for i in range(1, len(logged_dates)):
            if logged_dates[i] == logged_dates[i-1] - timedelta(days=1):
                current_streak += 1
            else:
                break
                
    temp_streak = 1 if logged_dates else 0
    longest_streak = temp_streak
    for i in range(1, len(logged_dates)):
        if logged_dates[i] == logged_dates[i-1] - timedelta(days=1):
            temp_streak += 1
        else:
            temp_streak = 1
        longest_streak = max(longest_streak, temp_streak)
        
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_logged": logged_dates[0] if logged_dates else None
    }

@router.get("/achievements")
def get_achievements(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).all()
    logged_dates = sorted(list(set([v.recorded_at.date() for v in vitals])), reverse=True)
    today = datetime.utcnow().date()
    
    current_streak = 0
    if logged_dates and (logged_dates[0] == today or logged_dates[0] == today - timedelta(days=1)):
        current_streak = 1
        for i in range(1, len(logged_dates)):
            if logged_dates[i] == logged_dates[i-1] - timedelta(days=1):
                current_streak += 1
            else:
                break
                
    ecg_count = db.query(models.ECGScan).filter(models.ECGScan.user_id == current_user.id).count()
    
    normal_bp_count = sum(1 for v in vitals if v.systolic_bp and 90 <= v.systolic_bp <= 120)
            
    med_logs = db.query(models.MedicationLog).filter(models.MedicationLog.user_id == current_user.id).order_by(models.MedicationLog.taken_at.desc()).all()
    med_dates = sorted(list(set([m.taken_at.date() for m in med_logs])), reverse=True)
    
    med_streak = 0
    if med_dates and (med_dates[0] == today or med_dates[0] == today - timedelta(days=1)):
        med_streak = 1
        for i in range(1, len(med_dates)):
            if med_dates[i] == med_dates[i-1] - timedelta(days=1):
                med_streak += 1
            else:
                break

    return [
        {
            "id": "first_scan",
            "name": "First Scan",
            "description": "Uploaded your first ECG",
            "icon": "Stethoscope",
            "earned": ecg_count >= 1,
            "earned_at": datetime.utcnow().isoformat() if ecg_count >= 1 else None
        },
        {
            "id": "heart_warrior",
            "name": "Heart Warrior",
            "description": "7-day logging streak",
            "icon": "Flame",
            "earned": current_streak >= 7,
            "earned_at": datetime.utcnow().isoformat() if current_streak >= 7 else None
        },
        {
            "id": "iron_heart",
            "name": "Iron Heart",
            "description": "30-day logging streak",
            "icon": "Shield",
            "earned": current_streak >= 30,
            "earned_at": datetime.utcnow().isoformat() if current_streak >= 30 else None
        },
        {
            "id": "bp_pro",
            "name": "Blood Pressure Pro",
            "description": "5 normal BP readings",
            "icon": "Activity",
            "earned": normal_bp_count >= 5,
            "earned_at": datetime.utcnow().isoformat() if normal_bp_count >= 5 else None
        },
        {
            "id": "ecg_explorer",
            "name": "ECG Explorer",
            "description": "Completed 3 ECG scans",
            "icon": "Activity",
            "earned": ecg_count >= 3,
            "earned_at": datetime.utcnow().isoformat() if ecg_count >= 3 else None
        },
        {
            "id": "med_master",
            "name": "Medication Master",
            "description": "7 days of medication logs",
            "icon": "Pill",
            "earned": med_streak >= 7,
            "earned_at": datetime.utcnow().isoformat() if med_streak >= 7 else None
        }
    ]

class EmergencyContactCreate(BaseModel):
    name: str
    relationship: str
    phone: str

@router.get("/emergency-contacts")
def get_emergency_contacts(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    contacts = db.query(models.EmergencyContact).filter(models.EmergencyContact.user_id == current_user.id).all()
    return contacts

@router.post("/emergency-contacts")
def create_emergency_contact(contact: EmergencyContactCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_contact = models.EmergencyContact(
        user_id=current_user.id,
        name=contact.name,
        relationship=contact.relationship,
        phone=contact.phone
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@router.delete("/emergency-contacts/{id}")
def delete_emergency_contact(id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    contact = db.query(models.EmergencyContact).filter(
        models.EmergencyContact.id == id,
        models.EmergencyContact.user_id == current_user.id
    ).first()
    if contact:
        db.delete(contact)
        db.commit()
    return {"message": "Emergency contact deleted"}

@router.get("/history")
def get_activity_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    activities = []
    
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).all()
    for v in vitals:
        activities.append({
            "id": f"vital_{v.id}",
            "type": "vital",
            "title": "Logged Vitals",
            "description": f"BP: {v.systolic_bp}/{v.diastolic_bp}, HR: {v.heart_rate} bpm",
            "timestamp": v.recorded_at.isoformat()
        })
        
    symptoms = db.query(models.SymptomLog).filter(models.SymptomLog.user_id == current_user.id).all()
    for s in symptoms:
        activities.append({
            "id": f"symp_{s.id}",
            "type": "symptom",
            "title": "Logged Symptoms",
            "description": s.symptoms,
            "timestamp": s.logged_at.isoformat()
        })
        
    med_logs = db.query(models.MedicationLog).filter(models.MedicationLog.user_id == current_user.id).all()
    for m in med_logs:
        med_name = m.medication.name if m.medication else "Medication"
        activities.append({
            "id": f"medlog_{m.id}",
            "type": "medication",
            "title": "Took Medication",
            "description": med_name,
            "timestamp": m.taken_at.isoformat()
        })
        
    ecgs = db.query(models.ECGScan).filter(models.ECGScan.user_id == current_user.id).all()
    for e in ecgs:
        activities.append({
            "id": f"ecg_{e.id}",
            "type": "ecg",
            "title": "Uploaded ECG Scan",
            "description": f"Diagnosis: {e.diagnosis}",
            "timestamp": e.scan_date.isoformat()
        })
        
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities
