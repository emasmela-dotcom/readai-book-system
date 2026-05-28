#!/usr/bin/env python3
"""
Fix Neon database schema to handle longer values
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def fix_schema():
    """Update schema to use TEXT for fields that might be longer"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        raise ValueError("DATABASE_URL must be set in .env file")
    
    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    
    try:
        with conn.cursor() as cur:
            print("🔧 Fixing schema to handle longer values...")
            
            # Alter columns to TEXT for fields that might be too long
            cur.execute("""
                ALTER TABLE books 
                ALTER COLUMN difficulty TYPE TEXT,
                ALTER COLUMN recommended_for TYPE TEXT,
                ALTER COLUMN category TYPE TEXT,
                ALTER COLUMN subcategory TYPE TEXT
            """)
            
            conn.commit()
            print("✅ Schema updated successfully!")
            
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        # If columns don't exist or are already TEXT, that's okay
        if "does not exist" not in str(e) and "already" not in str(e).lower():
            raise
    finally:
        conn.close()

if __name__ == "__main__":
    fix_schema()

