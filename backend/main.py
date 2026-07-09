from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
import models
from routers import auth, ecg, twin, tracking, chat, ai, notifications, search

# Create database tables
Base.metadata.create_all(bind=engine)
from sqlalchemy import text
migrations = [
    "ALTER TABLE users ADD COLUMN reset_otp VARCHAR",
    "ALTER TABLE users ADD COLUMN reset_otp_expiry DATETIME",
    "ALTER TABLE ecg_scans ADD COLUMN ai_explanation VARCHAR",
    "ALTER TABLE doctors ADD COLUMN osm_id VARCHAR",
    "ALTER TABLE doctors ADD COLUMN fee VARCHAR",
    "ALTER TABLE doctors ADD COLUMN about VARCHAR",
    "ALTER TABLE doctors ADD COLUMN languages VARCHAR",
    "ALTER TABLE doctors ADD COLUMN phone VARCHAR",
    "ALTER TABLE doctors ADD COLUMN address VARCHAR",
    "ALTER TABLE doctors ADD COLUMN lat FLOAT",
    "ALTER TABLE doctors ADD COLUMN lng FLOAT"
]
with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
        except Exception:
            pass


app = FastAPI(title="CardioTwin API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/ecg", exist_ok=True)
os.makedirs("uploads/heatmaps", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(ecg.router, prefix="/ecg", tags=["ecg"])
app.include_router(twin.router, prefix="/twin", tags=["twin"])
app.include_router(tracking.router, prefix="/tracking", tags=["tracking"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
app.include_router(search.router, prefix="/search", tags=["search"])

@app.get("/")
def read_root():
    return {"message": "CardioTwin API is running"}
