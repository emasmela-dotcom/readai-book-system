#!/usr/bin/env python3
"""
ReadAI Book Scheduler
Automatically runs the daily book adder every day
"""

import schedule
import time
import subprocess
import sys
from datetime import datetime

def run_daily_book_addition():
    """Run the daily book addition script"""
    print(f"\n🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Starting daily book addition...")
    
    try:
        # Run the daily book adder
        result = subprocess.run([sys.executable, "readai-daily-book-adder.py"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Daily book addition completed successfully!")
            print(result.stdout)
        else:
            print("❌ Error in daily book addition:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

def main():
    """Main scheduler function"""
    print("🤖 ReadAI Book Scheduler Started")
    print("📅 Book addition scheduled daily at 6:00 AM")
    print("⏰ Press Ctrl+C to stop")
    
    # Schedule book addition daily at 6:00 AM
    schedule.every().day.at("06:00").do(run_daily_book_addition)
    
    # Run initial addition
    run_daily_book_addition()
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    main()
