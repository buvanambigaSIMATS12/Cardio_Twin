# CardioTwin — 6 Detailed Build Prompts

> **How to use:** Copy one prompt at a time and paste it into your AI coding assistant. Build, test, and sync to Android before moving to the next prompt. Never skip phases.

---

## 📋 SHARED CONTEXT (included by reference in every prompt)

### Tech Stack
- **Frontend:** React (Vite), React Router v6, Lucide-react icons, Recharts for charts, Tailwind-like CSS via custom CSS variables defined in `index.css`
- **Backend:** FastAPI (Python), SQLAlchemy ORM, SQLite database at `backend/cardio_twin.db`
- **Auth:** JWT Bearer tokens stored in `localStorage` as `token`. `AuthContext` provides `user` and `logout()`.
- **HTTP:** Frontend uses `src/api.js` — an Axios instance with `baseURL: http://localhost:8000` and an interceptor that attaches `Authorization: Bearer <token>` to every request.
- **Android:** Capacitor (`npx cap sync android`) — run after every build
- **AI:** Groq API key in `backend/.env` as `GROQ_API_KEY=gsk_...`

### Existing DB Models (SQLAlchemy, `backend/models.py`)
```python
User: id, email, hashed_password, full_name, age, gender, created_at
HealthProfile: id, user_id, history_high_bp, history_diabetes, history_smoking
ECGScan: id, user_id, image_url, heatmap_url, diagnosis, confidence, scan_date
DigitalTwin: id, user_id, risk_score, state_description, recorded_at
Medication: id, user_id, name, dosage, frequency, active
Vital: id, user_id, systolic_bp, diastolic_bp, heart_rate, spo2, blood_sugar, recorded_at
```

### Existing API Routers (registered in `backend/main.py`)
- `GET/POST /auth/*` — login, register
- `GET/POST /ecg/*` — upload, analyze
- `GET /twin/summary` — dashboard summary (name, health_score, cardiac_risk, bp, blood_sugar, diabetes)
- `GET /twin/detail` — latest DigitalTwin record
- `POST /twin/simulate` — body: `{sleep_hours, weight_kg, med_adherence}` → `{simulated_risk_score}`
- `POST /tracking/vitals` — body: `{systolic_bp, diastolic_bp, heart_rate, spo2, blood_sugar}`
- `GET /tracking/vitals` — list of all vitals records
- `GET /tracking/weekly-summary` — full week stats object
- `POST /chat/ask` — body: `{message}` → `{reply}`

### Existing Frontend Routes (`frontend/src/App.jsx`)
`/splash`, `/landing`, `/login`, `/register`, `/onboarding`, `/`, `/search`, `/daily-check`, `/weekly-summary`, `/ecg`, `/twin`, `/sim`, `/chat`, `/profile`

### Design System
- Primary green: `var(--color-cardio-primary)` = `#22c55e`
- Background: `var(--color-cardio-bg)` = `#f8fafc`
- All pages use the `MobileLayout` component (max-w-md, bottom nav with Home/Hist/Twin/Sim/Me tabs)
- Bottom nav hidden on: `/splash`, `/landing`, `/login`, `/register`, `/onboarding`
- Use Lucide icons and Recharts. No Tailwind CDN — use the existing CSS variable classes.

---

# PHASE 1 PROMPT — Advanced Auth & Onboarding

