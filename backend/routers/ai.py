import os
import json
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from groq import Groq

import models
from database import get_db
from routers.auth import get_current_user

router = APIRouter()

from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY", "")
client = None
if groq_api_key and groq_api_key != "mock-key":
    try:
        client = Groq(api_key=groq_api_key)
        print(f"[Groq] Client initialized successfully with key ending ...{groq_api_key[-6:]}")
    except Exception as e:
        print(f"[Groq] FAILED to initialize client: {e}")
        client = None
else:
    print("[Groq] No API key found — running in fallback mode")

MODEL_NAME = "llama-3.1-8b-instant"

# Simple in-memory cache for recommendations
recommendations_cache = {}

@router.post("/recommendations")
def get_recommendations(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    cached = recommendations_cache.get(current_user.id)
    if cached and (now - cached['timestamp']) < timedelta(hours=1):
        return cached['data']
        
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).first()
    twin = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.desc()).first()
    ecg = db.query(models.ECGScan).filter(models.ECGScan.user_id == current_user.id).order_by(models.ECGScan.scan_date.desc()).first()
    health_profile = db.query(models.HealthProfile).filter(models.HealthProfile.user_id == current_user.id).first()
    
    bp = f"{vitals.systolic_bp}/{vitals.diastolic_bp}" if vitals else "120/80"
    risk = twin.risk_score if twin else 15.0
    diagnosis = ecg.diagnosis if ecg else "Normal"
    
    conditions = []
    if health_profile:
        if health_profile.history_high_bp: conditions.append("High BP")
        if health_profile.history_diabetes: conditions.append("Diabetes")
        if health_profile.history_smoking: conditions.append("Smoker")
    history_str = ", ".join(conditions) if conditions else "None"
    
    prompt = f"""Based on this cardiac patient's data: BP={bp}, Risk Score={risk}%, ECG={diagnosis}, History: {history_str}.
Generate 9 personalized cardiac health recommendations, exactly 3 for each category: Exercise, Diet, Lifestyle.
Format as JSON array: [{{"category": "Exercise", "title": "string", "description": "string", "difficulty": "Easy|Moderate|Hard"}}].
Output ONLY valid JSON, no markdown blocks."""

    fallback = [
        {"category": "Exercise", "title": "30-min daily walk", "description": "A brisk 30-minute walk improves cardiovascular health and lowers blood pressure.", "difficulty": "Easy"},
        {"category": "Exercise", "title": "Light Yoga", "description": "Gentle stretching and breathing exercises to reduce stress and improve circulation.", "difficulty": "Easy"},
        {"category": "Exercise", "title": "Swimming", "description": "Low-impact cardiovascular exercise that is easy on the joints.", "difficulty": "Moderate"},
        {"category": "Diet", "title": "Reduce Sodium", "description": "Limit salt intake to help manage blood pressure levels.", "difficulty": "Moderate"},
        {"category": "Diet", "title": "More Leafy Greens", "description": "Incorporate spinach, kale, and other greens rich in vitamins and minerals.", "difficulty": "Easy"},
        {"category": "Diet", "title": "Heart-Healthy Fats", "description": "Use olive oil and eat nuts/seeds instead of saturated fats.", "difficulty": "Moderate"},
        {"category": "Lifestyle", "title": "7-8 Hours Sleep", "description": "Adequate rest is crucial for heart recovery and stress management.", "difficulty": "Moderate"},
        {"category": "Lifestyle", "title": "Stress Reduction", "description": "Practice meditation or deep breathing for 10 minutes daily.", "difficulty": "Easy"},
        {"category": "Lifestyle", "title": "Stay Hydrated", "description": "Drink at least 8 glasses of water daily to maintain blood volume.", "difficulty": "Easy"}
    ]
    
    if not client:
        return fallback

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You output pure JSON arrays ONLY."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.5
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        data = json.loads(content.strip())
        recommendations_cache[current_user.id] = {'timestamp': now, 'data': data}
        return data
    except Exception as e:
        print("AI Error:", e)
        return fallback

