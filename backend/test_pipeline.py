import sys
import os
import json

# Add app to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "app"))

from ai import run_prosecutor, run_defense, run_judge
from database import get_db_connection, init_db

def test_pipeline():
    init_db()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = 'd7b5b5c1-1406-444f-836e-9896503c004a'")
    case = cursor.fetchone()
    conn.close()
    
    if not case:
        print("Error: Case 1 not found in database.")
        return
        
    print("=" * 60)
    print("RUNNING SEQUENTIAL AI PIPELINE FOR CASE 1:")
    print(f"Title: {case['title']}")
    print(f"Description: {case['description']}")
    print("=" * 60)
    
    print("\n--- STEP 1: PROSECUTOR ---")
    try:
        prosecutor_arg = run_prosecutor(
            case["title"], 
            case["description"], 
            case["evidence_notes"]
        )
        print("Prosecutor Output:")
        print(prosecutor_arg)
    except Exception as e:
        print(f"Prosecutor Error: {e}")
        return
        
    print("\n--- STEP 2: DEFENSE ---")
    try:
        defense_arg = run_defense(
            case["title"], 
            case["description"], 
            case["evidence_notes"], 
            case["counter_evidence_notes"], 
            prosecutor_arg
        )
        print("Defense Output:")
        print(defense_arg)
    except Exception as e:
        print(f"Defense Error: {e}")
        return
        
    print("\n--- STEP 3: JUDGE ---")
    try:
        judge_verdict = run_judge(
            case["title"], 
            case["description"], 
            prosecutor_arg, 
            defense_arg
        )
        print("Judge Output (Parsed JSON):")
        print(json.dumps(judge_verdict, indent=2))
    except Exception as e:
        print(f"Judge Error: {e}")
        return
        
    print("=" * 60)
    print("Pipeline execution test finished.")

if __name__ == "__main__":
    test_pipeline()
