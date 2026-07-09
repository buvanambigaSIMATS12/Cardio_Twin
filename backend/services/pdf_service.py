import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import models

def generate_health_report(user: models.User, twin: models.DigitalTwin):
    os.makedirs("uploads/reports", exist_ok=True)
    report_path = f"uploads/reports/report_{user.id}.pdf"
    
    c = canvas.Canvas(report_path, pagesize=letter)
    c.drawString(100, 750, f"CardioTwin Health Report for {user.full_name}")
    c.drawString(100, 730, f"Age: {user.age} | Gender: {user.gender}")
    
    risk = twin.risk_score if twin else "Unknown"
    c.drawString(100, 700, f"Current Cardiac Risk Score: {risk}%")
    
    c.drawString(100, 680, "Recent Vitals:")
    y = 660
    for vital in user.vitals[:5]:
        c.drawString(120, y, f"{vital.recorded_at.strftime('%Y-%m-%d')}: BP {vital.systolic_bp}/{vital.diastolic_bp}, HR {vital.heart_rate}")
        y -= 20
        
    c.save()
    return report_path
