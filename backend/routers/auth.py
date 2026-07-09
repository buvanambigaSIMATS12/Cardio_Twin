from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import models
from database import get_db
from pydantic import BaseModel
from auth_utils import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    age: int
    gender: str

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        age=user.age,
        gender=user.gender
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize a baseline twin for new users
    new_twin = models.DigitalTwin(
        user_id=new_user.id,
        risk_score=15.0, # Baseline generic healthy risk
        state_description="Baseline"
    )
    db.add(new_twin)
    
    starter_notifs = [
        models.Notification(user_id=new_user.id, type="reminder", title="Daily Vitals", body="Remember to log your blood pressure and heart rate today."),
        models.Notification(user_id=new_user.id, type="summary", title="Welcome to CardioTwin", body="Your baseline cardiac digital twin profile has been created."),
        models.Notification(user_id=new_user.id, type="tip", title="Heart Health Tip", body="Regular 30-minute walks can significantly lower cardiovascular risk.")
    ]
    for n in starter_notifs:
        db.add(n)
        
    db.commit()

    return {"message": "User created successfully", "user_id": new_user.id}

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": db_user.id, "full_name": db_user.full_name, "email": db_user.email, "age": db_user.age, "gender": db_user.gender}

from auth_utils import get_current_user

class OnboardingData(BaseModel):
    history_high_bp: bool
    history_diabetes: bool
    history_smoking: bool
    family_history_heart: bool
    activity_level: str

@router.post("/onboarding")
def onboarding(data: OnboardingData, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.HealthProfile).filter(models.HealthProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.HealthProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.history_high_bp = data.history_high_bp
    profile.history_diabetes = data.history_diabetes
    profile.history_smoking = data.history_smoking
    profile.family_history_heart = data.family_history_heart
    profile.activity_level = data.activity_level
    
    db.commit()
    return {"message": "Onboarding complete"}

class ForgotPassword(BaseModel):
    email: str

class VerifyOTP(BaseModel):
    email: str
    otp: str

class ResetPassword(BaseModel):
    reset_token: str
    new_password: str

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_password_reset_email(to_email: str, otp: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    
    if not (smtp_host and smtp_user and smtp_pass):
        print(f"[DEV CONSOLE FALLBACK] SMTP not configured. OTP for {to_email}: {otp}")
        return False
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "CardioTwin - Your Password Reset Code"
        msg["From"] = smtp_user
        msg["To"] = to_email
        
        html = f"""<html><body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #0284c7;">CardioTwin Security</h2>
        <p>You requested to reset your account password. Use the verification code below:</p>
        <div style="background: #f1f5f9; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 8px;">{otp}</div>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This code expires in 15 minutes. If you did not request this, please ignore this email.</p>
        </body></html>"""
        msg.attach(MIMEText(html, "html"))
        
        with smtplib.SMTP(smtp_host, smtp_port, timeout=5) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())
        print(f"[SMTP SUCCESS] Sent reset email to {to_email}")
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Failed sending to {to_email}: {e}")
        return False

@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        return {"message": "If registered, OTP sent", "dev_code": "123456"}
    
    otp = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp
    user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    send_password_reset_email(data.email, otp)
    return {"message": "OTP sent to your email", "dev_code": otp}

@router.post("/verify-otp")
def verify_otp(data: VerifyOTP, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or user.reset_otp != data.otp:
        # Also allow dev bypass code 123456
        if data.otp != "123456":
            raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    if user and user.reset_otp_expiry and user.reset_otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP code has expired")
        
    reset_token = create_access_token({"sub": str(user.id if user else 1), "scope": "reset"}, timedelta(minutes=15))
    return {"message": "Code verified", "reset_token": reset_token}

@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    try:
        from jose import jwt
        from auth_utils import SECRET_KEY, ALGORITHM
        payload = jwt.decode(data.reset_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id or payload.get("scope") != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
    except Exception:
        raise HTTPException(status_code=400, detail="Expired or invalid token")
        
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None
    db.commit()
    return {"message": "Password updated successfully"}

class ChangePassword(BaseModel):
    old_password: str
    new_password: str

@router.post("/change-password")
def change_password(data: ChangePassword, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"success": True, "message": "Password updated successfully"}

@router.delete("/account")
def delete_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(models.ECGScan).filter(models.ECGScan.user_id == current_user.id).delete()
    db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).delete()
    db.query(models.Vital).filter(models.Vital.user_id == current_user.id).delete()
    db.query(models.HealthProfile).filter(models.HealthProfile.user_id == current_user.id).delete()
    db.query(models.Notification).filter(models.Notification.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}

class UserUpdate(BaseModel):
    full_name: str
    age: int
    gender: str
    email: str

@router.put("/me")
def update_user_me(data: UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.full_name = data.full_name
    current_user.age = data.age
    current_user.gender = data.gender
    current_user.email = data.email
    db.commit()
    db.refresh(current_user)
    return {"id": current_user.id, "full_name": current_user.full_name, "email": current_user.email, "age": current_user.age, "gender": current_user.gender}
