#!/usr/bin/env python3
"""
Migrate books from Supabase to Neon database
"""

import os
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def get_supabase_books():
    """Fetch all books from Supabase"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
    
    print("🔌 Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("📚 Fetching books from Supabase...")
    # Fetch all books (Supabase has pagination, but we'll fetch in chunks)
    all_books = []
    page_size = 1000
    offset = 0
    
    while True:
        response = supabase.table('books').select('*').range(offset, offset + page_size - 1).execute()
        books = response.data
        
        if not books:
            break
            
        all_books.extend(books)
        print(f"  📦 Fetched {len(all_books)} books so far...")
        
        if len(books) < page_size:
            break
            
        offset += page_size
    
    print(f"✅ Found {len(all_books)} books in Supabase")
    return all_books

def migrate_to_neon(books):
    """Migrate books to Neon database"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        raise ValueError("DATABASE_URL must be set in .env file")
    
    print("\n🔌 Connecting to Neon...")
    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    
    try:
        with conn.cursor() as cur:
            # Check if books already exist
            cur.execute("SELECT COUNT(*) FROM books")
            existing_count = cur.fetchone()[0]
            
            if existing_count > 0:
                print(f"⚠️  Warning: Neon already has {existing_count} books")
                response = input("Do you want to continue and add more? (y/n): ")
                if response.lower() != 'y':
                    print("❌ Migration cancelled")
                    return
            
            print(f"\n📦 Migrating {len(books)} books to Neon...")
            
            batch_size = 50
            migrated_count = 0
            
            for i in range(0, len(books), batch_size):
                batch = books[i:i + batch_size]
                values = []
                
                for book in batch:
                    # Handle tags - convert list to PostgreSQL array format
                    tags = book.get('tags', [])
                    if isinstance(tags, list):
                        tags_str = "{" + ",".join([f'"{tag}"' for tag in tags]) + "}"
                    else:
                        tags_str = "{}"
                    
                    # Handle added_date - use existing or current date
                    added_date = book.get('added_date')
                    if not added_date:
                        added_date = datetime.now().strftime("%Y-%m-%d")
                    
                    values.append((
                        book.get('title'),
                        book.get('author'),
                        book.get('year'),
                        book.get('rating'),
                        book.get('description'),
                        tags_str,
                        book.get('pages'),
                        book.get('difficulty'),
                        book.get('recommended_for'),
                        book.get('category'),
                        book.get('subcategory'),
                        added_date
                    ))
                
                execute_values(
                    cur,
                    """INSERT INTO books (title, author, year, rating, description, tags, pages, difficulty, recommended_for, category, subcategory, added_date)
                       VALUES %s""",
                    values
                )
                
                migrated_count += len(batch)
                batch_num = (i // batch_size) + 1
                total_batches = (len(books) + batch_size - 1) // batch_size
                print(f"  📦 Batch {batch_num}/{total_batches}: Migrated {migrated_count}/{len(books)} books")
            
            # Also migrate daily_logs if they exist
            print("\n📋 Checking for daily_logs to migrate...")
            try:
                supabase_url = os.getenv('SUPABASE_URL')
                supabase_key = os.getenv('SUPABASE_KEY')
                supabase: Client = create_client(supabase_url, supabase_key)
                
                logs_response = supabase.table('daily_logs').select('*').order('date', desc=True).limit(100).execute()
                logs = logs_response.data
                
                if logs:
                    print(f"  📋 Found {len(logs)} daily log entries")
                    log_values = []
                    for log in logs:
                        log_values.append((
                            log.get('date'),
                            log.get('books_added', 0),
                            log.get('total_books', 0),
                            log.get('created_at', datetime.now().isoformat()),
                            log.get('status', 'success'),
                            log.get('error_message')
                        ))
                    
                    execute_values(
                        cur,
                        """INSERT INTO daily_logs (date, books_added, total_books, execution_time, status, error_message)
                           VALUES %s
                           ON CONFLICT (date) DO NOTHING""",
                        log_values
                    )
                    print(f"  ✅ Migrated {len(logs)} daily log entries")
            except Exception as e:
                print(f"  ⚠️  Could not migrate daily_logs: {e}")
            
            conn.commit()
            
        print(f"\n✅ Successfully migrated {migrated_count} books to Neon!")
        
        # Show final count
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM books")
            total = cur.fetchone()[0]
            print(f"📊 Total books in Neon: {total}")
            
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def main():
    """Main migration function"""
    print("🔄 Supabase to Neon Migration")
    print("=" * 50)
    
    try:
        # Fetch books from Supabase
        books = get_supabase_books()
        
        if not books:
            print("❌ No books found in Supabase to migrate")
            return
        
        # Migrate to Neon
        migrate_to_neon(books)
        
        print("\n🎉 Migration complete!")
        print("\n💡 Next steps:")
        print("   - Check book count: node check-count.js")
        print("   - Verify in Neon dashboard")
        print("   - Make sure Vercel has DATABASE_URL set for daily additions")
        
    except ValueError as e:
        print(f"\n❌ Configuration error: {e}")
        print("\n💡 Make sure your .env file has:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_KEY")
        print("   - DATABASE_URL (Neon connection string)")
        
    except Exception as e:
        print(f"\n❌ Migration error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

