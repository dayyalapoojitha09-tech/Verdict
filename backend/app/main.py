import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import get_db_connection, init_db
from app.ai import run_prosecutor, run_defense, run_judge

app = FastAPI(title="VERDICT API Backend")

# Configure CORS so the React app can call this API from any Vite dev port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run database setup on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Response models
class CaseSchema(BaseModel):
    id: str
    title: str
    domain: str
    description: str
    evidence_notes: str
    counter_evidence_notes: str
    status: str

class TrialLogSchema(BaseModel):
    id: str
    case_id: str
    prosecutor_argument: str
    defense_argument: str
    judge_verdict: str
    confidence_score: int
    recommended_action: str
    created_at: str

class CreateCaseSchema(BaseModel):
    title: str
    domain: str
    description: str
    evidence_notes: str
    counter_evidence_notes: str

@app.post("/api/cases")
def create_case(payload: CreateCaseSchema):
    allowed_domains = [
        "Security", "Fraud", "Cybercrime", "Compliance", "HR", 
        "Operations", "Healthcare", "Legal", "AI Ethics", "Digital Forensics"
    ]
    if payload.domain not in allowed_domains:
        raise HTTPException(status_code=400, detail=f"Domain must be one of {allowed_domains}")
    if not payload.title.strip() or not payload.description.strip():
        raise HTTPException(status_code=400, detail="Title and description cannot be empty")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    case_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO cases (id, title, domain, description, evidence_notes, counter_evidence_notes, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    """, (
        case_id,
        payload.title.strip(),
        payload.domain.strip(),
        payload.description.strip(),
        payload.evidence_notes.strip(),
        payload.counter_evidence_notes.strip()
    ))
    conn.commit()
    
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row)

@app.get("/api/cases")
def get_cases():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")
    return dict(row)

@app.get("/api/cases/{case_id}/trial")
def get_trial_log(case_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trial_logs WHERE case_id = ? ORDER BY created_at DESC LIMIT 1", (case_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

@app.post("/api/cases/{case_id}/trial")
def run_trial(case_id: str):
    # 1. Fetch case details from database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    case = cursor.fetchone()
    if not case:
        conn.close()
        raise HTTPException(status_code=404, detail="Case not found")
    
    # 2. Check if trial log already exists
    cursor.execute("SELECT * FROM trial_logs WHERE case_id = ? ORDER BY created_at DESC LIMIT 1", (case_id,))
    existing_log = cursor.fetchone()
    if existing_log:
        conn.close()
        return dict(existing_log)
    
    # 3. Run sequential reasoning pipeline
    try:
        # Step 1: Prosecutor
        prosecutor_arg = run_prosecutor(
            case["title"],
            case["description"],
            case["evidence_notes"]
        )
        
        # Step 2: Defense
        defense_arg = run_defense(
            case["title"],
            case["description"],
            case["evidence_notes"],
            case["counter_evidence_notes"],
            prosecutor_arg
        )
        
        # Step 3: Judge
        judge_verdict = run_judge(
            case["title"],
            case["description"],
            prosecutor_arg,
            defense_arg
        )
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"AI reasoning pipeline failed: {str(e)}")
    
    # 4. Save results to trial_logs
    log_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO trial_logs (
            id, case_id, prosecutor_argument, defense_argument, 
            judge_verdict, confidence_score, recommended_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        log_id,
        case_id,
        prosecutor_arg,
        defense_arg,
        judge_verdict["verdict"],
        judge_verdict["confidence"],
        judge_verdict["recommended_action"]
    ))
    
    # 5. Update case status to 'verdict_reached'
    cursor.execute("UPDATE cases SET status = 'verdict_reached' WHERE id = ?", (case_id,))
    conn.commit()
    
    # Fetch final saved log to return
    cursor.execute("SELECT * FROM trial_logs WHERE id = ?", (log_id,))
    saved_log = cursor.fetchone()
    conn.close()
    
    return dict(saved_log)
