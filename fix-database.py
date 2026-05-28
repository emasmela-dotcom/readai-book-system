#!/usr/bin/env python3
"""
Quick fix for ReadAI database schema
Adds the missing added_date column
"""

import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fix_database():
    """Add missing column to books table"""
    try:
        supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
        
        # Try to add a book with added_date to see if column exists
        test_book = {
            'title': 'Test Book',
            'author': 'Test Author', 
            'category': 'test',
            'tags': ['test'],
            'added_date': '2025-10-24'
        }
        
        result = supabase.table('books').insert(test_book).execute()
        print("✅ Database schema is working correctly!")
        
        # Clean up test book
        supabase.table('books').delete().eq('title', 'Test Book').execute()
        print("🧹 Cleaned up test book")
        
    except Exception as e:
        print(f"❌ Database issue: {e}")
        print("\n🔧 Manual fix needed:")
        print("1. Go to your Supabase dashboard")
        print("2. Open SQL Editor")
        print("3. Run: ALTER TABLE books ADD COLUMN added_date DATE DEFAULT CURRENT_DATE;")
        print("4. Then run the ReadAI script again")

if __name__ == "__main__":
    fix_database()