class ExercisePlanRequest(BaseModel):
    force_new: Optional[bool] = False

@router.post("/exercise-plan")
def get_exercise_plan(body: ExercisePlanRequest = ExercisePlanRequest(), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).first()
    twin = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.desc()).first()
    health_profile = db.query(models.HealthProfile).filter(models.HealthProfile.user_id == current_user.id).first()

    age = current_user.age or 40
    risk = twin.risk_score if twin else 15.0
    bp = f"{vitals.systolic_bp}/{vitals.diastolic_bp}" if vitals else "120/80"
    level = health_profile.activity_level if health_profile and health_profile.activity_level else "Moderate"

    # Unique seed so every call generates a fresh, different plan
    variation_seed = str(uuid.uuid4())[:8]
    week_themes = [
        "cardio and flexibility", "strength and endurance", "mindfulness and recovery",
        "interval training", "low-impact variety", "balance and coordination"
    ]
    import random
    theme = random.choice(week_themes)

    prompt = f"""Create a UNIQUE safe 7-day cardiac exercise plan (variation-id: {variation_seed}, weekly theme: {theme}) for:
Age={age}, Risk Score={risk}%, BP={bp}, Activity Level={level}.
Each day MUST have a DIFFERENT activity — do NOT repeat the same exercise across days.
Choose from: walking, cycling, swimming, yoga, pilates, tai chi, aqua aerobics, resistance bands, stretching, dance, rowing, elliptical, etc.
Return JSON array with exactly 7 items: [{{"day": "Mon", "activity": "string", "duration_minutes": integer, "intensity": "Low|Moderate|High", "notes": "string", "heart_benefits": "string"}}]
Output ONLY valid JSON, no markdown formatting."""

    # Varied fallback so offline mode also gives different plans
    all_activities = [
        ("Brisk Walking", 30, "Low", "Maintain comfortable pace, arms swinging naturally", "Lowers resting heart rate and improves circulation"),
        ("Cycling", 25, "Moderate", "Flat terrain, keep cadence steady at 70-80 rpm", "Strengthens heart muscle without joint strain"),
        ("Swimming", 30, "Moderate", "Freestyle or breaststroke, rest between laps", "Full-body workout with zero impact on joints"),
        ("Yoga", 40, "Low", "Focus on breathing and gentle stretches", "Reduces cortisol and lowers blood pressure"),
        ("Tai Chi", 30, "Low", "Slow flowing movements, focus on balance", "Improves autonomic nervous system balance"),
        ("Resistance Bands", 25, "Moderate", "Light resistance, 3 sets of 12 reps per exercise", "Builds lean muscle which aids metabolic heart health"),
        ("Aqua Aerobics", 30, "Low", "Water provides natural resistance and cooling", "Improves cardiac output safely in heated pool"),
    ]
    random.shuffle(all_activities)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    fallback = [{"day": days[i], "activity": all_activities[i][0], "duration_minutes": all_activities[i][1],
                 "intensity": all_activities[i][2], "notes": all_activities[i][3], "heart_benefits": all_activities[i][4]}
                for i in range(7)]

    if not client:
        return fallback

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You output pure JSON ONLY. You are a cardiac exercise specialist who creates varied, creative, and unique weekly exercise plans."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.95,
            seed=int(uuid.uuid4().int % 2**31)
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print("AI Error:", e)
        return fallback

class SleepData(BaseModel):
    hours: float
    quality: int
    bedtime: str
    wake_time: str