```
You are building Phase 1 of the CardioTwin app. Below is the exact codebase context. Do NOT change any existing files unless explicitly specified. Build only what is listed here.

## TECH STACK
- Frontend: React + Vite + React Router v6. CSS uses variables: --color-cardio-primary (#22c55e), --color-cardio-bg (#f8fafc). Icons: lucide-react. No Tailwind.
- Backend: FastAPI + SQLAlchemy + SQLite (cardio_twin.db)
- Auth: JWT tokens in localStorage as 'token'. api.js is an Axios instance with base URL http://localhost:8000 and auto-attaches Bearer token.

## EXISTING MODELS (backend/models.py)
User: id, email, hashed_password, full_name, age, gender, created_at
HealthProfile: id, user_id, history_high_bp, history_diabetes, history_smoking

## EXISTING AUTH ROUTER (backend/routers/auth.py)
- POST /auth/register — body: {email, password, full_name, age, gender} → {access_token, token_type}
- POST /auth/login — body: {email, password} → {access_token}
- GET /auth/me — returns current User

## WHAT TO BUILD

### 1. Upgrade Onboarding (frontend/src/pages/auth/Onboarding.jsx)
Replace the placeholder file with a 5-step medical history survey. Each step is a full-page card with a progress bar at the top showing "Step X of 5".

Step 1 — "Do you have a history of high blood pressure?" → Yes/No toggle buttons
Step 2 — "Do you have diabetes or pre-diabetes?" → Yes/No toggle buttons  
Step 3 — "Are you a current or former smoker?" → Never / Former / Current (3 button options)
Step 4 — "Do you have a family history of heart disease?" → Yes/No toggle
Step 5 — "What is your current activity level?" → Sedentary / Moderate / Active (3 button options)

On the final step, submit button says "Complete Setup". On submit:
- POST to a new endpoint: POST /auth/onboarding with body: {history_high_bp: bool, history_diabetes: bool, history_smoking: bool, family_history_heart: bool, activity_level: string}
- On success, navigate to "/" (dashboard)

Design: green progress bar at top, large card with question, animated slide between steps using CSS transitions. Back button on all steps except step 1.

### 2. New Backend Endpoint: POST /auth/onboarding
Add to backend/routers/auth.py:
- Requires JWT auth (Depends(get_current_user))
- Body (Pydantic): {history_high_bp: bool, history_diabetes: bool, history_smoking: bool, family_history_heart: bool, activity_level: str}
- Creates or updates a HealthProfile for the current user
- Also adds two new nullable columns to HealthProfile model: family_history_heart (Boolean) and activity_level (String)
- Update models.py with these two new columns

### 3. Forgot Password Flow (frontend only — no real email server needed)
Create: frontend/src/pages/auth/ForgotPassword.jsx
- Step 1: Email input form with "Send OTP" button. On submit, show a success toast "If this email exists, a code will be sent" (do NOT actually send email).
- Step 2: 6-digit OTP entry — six individual single-digit input boxes side by side. Auto-focus to next box on each digit entry. After filling all 6 digits, enable "Verify" button.
- Step 3: New password + Confirm password form. Submit button says "Reset Password". On success show green checkmark animation and navigate to /login after 2 seconds.
Note: This is UI-only. The OTP verification is simulated client-side (accept any 6 digits as valid). Add a backend stub endpoint POST /auth/forgot-password that accepts {email} and returns {message: "If registered, OTP sent"} — no actual email sending.

### 4. Forgot Password Link on Login Page
In frontend/src/pages/auth/Login.jsx, add a "Forgot password?" link below the password field that navigates to /forgot-password.

### 5. Routes to add in App.jsx
- /forgot-password → <ForgotPassword />
- /onboarding → already exists, but ensure it's protected

### 6. Privacy & Security Settings Page
Create: frontend/src/pages/PrivacySecurity.jsx
Sections:
- Change Password: Old password, New password, Confirm new password → POST /auth/change-password (create stub that accepts {old_password, new_password} and returns {success: true})
- Biometric Login toggle (UI only — store in localStorage)
- Data & Privacy: "Delete my account" button (red, shows a confirmation modal, then calls DELETE /auth/account endpoint — stub that returns {message: "Account deleted"})
Add a link to /privacy from the Profile page (frontend/src/pages/Profile.jsx) as a new settings row.

### 7. Help & FAQ Page
Create: frontend/src/pages/HelpFAQ.jsx with sections:
- "How to use" — 5 expandable accordion items explaining app features
- "Contact Support" — mailto link: support@cardiotwin.app
- "About CardioTwin" — version 1.0.0, "Built with ❤️ for cardiac health"
Add a link to /help from the Profile page.

### AFTER BUILDING
Run: cd frontend && npm run build && npx cap sync android
Verify no console errors.
```

---

# PHASE 2 PROMPT — Medication Tracker & Vitals Charts

