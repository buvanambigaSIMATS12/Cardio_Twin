from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import models
from database import get_db
from services import ml_service
from auth_utils import get_current_user
import shutil
import os
import uuid
import groq

def generate_ai_ecg_report(diagnosis: str, confidence: float, user: models.User):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return f"Clinical Assessment: ML detected {diagnosis} with {confidence}% confidence. Please consult a cardiologist for clinical validation."
    try:
        client = groq.Groq(api_key=api_key)
        prompt = f"""You are an expert clinical cardiologist AI assistant. A patient (Age: {user.age}, Gender: {user.gender}) just uploaded an ECG scan which our Random Forest ML classifier categorized as '{diagnosis}' with {confidence}% confidence.
Write an empathetic, professional 3-sentence clinical assessment paragraph explaining what this rhythm pattern indicates and providing 2 personalized cardiac wellness next steps. Keep it clear, informative, and medically sound."""
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        return res.choices[0].message.content
    except Exception as e:
        print("Groq ECG report error:", e)
        return f"Clinical Assessment: Scan indicates {diagnosis} ({confidence}% confidence). Recommended to verify measurements with your specialist."

router = APIRouter()

@router.post("/upload")
async def upload_ecg(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = current_user

    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"uploads/ecg/{unique_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Analyze ECG
    result = ml_service.get_ecg_diagnosis(file_path)
    heatmap_path = ml_service.generate_gradcam(file_path)
    ai_text = generate_ai_ecg_report(result["diagnosis"], result["confidence"], user)
    
    scan = models.ECGScan(
        user_id=user.id,
        image_url=file_path,
        heatmap_url=heatmap_path,
        diagnosis=result["diagnosis"],
        confidence=result["confidence"],
        ai_explanation=ai_text
    )
    db.add(scan)
    
    # Update Digital Twin baseline
    twin = models.DigitalTwin(
        user_id=user.id,

        risk_score=ml_service.get_risk_score({"diagnosis": result["diagnosis"]}),
        state_description="Post-Diagnosis"
    )
    db.add(twin)
    
    if result["diagnosis"] != "Normal":
        notif = models.Notification(
            user_id=user.id,
            type="alert",
            title="Abnormal ECG Detected",
            body=f"AI classified your recent ECG scan as {result['diagnosis']} ({result['confidence']}% confidence)."
        )
        db.add(notif)
    
    db.commit()
    db.refresh(scan)
    
    return scan

@router.get("/history")
def get_ecg_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = db.query(models.ECGScan).filter(models.ECGScan.user_id == current_user.id).order_by(models.ECGScan.scan_date.desc()).all()
    return scans

@router.get("/public/{scan_id}")
def get_public_ecg_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.ECGScan).filter(models.ECGScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    risk_map = {
        "Normal": 5,
        "Arrhythmia": 35,
        "AFib": 55,
        "VT": 75,
        "STEMI": 90
    }
    risk_score = risk_map.get(scan.diagnosis, 5)
    return {
        "id": scan.id,
        "image_url": scan.image_url,
        "heatmap_url": scan.heatmap_url,
        "diagnosis": scan.diagnosis,
        "confidence": scan.confidence,
        "ai_explanation": scan.ai_explanation,
        "scan_date": scan.scan_date.isoformat(),
        "risk_score": risk_score
    }

@router.get("/{scan_id}")
def get_ecg_scan(scan_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = db.query(models.ECGScan).filter(models.ECGScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this scan")
        
    risk_map = {
        "Normal": 5,
        "Arrhythmia": 35,
        "AFib": 55,
        "VT": 75,
        "STEMI": 90
    }
    
    risk_score = risk_map.get(scan.diagnosis, 5)
    
    result = {
        "id": scan.id,
        "image_url": scan.image_url,
        "heatmap_url": scan.heatmap_url,
        "diagnosis": scan.diagnosis,
        "confidence": scan.confidence,
        "ai_explanation": scan.ai_explanation,
        "scan_date": scan.scan_date.isoformat(),
        "risk_score": risk_score
    }
    
    return result
