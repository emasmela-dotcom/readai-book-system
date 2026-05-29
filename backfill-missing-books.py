#!/usr/bin/env python3
"""
Backfill missing daily book additions in Neon
This will add books for the missing days (Oct 24 - Nov 14, 2025)
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from readai_neon_connector import ReadAINeonConnector

load_dotenv()

def backfill_books():
    """Add books for missing days"""
    print("🔄 Backfilling Missing Books")
    print("=" * 50)
    
    # Calculate missing days
    last_date = datetime(2025, 10, 23)  # Last successful addition
    today = datetime.now()
    days_missing = (today - last_date).days
    
    print(f"📅 Last addition: {last_date.strftime('%Y-%m-%d')}")
    print(f"📅 Today: {today.strftime('%Y-%m-%d')}")
    print(f"📊 Missing days: {days_missing} days")
    print(f"📚 Books that should have been added: {days_missing * 200} books")
    
    response = input(f"\n❓ Do you want to backfill {days_missing * 200} books? (y/n): ")
    if response.lower() != 'y':
        print("❌ Backfill cancelled")
        return
    
    try:
        connector = ReadAINeonConnector()
        
        # Add books for each missing day
        total_added = 0
        current_date = last_date + timedelta(days=1)
        
        while current_date < today:
            date_str = current_date.strftime('%Y-%m-%d')
            print(f"\n📅 Adding books for {date_str}...")
            
            # Check if books already exist for this date
            with connector.conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM books WHERE added_date = %s", (date_str,))
                existing = cur.fetchone()[0]
                
                if existing > 0:
                    print(f"  ⚠️  {existing} books already exist for this date, skipping...")
                    current_date += timedelta(days=1)
                    continue
            
            # Add 200 books for this date
            try:
                books_added = connector.add_daily_books_for_date(date_str)
                total_added += books_added
            except Exception as e:
                print(f"  ❌ Error adding books for {date_str}: {e}")
                continue
            
            print(f"  ✅ Added {books_added} books for {date_str}")
            current_date += timedelta(days=1)
        
        print(f"\n🎉 Backfill complete!")
        print(f"📊 Total books added: {total_added}")
        
        # Show final stats
        connector.get_stats()
        
    except Exception as e:
        print(f"❌ Error during backfill: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    backfill_books()

