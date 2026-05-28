#!/usr/bin/env python3
"""
Test Supabase Setup
Quick test to verify everything is working
"""

import os
from readai_supabase_connector import ReadAISupabaseConnector

def test_setup():
    """Test the Supabase setup"""
    print("🧪 Testing ReadAI Supabase Setup")
    print("=" * 40)
    
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
    
    print("✅ .env file found")
    
    # Test connection
    try:
        connector = ReadAISupabaseConnector()
        print("✅ Supabase connector created")
        
        # Test connection
        if connector.test_connection():
            print("✅ Supabase connection successful!")
            print("🛡️ Database will stay active with daily additions!")
            return True
        else:
            print("❌ Supabase connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure your Supabase credentials are correct")
        return False

def show_next_steps():
    """Show next steps"""
    print("\n📋 Next Steps:")
    print("1. Create .env file with your Supabase credentials")
    print("2. Run: python3 setup-supabase.py")
    print("3. Set up database tables in Supabase dashboard")
    print("4. Run: python3 readai-supabase-scheduler.py")
    print("\n🛡️ This will prevent Supabase from pausing!")

if __name__ == "__main__":
    if test_setup():
        print("\n🎉 Setup test successful!")
        print("🚀 Ready to prevent Supabase pausing!")
    else:
        show_next_steps()
