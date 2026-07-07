import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "verdict.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Make sure backend folder exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create cases table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        description TEXT NOT NULL,
        evidence_notes TEXT NOT NULL,
        counter_evidence_notes TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
    );
    """)
    
    # Create trial_logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trial_logs (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        prosecutor_argument TEXT NOT NULL,
        defense_argument TEXT NOT NULL,
        judge_verdict TEXT NOT NULL,
        confidence_score INTEGER NOT NULL,
        recommended_action TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases (id)
    );
    """)
    
    conn.commit()
    
    # Check if table is seeded
    cursor.execute("SELECT COUNT(*) FROM cases;")
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Seed verbatim
        seeded_cases = [
            (
                "d7b5b5c1-1406-444f-836e-9896503c004a",
                "Suspicious Login — New Location, Off Hours",
                "Security",
                "A login was detected from an unrecognized location outside normal business hours.",
                "IP address was flagged in a credential-stuffing incident 6 months ago. Login occurred at 3:14 AM from Romania. Account normally logs in from India between 9am-6pm. Device fingerprint does not match any previous session on record.",
                "Employee's calendar shows 'Conference - Bucharest' scheduled for this week. Company travel booking system shows a flight was booked 2 weeks ago for this employee.",
                "pending"
            ),
            (
                "6f481c19-97ef-4613-883a-4de3670de8d2",
                "Unusual High-Value Transaction",
                "Fraud",
                "A transaction was flagged for being significantly larger than the account's typical spending pattern.",
                "Charge of $4,000 vs. an average monthly spend of $50-100. Shipping address is new — never used on this account before. Purchase category is electronics, but past purchase history is groceries and subscriptions. Transaction occurred within 90 seconds of a password reset.",
                "Customer contacted support 3 days prior asking about an upcoming large purchase as a gift. The shipping address matches a 'recently added address' entry from 2 weeks ago in the account's profile settings.",
                "pending"
            ),
            (
                "f9ab2cd3-5b8d-4e92-a1f9-cf6e0cb708d7",
                "After-Hours Bulk Data Access",
                "Security",
                "A large volume of customer records was downloaded outside normal working hours.",
                "15,000 customer records downloaded at 11:47 PM on a Saturday. Employee's role is 'Junior Support Agent,' which does not require data-export permissions. No prior download activity exists in this employee 8-month account history.",
                "Employee's manager sent an email 2 hours before the download requesting an urgent weekend data pull for a compliance audit. Internal helpdesk ticket #4471 references this exact request.",
                "pending"
            )
        ]
        
        cursor.executemany("""
        INSERT INTO cases (id, title, domain, description, evidence_notes, counter_evidence_notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, seeded_cases)
        conn.commit()
        print("Database seeded with exactly 3 cases verbatim.")
    else:
        print("Database already initialized and seeded.")
        
    conn.close()

if __name__ == "__main__":
    init_db()
