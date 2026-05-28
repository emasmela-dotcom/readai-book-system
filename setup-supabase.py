#!/usr/bin/env python3
"""
ReadAI Supabase Setup Script
Sets up Supabase database tables and migrates existing data
"""

import os
import json
from datetime import datetime
from readai_supabase_connector import ReadAISupabaseConnector

def setup_supabase_database():
    """Set up Supabase database with required tables"""
    print("🔧 Setting up Supabase database for ReadAI...")
    print("=" * 60)
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("❌ .env file not found!")
        print("📝 Please create a .env file with your Supabase credentials:")
        print("""
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
        """)
        return False
    
    try:
        connector = ReadAISupabaseConnector()
        
        # Test connection
        if not connector.test_connection():
            print("❌ Cannot connect to Supabase. Please check your credentials.")
            return False
        
        print("✅ Supabase connection successful!")
        
        # Create tables (this would be done via SQL in Supabase dashboard)
        print("\n📋 Please create these tables in your Supabase dashboard:")
        print("""
-- Books table
CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER,
    rating DECIMAL(2,1),
    description TEXT,
    tags TEXT[],
    pages INTEGER,
    difficulty TEXT,
    recommended_for TEXT,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    added_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    books_added INTEGER NOT NULL,
    total_books INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_subcategory ON books(subcategory);
CREATE INDEX idx_books_added_date ON books(added_date);
CREATE INDEX idx_daily_logs_date ON daily_logs(date);
        """)
        
        # Ask if user wants to migrate existing data
        migrate_choice = input("\n🔄 Do you want to migrate your existing 543 books to Supabase? (y/n): ")
        
        if migrate_choice.lower() == 'y':
            if os.path.exists('readai-books-database.json'):
                connector.migrate_from_json('readai-books-database.json')
            else:
                print("❌ readai-books-database.json not found!")
        else:
            print("⏭️ Skipping migration. You can run it later.")
        
        print("\n✅ Supabase setup complete!")
        print("🛡️ Your database will now stay active with daily book additions!")
        
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return False

def test_daily_addition():
    """Test the daily addition system"""
    print("\n🧪 Testing daily addition system...")
    
    try:
        connector = ReadAISupabaseConnector()
        connector.run_daily_addition()
        print("✅ Daily addition test successful!")
    except Exception as e:
        print(f"❌ Daily addition test failed: {e}")

if __name__ == "__main__":
    print("🚀 ReadAI Supabase Setup")
    print("=" * 30)
    
    # Setup database
    if setup_supabase_database():
        # Test daily addition
        test_choice = input("\n🧪 Do you want to test the daily addition system? (y/n): ")
        if test_choice.lower() == 'y':
            test_daily_addition()
    
    print("\n🎉 Setup complete! Your ReadAI system is now connected to Supabase!")
    print("🛡️ Daily book additions will prevent database pausing!")