```
You are building Phase 2 of the CardioTwin app. The existing codebase is a FastAPI + SQLAlchemy + React + Vite app. Do NOT change any existing files unless explicitly specified.

## TECH STACK & CONTEXT
(Same as Phase 1 shared context — see top of document)

## EXISTING MODELS RELEVANT TO THIS PHASE
Vital: id, user_id, systolic_bp, diastolic_bp, heart_rate, spo2, blood_sugar, recorded_at
Medication: id, user_id, name, dosage, frequency, active

## EXISTING ENDPOINTS RELEVANT TO THIS PHASE
- GET /tracking/vitals → list of {id, systolic_bp, diastolic_bp, heart_rate, spo2, blood_sugar, recorded_at}
- POST /tracking/vitals → create vital

## WHAT TO BUILD

### 1. Medication Tracker Page (frontend/src/pages/MedicationTracker.jsx)
Route: /medications

Header: "Medication Tracker" with a + button top right that navigates to /medications/add

Main section — "My Medications" list:
- Fetches GET /medications (see endpoint below)
- Each card shows: pill icon, medication name (bold), dosage + frequency (subtitle), a green "Taken Today" button or gray "Mark Taken" button
- "Mark Taken" triggers POST /medications/{id}/taken which records today's adherence
- If no medications, show empty state: "No medications added yet. Tap + to add one."

Adherence section at bottom: a circular gauge showing today's adherence % (medications taken today / total active medications × 100). Use SVG circle with stroke-dasharray.

### 2. Add Medication Page (frontend/src/pages/AddMedication.jsx)
Route: /medications/add

Form fields:
- Medication name (text input)
- Dosage (text input, e.g. "10mg")
- Frequency dropdown: Once daily / Twice daily / Three times daily / As needed
- Start date (date picker)
- Notes (textarea, optional)

Submit button: "Add Medication" → POST /medications → on success navigate back to /medications

### 3. New Backend Endpoints (backend/routers/tracking.py — add to existing router)

```python
GET /medications
  - Requires auth
  - Returns all active medications for current user
  - Also returns whether each was taken today (bool) by checking MedicationLog table

POST /medications
  - Body: {name: str, dosage: str, frequency: str, notes: str}
  - Creates Medication record

DELETE /medications/{id}
  - Marks medication as inactive (active=False)

POST /medications/{id}/taken
  - Creates a MedicationLog entry for today

GET /medications/adherence
  - Returns: {today_adherence: float, weekly_adherence: float}
