#!/usr/bin/env python3
"""
Quick Supabase Setup for ReadAI
Guides you through the complete setup process
"""

import os
import sys

def create_env_file():
    """Create .env file with user input"""
    print("🔧 ReadAI Supabase Setup")
    print("=" * 40)
    print()
    print("📋 Let's get your Supabase credentials...")
    print("1. Go to: https://supabase.com/dashboard")
    print("2. Select your project")
    print("3. Go to Settings → API")
    print("4. Copy the credentials below")
    print()
    
    # Get credentials from user
    supabase_url = input("🌐 Enter your Supabase Project URL: ").strip()
    supabase_key = input("🔑 Enter your Supabase Anon Key: ").strip()
    service_key = input("🔐 Enter your Supabase Service Role Key: ").strip()
    
    # Create .env file
    env_content = f"""# Supabase Configuration
SUPABASE_URL={supabase_url}
SUPABASE_KEY={supabase_key}
SUPABASE_SERVICE_KEY={service_key}
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created!")
    return True

def test_connection():
    """Test Supabase connection"""
    print("\n🧪 Testing Supabase connection...")
    
    try:
        from readai_supabase_connector import ReadAISupabaseConnector
        connector = ReadAISupabaseConnector()
        
        if connector.test_connection():
            print("✅ Supabase connection successful!")
            return True
        else:
            print("❌ Supabase connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def setup_database_tables():
    """Guide user to create database tables"""
    print("\n📋 Database Setup Required:")
    print("=" * 40)
    print("Go to your Supabase dashboard → SQL Editor")
    print("Run this SQL to create the required tables:")
    print()
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

-- Daily logs table
CREATE TABLE daily_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    books_added INTEGER NOT NULL,
    total_books INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_added_date ON books(added_date);
CREATE INDEX idx_daily_logs_date ON daily_logs(date);
    """)
    print()
    input("Press Enter after you've created the tables...")

def migrate_existing_books():
    """Migrate existing books to Supabase"""
    print("\n🔄 Migrating existing books...")
    
    try:
        from readai_supabase_connector import ReadAISupabaseConnector
        connector = ReadAISupabaseConnector()
        
        if os.path.exists('readai-books-database.json'):
            connector.migrate_from_json('readai-books-database.json')
            print("✅ Books migrated successfully!")
            return True
        else:
            print("❌ readai-books-database.json not found!")
            return False
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def test_daily_addition():
    """Test daily book addition"""
    print("\n🧪 Testing daily book addition...")
    
    try:
        from readai_supabase_connector import ReadAISupabaseConnector
        connector = ReadAISupabaseConnector()
        connector.run_daily_addition()
        print("✅ Daily addition test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Daily addition test failed: {e}")
        return False

def main():
    """Main setup process"""
    print("🚀 ReadAI Supabase Quick Setup")
    print("=" * 50)
    print("This will set up your ReadAI system to prevent Supabase pausing!")
    print()
    
    # Step 1: Create .env file
    if not os.path.exists('.env'):
        if not create_env_file():
            print("❌ Failed to create .env file")
            return
    else:
        print("✅ .env file already exists")
    
    # Step 2: Test connection
    if not test_connection():
        print("❌ Setup failed - check your credentials")
        return
    
    # Step 3: Setup database tables
    setup_database_tables()
    
    # Step 4: Migrate existing books
    migrate_choice = input("\n🔄 Do you want to migrate your existing 543 books? (y/n): ")
    if migrate_choice.lower() == 'y':
        migrate_existing_books()
    
    # Step 5: Test daily addition
    test_choice = input("\n🧪 Do you want to test daily book addition? (y/n): ")
    if test_choice.lower() == 'y':
        test_daily_addition()
    
    print("\n🎉 Setup Complete!")
    print("=" * 30)
    print("✅ Supabase connected")
    print("✅ Daily 200-book additions ready")
    print("✅ Database will stay active!")
    print()
    print("🚀 To start the daily scheduler:")
    print("   python3 readai-supabase-scheduler.py")
    print()
    print("🛡️ Your Supabase database will never pause again!")

if __name__ == "__main__":
    main()
