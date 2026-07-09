from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from groq import Groq
import models
from database import get_db
from auth_utils import get_current_user

load_dotenv() # Load variables from .env

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/ask")
def ask_chatbot(request: ChatRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get latest twin for context
    twin = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.desc()).first()
    risk_score = twin.risk_score if twin else "Unknown"
    
    # Call Groq
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return {"reply": "Groq API key not configured. I am a mock assistant. You asked: " + request.message}
        
    try:
        client = Groq(api_key=api_key)
        system_prompt = f"You are CardioTwin, an AI cardiologist assistant for {current_user.full_name}. Their current cardiac risk score is {risk_score}%. Answer concisely and helpfully."
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": request.message,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        return {"reply": chat_completion.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Error communicating with AI: {str(e)}"}