@router.post("/sleep-analysis")
def analyze_sleep(data: SleepData, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = f"""Analyze this sleep data for a cardiac patient: Hours={data.hours}, Quality={data.quality}/5, Bedtime={data.bedtime}, Wake Time={data.wake_time}.
Return JSON: {{"sleep_score": 85, "cardiac_impact": "string", "insights": "string", "tips": ["string", "string", "string"]}}
Output ONLY valid JSON."""

    # Rule-based dynamic scoring if API is not available
    score = 75
    # penalty for deviation from 8 hours
    hours_diff = abs(data.hours - 8.0)
    score -= (hours_diff * 10)
    # quality bonus/penalty
    score += ((data.quality - 3) * 10)
    
    score = max(0, min(100, int(score)))
    
    impact = "Good sleep reduces your cardiac risk significantly."
    if score < 50: impact = "Poor sleep increases blood pressure and cardiac stress."
    elif score < 75: impact = "Moderate sleep is okay, but improving it will help your heart."
    
    insights = f"Sleeping {data.hours} hours with quality {data.quality}/5 gives a score of {score}/100."
    tips = ["Maintain a consistent schedule", "Avoid screens before bed", "Keep room cool"]
    if data.hours < 6: tips.append("Try to get to bed earlier to increase total sleep time.")
    if data.quality <= 2: tips.append("Consider relaxation techniques before bed to improve quality.")

    fallback = {
        "sleep_score": score,
        "cardiac_impact": impact,
        "insights": insights,
        "tips": list(set(tips))[:3]
    }

    if not client:
        return fallback

    try:
        response = client.chat.completions.create(
            messages=[{"role": "system", "content": "You output pure JSON ONLY."}, {"role": "user", "content": prompt}],
            model=MODEL_NAME,
            temperature=0.5
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print("AI Error:", e)
        return fallback

class MealData(BaseModel):
    description: str

@router.post("/meal-analysis")
def analyze_meal(data: MealData, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = f"""Analyse this meal for cardiac health: '{data.description}'. 
Return JSON: {{"cardiac_score": 80, "label": "Heart-Healthy|Moderate|Avoid", "sodium": "string", "saturated_fat": "string", "fiber": "string", "antioxidants": "string", "recommendations": ["string", "string", "string"]}}
Output ONLY valid JSON."""

    desc_lower = data.description.lower()
    bad_words = ["pizza", "burger", "fries", "fried", "bacon", "sausage", "cheese", "soda", "sugar", "cake", "ice cream", "chips", "steak"]
    good_words = ["salad", "vegetables", "fruit", "fish", "salmon", "chicken", "oats", "nuts", "beans", "apple", "broccoli", "spinach", "whole wheat", "quinoa"]
    
    score = 70
    found_bad = sum(1 for w in bad_words if w in desc_lower)
    found_good = sum(1 for w in good_words if w in desc_lower)
    
    score -= (found_bad * 15)
    score += (found_good * 10)
    score = max(0, min(100, score))
    
    if score >= 80:
        label = "Heart-Healthy"
    elif score >= 50:
        label = "Moderate"
    else:
        label = "Avoid"
        
    fallback = {
        "cardiac_score": score,
        "label": label,
        "sodium": "High" if found_bad > 0 else "Low",
        "saturated_fat": "High" if found_bad > 0 else "Low",
        "fiber": "High" if found_good > 0 else "Low",
        "antioxidants": "High" if found_good > 0 else "Low",
        "recommendations": []
    }
    
    if found_bad > 0: fallback["recommendations"].append("Try to avoid highly processed or fried foods.")
    if found_good == 0: fallback["recommendations"].append("Add more fresh vegetables and fruits to your meal.")
    if score >= 80: fallback["recommendations"].append("Keep up the great heart-healthy choices!")
    if len(fallback["recommendations"]) == 0: fallback["recommendations"].append("Maintain portion control and stay hydrated.")

    if not client:
        return fallback

    try:
        response = client.chat.completions.create(
            messages=[{"role": "system", "content": "You output pure JSON ONLY."}, {"role": "user", "content": prompt}],
            model=MODEL_NAME,
            temperature=0.5
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print("AI Error:", e)
        return fallback

# ─────────────────────────────────────────────────────────────────
# NEW: 7-Day Heart-Healthy Meal Plan
# ─────────────────────────────────────────────────────────────────
class MealPlanRequest(BaseModel):
    force_new: Optional[bool] = False

@router.post("/meal-plan")
def get_meal_plan(body: MealPlanRequest = MealPlanRequest(), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    import random
    health_profile = db.query(models.HealthProfile).filter(models.HealthProfile.user_id == current_user.id).first()
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).first()
    twin = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.desc()).first()

    age = current_user.age or 40
    risk = twin.risk_score if twin else 15.0
    conditions = []
    if health_profile:
        if health_profile.history_high_bp: conditions.append("hypertension")
        if health_profile.history_diabetes: conditions.append("diabetes")
        if health_profile.history_smoking: conditions.append("former/current smoker")
    conditions_str = ", ".join(conditions) if conditions else "none"

    cuisines = ["Mediterranean", "South Asian heart-healthy", "Japanese", "Middle Eastern", "Nordic", "Latin American heart-healthy"]
    cuisine = random.choice(cuisines)
    seed = str(uuid.uuid4())[:8]

    prompt = f"""Create a UNIQUE 7-day heart-healthy meal plan (variation-id: {seed}, cuisine theme: {cuisine}) for a cardiac patient:
Age={age}, Risk Score={risk}%, Conditions: {conditions_str}.
Each day MUST have 3 unique meals (breakfast, lunch, dinner) with different foods.
Return JSON array with exactly 7 items:
[{{"day": "Mon", "breakfast": {{"name": "string", "description": "string", "cardiac_benefit": "string"}}, "lunch": {{"name": "string", "description": "string", "cardiac_benefit": "string"}}, "dinner": {{"name": "string", "description": "string", "cardiac_benefit": "string"}}, "daily_tip": "string"}}]
Output ONLY valid JSON, no markdown."""

    fallback_meals = [
        {"day": "Mon", "breakfast": {"name": "Oatmeal with Berries", "description": "Steel-cut oats topped with fresh blueberries and a drizzle of honey", "cardiac_benefit": "Beta-glucan in oats lowers LDL cholesterol"}, "lunch": {"name": "Grilled Salmon Salad", "description": "Atlantic salmon over mixed greens with olive oil dressing", "cardiac_benefit": "Omega-3 fatty acids reduce inflammation and triglycerides"}, "dinner": {"name": "Lentil Vegetable Soup", "description": "Red lentils with carrots, spinach and cumin", "cardiac_benefit": "High fiber and potassium support healthy blood pressure"}, "daily_tip": "Drink 8 glasses of water today"},
        {"day": "Tue", "breakfast": {"name": "Avocado Toast", "description": "Whole grain toast with mashed avocado and cherry tomatoes", "cardiac_benefit": "Monounsaturated fats improve HDL cholesterol"}, "lunch": {"name": "Quinoa Buddha Bowl", "description": "Quinoa with chickpeas, roasted vegetables and tahini", "cardiac_benefit": "Plant protein and fiber support heart health"}, "dinner": {"name": "Baked Chicken with Herbs", "description": "Skinless chicken breast with rosemary, garlic and steamed broccoli", "cardiac_benefit": "Lean protein without saturated fat burden"}, "daily_tip": "Take a 20-minute walk after dinner"},
        {"day": "Wed", "breakfast": {"name": "Greek Yogurt Parfait", "description": "Low-fat Greek yogurt layered with walnuts and pomegranate seeds", "cardiac_benefit": "Probiotics and antioxidants reduce arterial inflammation"}, "lunch": {"name": "Tuna Whole Wheat Wrap", "description": "Canned tuna with cucumber, spinach in whole wheat tortilla", "cardiac_benefit": "Omega-3 and high protein without refined carbs"}, "dinner": {"name": "Vegetable Stir-fry with Tofu", "description": "Firm tofu with bell peppers, snap peas, ginger soy sauce", "cardiac_benefit": "Soy isoflavones help lower LDL cholesterol"}, "daily_tip": "Limit salt — try lemon juice and herbs instead"},
        {"day": "Thu", "breakfast": {"name": "Whole Grain Pancakes", "description": "Buckwheat pancakes with fresh sliced strawberries", "cardiac_benefit": "Buckwheat contains rutin which strengthens blood vessels"}, "lunch": {"name": "Mediterranean Chickpea Bowl", "description": "Chickpeas, cucumber, tomato, feta, olive oil, lemon", "cardiac_benefit": "Legumes reduce cardiovascular disease risk by 22%"}, "dinner": {"name": "Baked Mackerel with Sweet Potato", "description": "Omega-3 rich fish with roasted sweet potato and asparagus", "cardiac_benefit": "DHA in mackerel reduces heart rhythm disorders"}, "daily_tip": "Try meditation for 10 minutes to lower cortisol"},
        {"day": "Fri", "breakfast": {"name": "Smoothie Bowl", "description": "Blended banana, spinach, almond milk topped with flaxseeds and kiwi", "cardiac_benefit": "Flaxseeds are rich in ALA omega-3 and lignans"}, "lunch": {"name": "Black Bean Tacos", "description": "Corn tortillas with black beans, avocado, salsa, lime", "cardiac_benefit": "Black beans provide potassium and folate for heart health"}, "dinner": {"name": "Baked Cod with Brown Rice", "description": "Herb-crusted cod fillet with brown rice and steamed green beans", "cardiac_benefit": "Low-fat white fish with complex carbohydrates for energy"}, "daily_tip": "Eat slowly — it helps prevent overeating and aids digestion"},
        {"day": "Sat", "breakfast": {"name": "Veggie Omelette", "description": "Egg whites with spinach, mushrooms, tomatoes cooked in olive oil", "cardiac_benefit": "Egg whites provide protein without cholesterol-raising yolk fat"}, "lunch": {"name": "Lentil and Tomato Soup", "description": "Red lentil soup with cumin, garlic, and fresh parsley", "cardiac_benefit": "Lentils lower triglycerides and improve blood vessel function"}, "dinner": {"name": "Grilled Shrimp Skewers", "description": "Marinated shrimp with zucchini, cherry tomatoes on quinoa", "cardiac_benefit": "Low-calorie, high-protein seafood supports lean cardiac function"}, "daily_tip": "Add a handful of nuts as a heart-healthy afternoon snack"},
        {"day": "Sun", "breakfast": {"name": "Chia Seed Pudding", "description": "Overnight chia pudding with coconut milk, mango and mint", "cardiac_benefit": "Chia seeds are rich in omega-3 ALA and soluble fiber"}, "lunch": {"name": "Spinach and Walnut Salad", "description": "Baby spinach with walnuts, apple slices, balsamic vinaigrette", "cardiac_benefit": "Walnuts contain ALA and arginine that dilate blood vessels"}, "dinner": {"name": "Vegetable Curry with Basmati Rice", "description": "Mixed vegetables in turmeric-ginger curry sauce with basmati rice", "cardiac_benefit": "Turmeric and ginger have powerful anti-inflammatory properties"}, "daily_tip": "Plan your meals for the week ahead to stay heart-healthy"},
    ]

    if not client:
        return fallback_meals

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You output pure JSON ONLY. You are a cardiac dietitian who creates varied, culturally diverse, heart-healthy meal plans."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.9,
            seed=int(uuid.uuid4().int % 2**31)
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print("AI Meal Plan Error:", e)
        return fallback_meals

# ─────────────────────────────────────────────────────────────────
# NEW: AI Symptom Analysis
# ─────────────────────────────────────────────────────────────────
class SymptomAnalysisData(BaseModel):
    symptoms: list
    severity: int
    notes: Optional[str] = ""

@router.post("/symptom-analysis")
def analyze_symptoms(data: SymptomAnalysisData, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    twin = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.desc()).first()
    vitals = db.query(models.Vital).filter(models.Vital.user_id == current_user.id).order_by(models.Vital.recorded_at.desc()).first()

    risk = twin.risk_score if twin else 15.0
    bp = f"{vitals.systolic_bp}/{vitals.diastolic_bp}" if vitals else "unknown"
    symptoms_str = ", ".join(data.symptoms)
    notes_str = data.notes or "none"

    prompt = f"""A cardiac patient (Risk Score={risk}%, BP={bp}) reports these symptoms: {symptoms_str}.
Severity: {data.severity}/10. Additional notes: {notes_str}.
Analyse for cardiac significance and return JSON:
{{"urgency": "Low|Moderate|High|Emergency", "urgency_color": "#22c55e|#f59e0b|#ef4444|#dc2626", "cardiac_interpretation": "string (2-3 sentences)", "possible_causes": ["string", "string", "string"], "immediate_actions": ["string", "string"], "seek_care": boolean, "seek_care_message": "string"}}
Output ONLY valid JSON."""

    # Smart rule-based fallback
    has_chest = "Chest Pain" in data.symptoms
    has_breath = "Shortness of Breath" in data.symptoms
    has_palp = "Palpitations" in data.symptoms
    has_dizzy = "Dizziness" in data.symptoms
    has_swelling = "Swelling in legs" in data.symptoms
    no_symptoms = "No symptoms today" in data.symptoms

    if no_symptoms:
        urgency, color = "Low", "#22c55e"
        interpretation = "Great news — no symptoms today! Your heart is resting comfortably. Maintain your healthy routine."
        causes = ["Good medication adherence", "Adequate rest and hydration", "Heart-healthy lifestyle"]
        actions = ["Continue your current medications", "Log your vitals as usual"]
        seek = False
        seek_msg = "No immediate care needed. Routine check-up as scheduled."
    elif has_chest and data.severity >= 7:
        urgency, color = "Emergency", "#dc2626"
        interpretation = "Chest pain with high severity is a cardiac emergency. This could indicate angina, acute coronary syndrome, or heart attack. Do NOT wait."
        causes = ["Acute coronary syndrome", "Unstable angina", "Myocardial infarction"]
        actions = ["Call emergency services (112) immediately", "Chew aspirin if not allergic and available"]
        seek = True
        seek_msg = "CALL 112 NOW — Do not drive yourself to hospital."
    elif (has_chest or (has_breath and has_palp)) and data.severity >= 5:
        urgency, color = "High", "#ef4444"
        interpretation = "Combination of chest symptoms and breathing difficulty is concerning for cardiac origin. These warrant urgent medical evaluation today."
        causes = ["Arrhythmia", "Heart failure decompensation", "Pulmonary embolism"]
        actions = ["Contact your cardiologist today", "Avoid physical exertion"]
        seek = True
        seek_msg = "Visit your cardiologist or ER today — do not delay."
    elif has_palp or has_dizzy or has_swelling:
        urgency, color = "Moderate", "#f59e0b"
        interpretation = "These symptoms can be cardiac in origin and deserve monitoring. They may indicate arrhythmia, blood pressure changes, or fluid retention."
        causes = ["Arrhythmia", "Blood pressure fluctuation", "Medication side effect"]
        actions = ["Check your blood pressure now", "Rest and avoid caffeine"]
        seek = data.severity >= 6
        seek_msg = "Schedule a check-up within 24-48 hours."
    else:
        urgency, color = "Low", "#22c55e"
        interpretation = "Your current symptoms appear to be of low cardiac concern. Continue monitoring and log if they worsen."
        causes = ["Fatigue from activity", "Dehydration", "Minor stress response"]
        actions = ["Rest and stay hydrated", "Monitor for any worsening"]
        seek = False
        seek_msg = "No immediate care needed. Monitor over the next 24 hours."

    fallback = {
        "urgency": urgency,
        "urgency_color": color,
        "cardiac_interpretation": interpretation,
        "possible_causes": causes,
        "immediate_actions": actions,
        "seek_care": seek,
        "seek_care_message": seek_msg
    }

    if not client:
        return fallback

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a cardiology AI assistant. Output pure JSON ONLY. Be medically accurate but also clear and compassionate."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.3
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print("AI Symptom Error:", e)
        return fallback

# ─────────────────────────────────────────────────────────────────
# NEW: AI Weekly Health Insights
# ─────────────────────────────────────────────────────────────────
class WeeklyInsightsData(BaseModel):
    health_score: int
    health_score_delta: int
    avg_bp: str
    days_logged: int
    trend_direction: str
    ecg_status: str

@router.post("/weekly-insights")
def get_weekly_insights(data: WeeklyInsightsData, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    twin = db.query(models.DigitalTwin).filter(models.DigitalTwin.user_id == current_user.id).order_by(models.DigitalTwin.recorded_at.desc()).first()
    risk = twin.risk_score if twin else 15.0

    prompt = f"""Provide weekly cardiac health insights for a patient with these stats:
Health Score: {data.health_score}/100 ({'+' if data.health_score_delta >= 0 else ''}{data.health_score_delta} vs last week)
Average BP: {data.avg_bp}, Days Logged: {data.days_logged}/7
Trend: {data.trend_direction}, ECG Status: {data.ecg_status}, Risk Score: {risk:.1f}%
Return JSON: {{"headline": "string (one punchy sentence)", "summary": "string (2-3 sentences personalised insight)", "wins": ["string", "string"], "focus_areas": ["string", "string"], "motivation": "string (encouraging closing sentence)"}}
Output ONLY valid JSON."""

    trend = data.trend_direction
    score = data.health_score
    delta = data.health_score_delta

    if score >= 80 and trend == "IMPROVING":
        headline = "Outstanding week — your heart is thriving!"
        summary = f"Your health score of {score} is excellent, and you've improved by {abs(delta)} points. Your consistency is paying off in measurable ways."
        wins = ["Consistent vitals logging", "Improving health trajectory"]
        focus = ["Keep up daily logging", "Try adding one new healthy habit"]
        motivation = "You're building a powerful foundation for long-term cardiac health."
    elif trend == "IMPROVING":
        headline = "Great progress — keep the momentum going!"
        summary = f"You're on an upward trend with a {abs(delta)}-point gain this week. Every day you log is a step toward a healthier heart."
        wins = ["Positive weekly trend", f"{data.days_logged} days of vitals logged"]
        focus = ["Aim for 7/7 days logged next week", "Monitor BP at consistent times"]
        motivation = "Consistency is the key to cardiac wellness — you're doing it!"
    elif trend == "DECLINING" and score < 60:
        headline = "Time to refocus — your heart needs attention."
        summary = f"Your score dropped by {abs(delta)} points this week. This is a signal to review your lifestyle, medication adherence, and consult your doctor."
        wins = ["You're tracking your health proactively", "Early detection helps prevention"]
        focus = ["Consult your cardiologist soon", "Improve medication adherence"]
        motivation = "Every step you take today protects your heart for tomorrow."
    else:
        headline = "Steady week — consistency builds long-term health."
        summary = f"Your heart is holding steady at a score of {score}. Maintaining this level is important — look for small improvements each day."
        wins = ["Stable health metrics", "Active health monitoring"]
        focus = ["Increase daily activity slightly", "Log vitals every day this week"]
        motivation = "Small improvements compound into big cardiac gains over time."

    fallback = {
        "headline": headline,
        "summary": summary,
        "wins": wins,
        "focus_areas": focus,
        "motivation": motivation
    }

    if not client:
        return fallback

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a supportive cardiac health AI coach. Output pure JSON ONLY. Be encouraging, specific, and medically grounded."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL_NAME,
            temperature=0.6
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print("AI Weekly Insights Error:", e)
        return fallback
