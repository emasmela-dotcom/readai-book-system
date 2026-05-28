#!/usr/bin/env python3
"""
ReadAI Neon Scheduler
Automated daily book addition to prevent Neon pausing
Runs every day at 6:00 AM to add 200 books
"""

import schedule
import time
from datetime import datetime
from readai_neon_connector import ReadAINeonConnector

def run_daily_book_addition():
    """Run daily book addition"""
    print(f"\n🕕 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Starting daily book addition...")
    
    try:
        with ReadAINeonConnector() as connector:
            connector.run_daily_addition()
        print("✅ Daily book addition completed successfully!")
        print("🛡️ Neon database will remain active!")
        
    except Exception as e:
        print(f"❌ Daily book addition failed: {e}")
        print("🔄 Will retry tomorrow...")

def show_next_runs():
    """Show next scheduled runs"""
    print("📅 Next 5 scheduled runs:")
    print("-" * 40)
    
    # Get next run time
    next_run = schedule.next_run()
    if next_run:
        print(f"Next run: {next_run}")
        
        # Show next 5 runs
        current_time = datetime.now()
        for i in range(5):
            run_time = current_time + (next_run - current_time) + (i * schedule.every().day.at("06:00").interval)
            print(f"{i+1}. {run_time.strftime('%Y-%m-%d %H:%M:%S')} (Day {run_time.strftime('%A')})")
    else:
        print("No scheduled runs found.")

def main():
    """Main scheduler function"""
    print("🤖 ReadAI Neon Scheduler")
    print("=" * 40)
    print("🛡️ This will prevent Neon pausing due to inactivity")
    print("📚 Adding 200 books daily to keep database active")
    print("⏰ Scheduled to run daily at 6:00 AM")
    
    # Clear any existing schedules
    schedule.clear()
    
    # Schedule daily book addition at 6:00 AM
    schedule.every().day.at("06:00").do(run_daily_book_addition)
    
    # Show next runs
    show_next_runs()
    
    print("\n🚀 Scheduler started! Press Ctrl+C to stop.")
    print("💡 The system will run automatically every day at 6:00 AM")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\n⏹️ Scheduler stopped by user")
        print("🛡️ Neon database may pause without daily activity")

if __name__ == "__main__":
    main()