```

### 4. New DB Model — MedicationLog (add to backend/models.py)
```python
class MedicationLog(Base):
    __tablename__ = "medication_logs"
    id = Column(Integer, primary_key=True)
    medication_id = Column(Integer, ForeignKey("medications.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    taken_at = Column(DateTime, default=datetime.utcnow)
```
Add `logs = relationship("MedicationLog", back_populates="medication")` to Medication model.

### 5. Vitals Tracker Page (frontend/src/pages/VitalsTracker.jsx)
Route: /vitals-tracker

Fetches GET /tracking/vitals and displays charts using Recharts.

Tab bar at top: "Blood Pressure" | "Heart Rate" | "SpO2" | "Blood Sugar"

Blood Pressure tab:
- LineChart with two lines: systolic (red) and diastolic (blue)
- X axis: date of recorded_at formatted as "Jun 12"
- Y axis: mmHg
- Below chart: latest reading card showing current BP status (Normal/Elevated/High)

Heart Rate tab:
- LineChart with single green line
- Reference lines at 60 (lower normal) and 100 (upper normal)
- Tooltip shows exact bpm

SpO2 tab:
- AreaChart, color fill from green to red based on value (>96 green, 94-96 yellow, <94 red)
- Reference line at 95%

Blood Sugar tab:
- BarChart
- Reference lines at 100 (normal) and 126 (diabetic threshold)

If no data: show empty state card with "No vitals logged yet. Go to Twin tab to log vitals."

### 6. Symptom Logger Page (frontend/src/pages/SymptomLogger.jsx)
Route: /symptoms

Header: "Log Symptoms" with history icon linking to /symptoms/history

Top section: date/time display (auto-set to now)

Symptom grid — tappable cards with icons:
- Chest Pain (heart icon, red)
- Shortness of Breath (wind icon, blue)
- Palpitations (activity icon, orange)
- Dizziness (alert icon, yellow)
- Fatigue (battery-low icon, gray)
- Swelling in legs (droplet icon, purple)
- No symptoms today (check icon, green)

Severity slider: "How severe?" 1-10 scale with color gradient

Notes field: optional text

Submit button: "Log Symptoms" → POST /symptoms (see endpoint below)

### 7. New Backend Endpoint — Symptoms
Add to tracking.py:
```python
New DB Model (add to models.py):
class SymptomLog(Base):
    __tablename__ = "symptom_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symptoms = Column(String)  # comma-separated list
    severity = Column(Integer)
    notes = Column(String, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

POST /symptoms — body: {symptoms: list[str], severity: int, notes: str} → creates SymptomLog
GET /symptoms — returns last 30 symptom logs for current user
```

### 8. Link new pages
- Add /medications, /vitals-tracker, /symptoms routes to App.jsx
- On Dashboard (frontend/src/pages/Dashboard.jsx), add quick-action buttons: "Medications" (pill icon → /medications), "Vitals Chart" (bar-chart icon → /vitals-tracker), "Log Symptoms" (clipboard icon → /symptoms)

### AFTER BUILDING
Run: cd frontend && npm run build && npx cap sync android
```

---

# PHASE 3 PROMPT — ECG History, Share & PDF Reports

```
You are building Phase 3 of the CardioTwin app. The codebase is FastAPI + SQLAlchemy + SQLite backend, React + Vite frontend. Do NOT change existing files unless specified.

## TECH STACK & CONTEXT
(Same shared context — FastAPI backend at localhost:8000, React frontend, JWT auth via api.js)

## EXISTING ECG MODEL
ECGScan: id, user_id, image_url, heatmap_url, diagnosis, confidence, scan_date

## EXISTING ECG ENDPOINTS (backend/routers/ecg.py)
- POST /ecg/upload — uploads ECG image, runs ML analysis, returns {diagnosis, confidence, risk_score, heatmap_url}
- GET /ecg/history — returns list of all ECG scans for current user (add this if missing)

## WHAT TO BUILD

### 1. ECG History Page (frontend/src/pages/ECGHistory.jsx)
Route: /ecg/history

Fetches GET /ecg/history (implement on backend if missing).
Displays a chronological list of cards, most recent first.

Each card contains:
- Small thumbnail of the ECG image (use <img src={`http://localhost:8000/static/ecg/${scan.image_url}`} />)
- Diagnosis name (bold, large)
- Confidence percentage badge (green if >80%, yellow if 60-80%, red if <60%)
- Date (formatted: "June 12, 2026 · 2:34 PM")
- Two action buttons: "View Details" → navigates to /ecg/result/{id} | "Share" → opens share modal

Empty state: "No ECG scans yet. Upload your first ECG to get started." with a button → /ecg

### 2. ECG Detail Page (frontend/src/pages/ECGDetail.jsx)
Route: /ecg/result/:scanId

Fetches GET /ecg/{scanId} (implement on backend).

Sections:
1. ECG image display — full-width image card
2. Diagnosis card — disease name + confidence ring (SVG donut chart showing confidence%)
3. Grad-CAM heatmap — if heatmap_url exists, show side-by-side with original (toggle button to switch views). Label "Red zones = AI attention areas"
4. Risk assessment — colored risk bar (green→red gradient) showing the risk_score
5. What this means — a text paragraph per diagnosis explaining the condition
6. Recommendations — 3 bullet points of what to do next
7. Share button at bottom

### 3. ECG Share Functionality
On "Share" button tap (on history card or detail page):
- Opens a bottom sheet modal
- Options: "Copy Link", "Share to WhatsApp", "Download as Image", "Email to Doctor"
- "Copy Link" copies a deep link: `https://cardiotwin.app/ecg/result/{scanId}` to clipboard and shows "Copied!" toast
- "Share to WhatsApp" opens: `https://wa.me/?text=My ECG result: Diagnosis: {diagnosis} (Confidence: {confidence}%). View: https://cardiotwin.app/ecg/result/{scanId}`
- "Download as Image" triggers browser download of the heatmap image
- "Email to Doctor" opens mailto with pre-filled subject and body

### 4. New Backend Endpoints (add to backend/routers/ecg.py)
```python
GET /ecg/history
  - Requires auth
  - Returns all ECGScan records for current user, ordered by scan_date desc
  - Shape: [{id, image_url, heatmap_url, diagnosis, confidence, scan_date}]

GET /ecg/{scan_id}
  - Requires auth
  - Returns single ECGScan by ID (verify it belongs to current user or raise 403)
  - Shape: same as above + risk_score (calculate from diagnosis: Normal=5, Arrhythmia=35, AFib=45, VT=70, STEMI=85)
```

### 5. PDF Health Report (frontend/src/pages/PDFReport.jsx)
Route: /report

This page generates and downloads a health PDF. Use the browser's print API (window.print()) with a dedicated print CSS that hides everything except the report content.

Report layout (renders as a styled div with id="print-area"):

Header:
- CardioTwin logo (heart icon) + "Health Report"
- Patient: {user.full_name} | Date: {today's date} | Age: {user.age}

Section 1 — Health Score
- Large number showing health_score and health_label from /tracking/weekly-summary

Section 2 — Vitals Summary
- Table with columns: Metric | Latest Value | Status
- Rows: Blood Pressure, Heart Rate, SpO2, Blood Sugar
- Data from GET /tracking/vitals (latest record)

Section 3 — ECG Analysis Summary
- List of last 3 ECG scans with diagnosis and confidence
- Data from GET /ecg/history

Section 4 — Digital Twin Status
- Current risk score and state_description
- Data from GET /twin/detail

Section 5 — Medications
- List of active medications
- Data from GET /medications

Section 6 — AI Recommendations (from POST /chat/ask with prompt "Give me 5 brief cardiac health recommendations based on: BP {bp}, ECG diagnosis {diagnosis}, Risk score {risk_score}. Format as a numbered list.")

Footer: "Generated by CardioTwin on {date}. This report is for informational purposes only."

"Download PDF" button calls window.print(). Print CSS: @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } }

### 6. Link new pages
- Add /ecg/history, /ecg/result/:scanId, /report routes to App.jsx
- On ECGUpload page, add "View History" button in header (clock icon → /ecg/history)
- On Profile page, add "Download Health Report" settings row → /report

### AFTER BUILDING
Run: cd frontend && npm run build && npx cap sync android
```

---

# PHASE 4 PROMPT — Advanced Twin Analytics & Achievements

```
You are building Phase 4 of the CardioTwin app. Codebase: FastAPI + SQLAlchemy + SQLite backend, React + Vite frontend, Recharts for charts, lucide-react icons.

## TECH STACK & CONTEXT
(Same shared context — FastAPI at localhost:8000, JWT auth via api.js Axios instance)

## EXISTING MODELS
DigitalTwin: id, user_id, risk_score, state_description, recorded_at
Vital: id, user_id, systolic_bp, diastolic_bp, heart_rate, spo2, blood_sugar, recorded_at
Medication: id, user_id, name, dosage, frequency, active

## WHAT TO BUILD

### 1. Risk Timeline Page (frontend/src/pages/RiskTimeline.jsx)
Route: /twin/timeline

Header: "Risk Timeline"

Fetches GET /twin/timeline (implement below).

Main chart: A Recharts ComposedChart with:
- X axis: date labels (last 30 days)
- Y axis: Risk Score (0-100%)
- Line 1 (solid green): Actual risk score over time (from DigitalTwin history records)
- Line 2 (dashed red): "Without Treatment" projection — each day adds +0.8% to the last real risk score (calculated on frontend)
- Line 3 (dashed blue): "With Full Adherence" projection — each day subtracts -0.5%
- Tooltip shows all three values on hover
- Legend at bottom

Below chart:
- "Current State" card: shows latest risk_score and state_description
- "Counterfactual" card: shows estimated risk at day 30 with treatment vs without

### 2. New Backend Endpoint
```python
GET /twin/timeline
  - Requires auth
  - Returns all DigitalTwin records for current user ordered by recorded_at asc
  - Shape: [{id, risk_score, state_description, recorded_at}]
```

### 3. Twin Insights Page (frontend/src/pages/TwinInsights.jsx)
Route: /twin/insights

Header: "Twin Insights"

Fetches GET /twin/insights (implement below).

Section 1 — "You vs Population"
A horizontal bar chart (Recharts BarChart, layout="vertical") comparing:
- Your risk score vs population average (35%) for your age group
- Your BP vs healthy range (120/80)
- Your health score vs population average (72%)
Use two bars per metric: "You" (green/red based on better/worse) and "Average" (gray)

Section 2 — "Your Risk Factors"
Horizontal list of colored badges:
- High BP badge (red if history_high_bp true, gray if false)
- Diabetes badge
- Smoking badge  
- Activity level badge (green if active, red if sedentary)

Section 3 — "Risk Category"
A gauge chart (SVG arc) with labels: Low (0-20%), Moderate (21-40%), High (41-60%), Critical (61%+). Arrow pointing to user's current risk.

### 4. New Backend Endpoint
```python
GET /twin/insights
  - Requires auth
  - Returns: {
      risk_score: float,
      population_avg_risk: 35.0,  # static reference value
      health_score: int,
      population_avg_health: 72,  # static reference value
      latest_bp: "120/80" or "--/--",
      risk_factors: {high_bp: bool, diabetes: bool, smoking: bool, activity_level: str},
      age_group: "30-40" / "40-50" etc  # derived from user.age
    }
```

### 5. Health Streak & Achievements System

#### Backend: Add to backend/routers/tracking.py
```python
GET /tracking/streak
  - Counts consecutive days the user has logged vitals (Vital records)
  - A "streak day" = at least one Vital record on that calendar date
  - Returns: {current_streak: int, longest_streak: int, last_logged: date or null}

GET /tracking/achievements
  - Evaluates rule-based achievements and returns earned ones
  - Rules:
    * "First Scan" — has at least 1 ECGScan
    * "Heart Warrior" — streak >= 7 days
    * "Iron Heart" — streak >= 30 days
    * "Blood Pressure Pro" — 5 or more normal BP readings (systolic 90-120)
    * "ECG Explorer" — 3 or more ECG scans
    * "Medication Master" — 7+ consecutive days with medication logs
  - Shape: [{id: str, name: str, description: str, icon: str, earned: bool, earned_at: date or null}]
```

#### Frontend: Achievements Page (frontend/src/pages/Achievements.jsx)
Route: /achievements

Header: "Achievements"

Health Streak card at top:
- Large animated flame emoji 🔥
- "{current_streak} day streak" in bold
- Progress bar toward next milestone (7, 30, 100 days)
- "Keep it going! Log vitals daily to maintain your streak."

Achievements grid below (2 columns):
Each achievement badge is a rounded card:
- If earned: colored background, icon, name, "Earned {date}" subtitle
- If not earned: grayed out, lock icon overlay, progress hint "Log 7 days to unlock"

Achievements to display (all 6 from backend):
1. 🩺 First Scan — "Uploaded your first ECG"
2. 🔥 Heart Warrior — "7-day logging streak"
3. 💪 Iron Heart — "30-day logging streak"
4. 💓 Blood Pressure Pro — "5 normal BP readings"
5. 🔬 ECG Explorer — "Completed 3 ECG scans"
6. 💊 Medication Master — "7 days of medication logs"

#### Dashboard Integration
Update frontend/src/pages/Dashboard.jsx:
- Add a streak indicator in the header area: a small flame icon with "{streak} day streak" next to the user's name
- Add "Achievements" quick action card → /achievements

### 6. Link new pages
Add routes to App.jsx:
- /twin/timeline → RiskTimeline
- /twin/insights → TwinInsights
- /achievements → Achievements

On the Digital Twin page (/twin), add two buttons below the vitals form:
- "Risk Timeline" → /twin/timeline
- "Twin Insights" → /twin/insights

### AFTER BUILDING
Run: cd frontend && npm run build && npx cap sync android
```

---

# PHASE 5 PROMPT — Advanced AI Features

```
You are building Phase 5 of the CardioTwin app. Codebase: FastAPI + SQLAlchemy + SQLite backend, React + Vite frontend.

## TECH STACK & CONTEXT
AI uses Groq API. Backend .env has GROQ_API_KEY. The existing chat router (backend/routers/chat.py) uses groq Python SDK with model "llama3-8b-8192". All new AI endpoints should follow the same pattern.

## EXISTING AI ENDPOINT
POST /chat/ask — body: {message: str} → {reply: str}
Uses: groq.chat.completions.create with system prompt about being a cardiology assistant.

## WHAT TO BUILD

### 1. AI Recommendations Page (frontend/src/pages/Recommendations.jsx)
Route: /recommendations

On mount, fetches POST /ai/recommendations (see endpoint below) which returns personalized recommendations based on the user's real data (BP, risk score, ECG results).

UI: Three tab categories — "Exercise" | "Diet" | "Lifestyle"

Each category shows 3 recommendation cards:
- Icon (dumbbell/apple/moon)
- Title (e.g. "30-min daily walk")
- Description (2-3 sentence explanation)
- Difficulty badge: Easy / Moderate / Hard
- "Learn More" button → opens Chatbot with the recommendation as the initial question

Loading state: skeleton shimmer cards while AI generates.

### 2. New Backend Endpoint
```python
POST /ai/recommendations
  - Requires auth
  - Fetches user's latest vitals, twin risk score, ECG diagnosis, health profile
  - Sends to Groq: "Based on this cardiac patient's data: BP={bp}, Risk Score={risk}%, ECG={diagnosis}, History: {conditions}. Generate 9 personalized cardiac health recommendations, exactly 3 for each category: Exercise, Diet, Lifestyle. Format as JSON array: [{category, title, description, difficulty}]"
  - Parse the JSON response and return it
  - Cache result in memory (simple dict cache by user_id, expires after 1 hour)
```

### 3. Exercise Planner Page (frontend/src/pages/ExercisePlanner.jsx)
Route: /exercise-plan

Fetches POST /ai/exercise-plan on mount (see endpoint below).

UI:
- Week selector tabs: Mon / Tue / Wed / Thu / Fri / Sat / Sun
- For each day, shows a workout card:
  * Activity name (e.g. "Brisk Walking")
  * Duration (e.g. "30 minutes")
  * Intensity badge: Low / Moderate / High (green/yellow/red)
  * Notes (e.g. "Keep heart rate under 120 bpm")
  * Heart benefits (1-2 sentences)
- "Generate New Plan" button at bottom to regenerate

### 4. New Backend Endpoint
```python
POST /ai/exercise-plan
  - Requires auth  
  - Fetches user's age, risk score, latest vitals, activity level from health profile
  - Sends to Groq: "Create a safe 7-day cardiac exercise plan for: Age={age}, Risk Score={risk}%, BP={bp}, Activity Level={level}. Return JSON: [{day, activity, duration_minutes, intensity, notes, heart_benefits}] for all 7 days."
  - Returns parsed JSON
```

### 5. Sleep Analyser Page (frontend/src/pages/SleepAnalyser.jsx)
Route: /sleep

UI:
- Sleep logger: "How many hours did you sleep last night?" — number stepper (5, 6, 7, 8, 9, 10)
- Sleep quality: 5 emoji buttons (😴😐🙂😊💪) labeled Very Poor to Excellent
- Bedtime / Wake time: two time picker inputs
- "Analyse Sleep" button → POST /ai/sleep-analysis

Result card (shown after submit):
- Sleep score (0-100) with color ring
- Cardiac impact: "Good sleep reduces your risk by X%" 
- AI-generated insight paragraph about the sleep data and heart health
- 3 sleep improvement tips from AI

### 6. New Backend Endpoint
```python
POST /ai/sleep-analysis
  - Body: {hours: float, quality: int (1-5), bedtime: str, wake_time: str}
  - Requires auth, fetches user's risk_score
  - Sends to Groq with the sleep data and asks for: sleep_score (int 0-100), cardiac_impact (string), insights (string), tips (list of 3 strings)
  - Returns parsed JSON
```

### 7. Meal Analyser Page (frontend/src/pages/MealAnalyser.jsx)
Route: /meal-analyser

UI:
- File upload area: "Take a photo of your meal or upload an image" with camera/upload icons
- Image preview once selected
- OR a text input: "Describe your meal (e.g. 'Rice, chicken curry, salad')"
- "Analyse Meal" button

Since image analysis requires vision AI (not available in basic Groq), implement using text description:
- If image selected: extract filename, show preview, send filename + user-typed description to AI
- "Analyse Meal" → POST /ai/meal-analysis with {description: str}

Result:
- Cardiac Score: 0-100 (100 = best for heart)
- Color badge: Heart-Healthy (>70) / Moderate (40-70) / Avoid (<40)
- Nutrient breakdown cards: Sodium level, Saturated fat, Fiber, Antioxidants
- AI recommendations: 3 bullet points on how to improve this meal for heart health

### 8. New Backend Endpoint
```python
POST /ai/meal-analysis
  - Body: {description: str}
  - Sends to Groq: "Analyse this meal for cardiac health: '{description}'. Return JSON: {cardiac_score: int, label: str, sodium: str, saturated_fat: str, fiber: str, antioxidants: str, recommendations: [str, str, str]}"
  - Returns parsed JSON
```

### 9. Register new AI router
Create backend/routers/ai.py with all 4 new endpoints.
Register in main.py: app.include_router(ai.router, prefix="/ai", tags=["ai"])

### 10. Link new pages
Add to App.jsx:
- /recommendations → Recommendations
- /exercise-plan → ExercisePlanner
- /sleep → SleepAnalyser
- /meal-analyser → MealAnalyser

Add quick-action buttons on Dashboard (or Search page):
- "AI Recommendations" → /recommendations
- "Exercise Plan" → /exercise-plan
- "Sleep Analyser" → /sleep
- "Meal Analyser" → /meal-analyser

### AFTER BUILDING
Run: cd frontend && npm run build && npx cap sync android
```

---

# PHASE 6 PROMPT — Social, Emergency & Notifications

```
You are building Phase 6 (final phase) of the CardioTwin app. Codebase: FastAPI + SQLAlchemy + SQLite backend, React + Vite frontend.

## TECH STACK & CONTEXT
(Same as all previous phases)

## EXISTING MODELS
User: id, email, full_name, age, gender
DigitalTwin: id, user_id, risk_score, state_description, recorded_at

## WHAT TO BUILD

### 1. Emergency Contacts Page (frontend/src/pages/EmergencyContacts.jsx)
Route: /emergency-contacts

Header: "Emergency Contacts" with + button top right

Contact list: fetches GET /emergency-contacts (see below)
Each card:
- Contact avatar (initials circle)
- Name (bold) and relationship (subtitle: e.g. "Wife", "Father")
- Phone number
- Large "Call" button (green, tel: link)
- Delete button (red trash icon, with confirmation modal)

Pinned emergency services at top (non-deletable):
- 🚑 Emergency: tel:108 (Call Now button, red)
- 👮 Police: tel:100
- ❤️ Cardiac Helpline: tel:1800-102-4567

Add Contact sheet:
- Name (text input)
- Relationship (text input)
- Phone (tel input)
- "Save Contact" button → POST /emergency-contacts

### 2. Backend: Emergency Contacts (add to tracking.py or new router)
```python
New DB Model (models.py):
class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    relationship = Column(String)
    phone = Column(String)

GET /emergency-contacts — requires auth, returns list
POST /emergency-contacts — body: {name, relationship, phone}
DELETE /emergency-contacts/{id} — requires auth, verify ownership
```

### 3. Notifications Center (frontend/src/pages/Notifications.jsx)
Route: /notifications

Since we don't have push infrastructure, implement as an in-app notification feed.

Fetches GET /notifications (see backend below).

Notification types with icons:
- 💊 Medication Reminder — "Time to take your {med name}"
- ❤️ Health Alert — "Your risk score increased to {risk}%"
- 📊 Weekly Summary Ready — "Your weekly health report is ready"
- 🔥 Streak Reminder — "Don't break your {n}-day streak! Log vitals today"
- 🎉 Achievement Unlocked — "You earned the '{name}' badge"

Each notification card: icon, title, subtitle, time ("2h ago", "Yesterday"), read/unread state (bold title if unread, normal if read). Tap to mark as read.

Mark all read button in header.

### 4. Backend Notifications
```python
New DB Model (models.py):
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # "medication", "alert", "summary", "streak", "achievement"
    title = Column(String)
    body = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

GET /notifications — returns all notifications for user, newest first
POST /notifications/{id}/read — marks single notification as read
POST /notifications/read-all — marks all as read

Also add a startup function in main.py that auto-generates notifications:
- On every /tracking/vitals POST, if risk_score > 60, create a health alert notification
- On every /tracking/weekly-summary GET, if it's Monday and no summary notification this week, create one
```
Create a new router backend/routers/notifications.py and register it in main.py as prefix="/notifications".

### 5. Notification Bell on Dashboard
In frontend/src/pages/Dashboard.jsx:
- Add a bell icon button in the top right of the header
- Fetch GET /notifications, count unread
- Show a red badge with unread count on the bell icon
- Clicking bell navigates to /notifications

### 6. Doctor Detail Page (frontend/src/pages/DoctorDetail.jsx)
Route: /doctor/:doctorId

Since we have no real doctor database, implement with curated static data for 5 example cardiologists.

Each doctor profile shows:
- Doctor photo (use a generated placeholder avatar with initials)
- Name, specialization ("Interventional Cardiologist")
- Hospital affiliation
- Experience (years)
- Rating (stars, 4.2/5.0)
- Languages spoken
- About paragraph
- Consultation fee
- Two buttons: "Call Doctor" (tel: link) | "Get Directions" (Google Maps link)
- Reviews section: 3 patient reviews with star rating and text

Link to this page from the Search page's "Nearby Doctors" section — clicking a doctor card navigates to /doctor/{id}.

### 7. Final App Polish — Dashboard Notification Badge
Ensure the Dashboard bell icon updates its unread count in real time by fetching on every render.

### 8. Register new routes in App.jsx
- /emergency-contacts → EmergencyContacts
- /notifications → Notifications
- /doctor/:doctorId → DoctorDetail

### 9. Link from existing pages
- Profile page: add "Emergency Contacts" row → /emergency-contacts
- Dashboard: bell icon → /notifications  
- Search page: update doctor cards to link to /doctor/1, /doctor/2 etc.

### AFTER BUILDING
Run: cd frontend && npm run build && npx cap sync android
Verify the full app end-to-end: auth → dashboard → notifications → ECG → twin → sim → chat.
Congratulations — CardioTwin is now feature-complete!
```

---

## Summary: What Each Phase Delivers

| Phase | Key Deliverables |
|---|---|
| **Phase 1** | Forgot Password / OTP, 5-step Onboarding Survey, Privacy & Security, Help & FAQ |
| **Phase 2** | Medication Tracker, Add Medication, Vitals Charts (4 chart types), Symptom Logger |
| **Phase 3** | ECG History list, ECG Detail view, ECG Share sheet, PDF Health Report (print) |
| **Phase 4** | Risk Timeline graph (with/without treatment), Twin Insights, Health Streak, Achievements |
| **Phase 5** | AI Recommendations, Exercise Planner, Sleep Analyser, Meal Analyser |
| **Phase 6** | Emergency Contacts, In-App Notifications, Doctor Detail profiles, Final polish |
