import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models
from database import get_db
from routers.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_notifications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    
    if not notifications:
        starter_notifs = [
            models.Notification(user_id=current_user.id, type="reminder", title="Daily Vitals", body="Remember to log your blood pressure and heart rate today."),
            models.Notification(user_id=current_user.id, type="summary", title="Welcome to CardioTwin", body="Your baseline cardiac digital twin profile has been created."),
            models.Notification(user_id=current_user.id, type="tip", title="Heart Health Tip", body="Regular 30-minute walks can significantly lower cardiovascular risk.")
        ]
        for n in starter_notifs:
            db.add(n)
        db.commit()
        notifications = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id
        ).order_by(models.Notification.created_at.desc()).all()
        
    return notifications

@router.post("/seed-default")
def seed_default_notifications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    starter_notifs = [
        models.Notification(user_id=current_user.id, type="reminder", title="Daily Vitals", body="Remember to log your blood pressure and heart rate today."),
        models.Notification(user_id=current_user.id, type="summary", title="Welcome to CardioTwin", body="Your baseline cardiac digital twin profile has been created."),
        models.Notification(user_id=current_user.id, type="tip", title="Heart Health Tip", body="Regular 30-minute walks can significantly lower cardiovascular risk.")
    ]
    for n in starter_notifs:
        db.add(n)
    db.commit()
    return {"message": "Starter notifications seeded successfully"}

@router.post("/{id}/read")
def mark_read(id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = db.query(models.Notification).filter(
        models.Notification.id == id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if notification:
        notification.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}

@router.post("/read-all")
def mark_all_read(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
