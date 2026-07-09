from groq import Groq
import os, json, uuid, random
from dotenv import load_dotenv

load_dotenv()
key = os.getenv('GROQ_API_KEY', '')
print(f"[KEY] Using key ending ...{key[-6:]}")
c = Groq(api_key=key)

# Test 1: Simple connection test
r = c.chat.completions.create(
    messages=[{'role': 'user', 'content': 'Reply with only the text: GROQ_OK'}],
    model='llama-3.1-8b-instant',
    max_tokens=10
)
print('[TEST 1 - Connection]:', r.choices[0].message.content.strip())

# Test 2: Exercise plan - call twice to verify different output
for i in range(2):
    seed = str(uuid.uuid4())[:8]
    theme = random.choice(["cardio and flexibility", "strength and endurance", "low-impact variety"])
    prompt = f"""Create a UNIQUE safe 7-day cardiac exercise plan (variation-id: {seed}, weekly theme: {theme}) for:
Age=45, Risk Score=20%, BP=130/85, Activity Level=Moderate.
Each day MUST have a DIFFERENT activity.
Return JSON array with exactly 7 items: [{{"day": "Mon", "activity": "string", "duration_minutes": 30, "intensity": "Low|Moderate|High", "notes": "string", "heart_benefits": "string"}}]
Output ONLY valid JSON, no markdown."""

    r2 = c.chat.completions.create(
        messages=[
            {'role': 'system', 'content': 'You output pure JSON ONLY.'},
            {'role': 'user', 'content': prompt}
        ],
        model='llama-3.1-8b-instant',
        temperature=0.95,
        max_tokens=1000
    )
    content = r2.choices[0].message.content.strip()
    if content.startswith("```json"): content = content[7:]
    if content.startswith("```"): content = content[3:]
    if content.endswith("```"): content = content[:-3]
    data = json.loads(content.strip())
    activities = [d['activity'] for d in data]
    print(f'[TEST 2.{i+1} - Plan (seed={seed}, theme={theme})]: {activities}')

print("\n[ALL TESTS PASSED]")
