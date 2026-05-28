#!/usr/bin/env python3
"""
Neon Database Setup Script
Creates necessary tables and verifies connection
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_connection():
    """Get database connection"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        raise ValueError(
            "❌ DATABASE_URL not found in .env file\n"
            "💡 Create a .env file with: DATABASE_URL=your-neon-connection-string"
        )
    
    return psycopg2.connect(database_url)

def create_tables(conn):
    """Create necessary tables"""
    with conn.cursor() as cur:
        print("📚 Creating books table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS books (
              id SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              author VARCHAR(255) NOT NULL,
              year INTEGER,
              rating DECIMAL(3,1),
              description TEXT,
              tags TEXT[],
              pages INTEGER,
              difficulty VARCHAR(50),
              recommended_for VARCHAR(50),
              category VARCHAR(100),
              subcategory VARCHAR(100),
              added_date DATE,
              created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        print("📋 Creating daily_logs table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daily_logs (
              id SERIAL PRIMARY KEY,
              date DATE UNIQUE NOT NULL,
              books_added INTEGER NOT NULL,
              total_books INTEGER NOT NULL,
              execution_time TIMESTAMP NOT NULL,
              status VARCHAR(20) NOT NULL,
              error_message TEXT,
              created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        print("🔍 Creating indexes...")
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_books_category ON books(category)
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_books_added_date ON books(added_date)
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date)
        """)
        
        conn.commit()
        print("✅ Tables and indexes created successfully!")

def verify_setup(conn):
    """Verify tables exist and connection works"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Check if tables exist
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('books', 'daily_logs')
        """)
        tables = [row['table_name'] for row in cur.fetchall()]
        
        print("\n📊 Database Status:")
        print("=" * 50)
        
        if 'books' in tables:
            cur.execute("SELECT COUNT(*) as count FROM books")
            book_count = cur.fetchone()['count']
            print(f"✅ books table: {book_count} books")
        else:
            print("❌ books table: NOT FOUND")
        
        if 'daily_logs' in tables:
            cur.execute("SELECT COUNT(*) as count FROM daily_logs")
            log_count = cur.fetchone()['count']
            print(f"✅ daily_logs table: {log_count} entries")
        else:
            print("❌ daily_logs table: NOT FOUND")
        
        print("=" * 50)

def main():
    """Main setup function"""
    print("🚀 Neon Database Setup")
    print("=" * 50)
    
    try:
        print("\n🔌 Connecting to Neon database...")
        conn = get_connection()
        print("✅ Connected successfully!")
        
        print("\n📦 Creating tables...")
        create_tables(conn)
        
        print("\n🔍 Verifying setup...")
        verify_setup(conn)
        
        print("\n🎉 Setup complete! Your Neon database is ready to use.")
        print("\n💡 Next steps:")
        print("   - Check book count: node check-count.js")
        print("   - Add books: python3 readai_neon_connector.py")
        
    except ValueError as e:
        print(f"\n{e}")
        print("\n📝 To fix this:")
        print("   1. Create a .env file in the project root")
        print("   2. Add: DATABASE_URL=your-neon-connection-string")
        print("   3. Get your connection string from Neon Console → Connection Details")
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        print("\n💡 Check:")
        print("   - Your DATABASE_URL is correct")
        print("   - Your Neon project is active (not paused)")
        print("   - Your connection string format is correct")
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        
    finally:
        if 'conn' in locals():
            conn.close()
            print("\n🔌 Connection closed")

if __name__ == "__main__":
    main()

