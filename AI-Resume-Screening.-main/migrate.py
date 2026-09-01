import sqlite3

def migrate():
    conn = sqlite3.connect('smarthire.db')
    cursor = conn.cursor()
    
    queries = [
        'ALTER TABLE candidates ADD COLUMN fraud_score FLOAT DEFAULT 0.0;',
        'ALTER TABLE candidates ADD COLUMN fraud_status VARCHAR DEFAULT "Clean";',
        'ALTER TABLE candidates ADD COLUMN is_anonymized BOOLEAN DEFAULT 1;'
    ]
    
    for q in queries:
        try:
            cursor.execute(q)
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Skipped {q}: {e}")
            
    conn.commit()
    conn.close()
    print("Database Migration completed successfully.")

if __name__ == '__main__':
    migrate()
