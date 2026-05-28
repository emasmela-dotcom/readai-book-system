#!/usr/bin/env python3
"""
ReadAI Supabase Connector
Connects ReadAI system to Supabase database to prevent pausing
Handles daily book additions and database management
"""

import os
import json
import random
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ReadAISupabaseConnector:
    def __init__(self):
        """Initialize Supabase connection"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and Key must be set in .env file")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Book templates for generation
        self.book_templates = {
            "sci_fi": {
                "titles": [
                    "Quantum Paradox", "Neural Networks", "Stellar Colonies", "Digital Consciousness",
                    "Time Fractures", "Galactic Empires", "AI Revolution", "Space Odyssey",
                    "Cyberpunk Chronicles", "Dimensional Rifts", "Mars Chronicles", "Robot Uprising",
                    "Virtual Realities", "Alien Contact", "Future Wars", "Genetic Evolution"
                ],
                "authors": [
                    "Alex Chen", "Sarah Martinez", "David Kim", "Emma Thompson", "Michael Rodriguez",
                    "Lisa Wang", "James Anderson", "Rachel Green", "Tom Wilson", "Anna Lee"
                ],
                "tags": ["space", "technology", "future", "AI", "robots", "time travel", "alien", "cyberpunk"]
            },
            "fantasy": {
                "titles": [
                    "Dragon's Legacy", "Magic Academy", "Elven Kingdoms", "Shadow Realms",
                    "Crystal Prophecy", "Mystic Warriors", "Enchanted Forests", "Ancient Spells",
                    "Phoenix Rising", "Wizard's Quest", "Fairy Tales", "Mythical Creatures",
                    "Dark Magic", "Light Bringers", "Elemental Powers", "Sacred Artifacts"
                ],
                "authors": [
                    "Morgan Black", "Luna Silver", "Phoenix Gold", "Storm Rider", "Crystal Moon",
                    "Shadow Walker", "Light Bringer", "Dragon Heart", "Mystic Sage", "Enchanted Soul"
                ],
                "tags": ["magic", "dragons", "elves", "wizards", "quest", "prophecy", "mythical", "enchanted"]
            },
            "mystery": {
                "titles": [
                    "Midnight Murders", "Hidden Clues", "Silent Witness", "Dark Secrets",
                    "Crime Scene", "Detective's Journal", "Cold Case Files", "Mystery Manor",
                    "Shadow Suspects", "Blood Evidence", "Private Eye", "Murder Mystery",
                    "Criminal Minds", "Deadly Deception", "Fatal Attraction", "Sinister Plot"
                ],
                "authors": [
                    "Detective Stone", "Mystery Writer", "Crime Solver", "Private Eye", "Investigator",
                    "Sleuth Master", "Case Solver", "Mystery Hunter", "Crime Analyst", "Truth Seeker"
                ],
                "tags": ["murder", "detective", "mystery", "crime", "investigation", "clues", "suspense", "thriller"]
            },
            "romance": {
                "titles": [
                    "Love's Journey", "Heart's Desire", "Passionate Embrace", "Sweet Romance",
                    "Forbidden Love", "Second Chances", "Love Letters", "Wedding Bells",
                    "Romantic Getaway", "Love Story", "Heartbreak Hotel", "True Love",
                    "Love Triangle", "Romantic Comedy", "Love at First Sight", "Eternal Love"
                ],
                "authors": [
                    "Romance Writer", "Love Storyteller", "Heart Mender", "Passion Weaver", "Love Creator",
                    "Romantic Soul", "Heart Healer", "Love Dreamer", "Passion Writer", "Romance Queen"
                ],
                "tags": ["love", "romance", "passion", "heart", "relationship", "wedding", "dating", "emotion"]
            },
            "self_help": {
                "titles": [
                    "Mindful Living", "Success Habits", "Positive Thinking", "Life Transformation",
                    "Goal Setting", "Stress Management", "Confidence Building", "Time Mastery",
                    "Emotional Intelligence", "Leadership Skills", "Communication Mastery", "Life Balance",
                    "Personal Growth", "Motivation Secrets", "Happiness Formula", "Life Purpose"
                ],
                "authors": [
                    "Life Coach", "Success Mentor", "Wellness Expert", "Motivation Speaker", "Growth Guide",
                    "Transformation Coach", "Mindfulness Teacher", "Life Strategist", "Personal Development", "Wellness Guru"
                ],
                "tags": ["self-improvement", "motivation", "success", "happiness", "growth", "mindfulness", "goals", "life"]
            },
            "business": {
                "titles": [
                    "Startup Success", "Business Strategy", "Leadership Excellence", "Marketing Mastery",
                    "Financial Freedom", "Entrepreneur's Guide", "Team Building", "Innovation Drive",
                    "Sales Psychology", "Digital Marketing", "Business Growth", "Investment Wisdom",
                    "Management Skills", "Customer Service", "Business Planning", "Market Analysis"
                ],
                "authors": [
                    "Business Expert", "Entrepreneur", "Management Guru", "Marketing Pro", "Leadership Coach",
                    "Business Strategist", "Success Coach", "Innovation Leader", "Sales Expert", "Business Mentor"
                ],
                "tags": ["business", "entrepreneurship", "leadership", "marketing", "strategy", "success", "management", "innovation"]
            }
        }
        
        # 200-book distribution
        self.category_distribution = {
            "fiction": {
                "sci_fi": 16, "fantasy": 16, "mystery": 12, "romance": 12,
                "literary": 8, "thriller": 8, "horror": 4, "historical_fiction": 4
            },
            "non_fiction": {
                "self_help": 10, "business": 8, "history": 6, "science": 6,
                "biography": 4, "memoir": 4, "philosophy": 4, "psychology": 4,
                "health": 4, "travel": 4, "cooking": 4, "art": 4,
                "technology": 4, "education": 4, "sports": 4, "nature": 4
            },
            "children": {
                "picture_books": 8, "young_adult": 8, "middle_grade": 6,
                "children_fiction": 6, "educational": 2
            },
            "educational": {
                "programming": 6, "language_learning": 4, "academic": 4,
                "reference": 4, "textbooks": 2
            }
        }
    
    def test_connection(self):
        """Test Supabase connection"""
        try:
            # Test connection by getting a simple query
            result = self.supabase.table('books').select('id').limit(1).execute()
            print("✅ Supabase connection successful!")
            return True
        except Exception as e:
            print(f"❌ Supabase connection failed: {e}")
            return False
    
    def create_tables(self):
        """Create necessary tables in Supabase"""
        print("🔧 Creating Supabase tables...")
        
        # This would typically be done via SQL in Supabase dashboard
        # For now, we'll assume tables exist
        print("✅ Tables should be created via Supabase dashboard")
        print("📋 Required tables:")
        print("   - books (id, title, author, year, rating, description, tags, pages, difficulty, recommended_for, category, subcategory, added_date)")
        print("   - categories (id, name, description)")
        print("   - daily_logs (id, date, books_added, total_books)")
    
    def generate_book(self, category, subcategory):
        """Generate a book for the specified category and subcategory"""
        templates = self.book_templates.get(subcategory, {
            "titles": [f"Book Title {random.randint(1, 1000)}"],
            "authors": [f"Author {random.randint(1, 100)}"],
            "tags": ["general", "book", "reading"]
        })
        
        title = random.choice(templates["titles"])
        author = random.choice(templates["authors"])
        year = random.randint(1950, 2024)
        rating = round(random.uniform(3.5, 5.0), 1)
        pages = random.randint(150, 800)
        
        # Generate description based on category
        descriptions = {
            "sci_fi": f"A thrilling science fiction adventure exploring {random.choice(['space', 'technology', 'the future', 'AI', 'time travel'])}.",
            "fantasy": f"An epic fantasy tale of {random.choice(['magic', 'dragons', 'heroes', 'quests', 'mystical realms'])}.",
            "mystery": f"A gripping mystery involving {random.choice(['murder', 'secrets', 'detectives', 'crime', 'investigation'])}.",
            "romance": f"A heartwarming romance story about {random.choice(['love', 'relationships', 'passion', 'second chances', 'true love'])}.",
            "self_help": f"A practical guide to {random.choice(['personal growth', 'success', 'happiness', 'motivation', 'life improvement'])}.",
            "business": f"Essential insights into {random.choice(['business strategy', 'leadership', 'entrepreneurship', 'marketing', 'success'])}."
        }
        
        description = descriptions.get(subcategory, f"An engaging {subcategory} book that will captivate readers.")
        
        return {
            "title": title,
            "author": author,
            "year": year,
            "rating": rating,
            "description": description,
            "tags": random.sample(templates["tags"], min(4, len(templates["tags"]))),
            "pages": pages,
            "difficulty": random.choice(["beginner", "intermediate", "advanced"]),
            "recommended_for": random.choice(["adults", "young adults", "children", "all ages"]),
            "category": category,
            "subcategory": subcategory,
            "added_date": datetime.now().strftime("%Y-%m-%d")
        }
    
    def add_daily_books(self):
        """Add 200 books to Supabase database"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Check if books were already added today
        try:
            existing_log = self.supabase.table('daily_logs').select('*').eq('date', today).execute()
            if existing_log.data:
                print(f"✅ Books already added for {today}")
                return
        except Exception as e:
            print(f"⚠️ Could not check existing logs: {e}")
        
        print(f"📚 Adding 200 books to Supabase for {today}...")
        
        books_to_add = []
        books_added = 0
        
        # Generate books according to distribution
        for main_category, subcategories in self.category_distribution.items():
            for subcategory, count in subcategories.items():
                for _ in range(count):
                    book = self.generate_book(main_category, subcategory)
                    books_to_add.append(book)
                    books_added += 1
                    print(f"  ✅ Generated: {book['title']} by {book['author']} ({subcategory})")
        
        # Insert books into Supabase
        try:
            # Insert in batches of 50 to avoid timeout
            batch_size = 50
            for i in range(0, len(books_to_add), batch_size):
                batch = books_to_add[i:i + batch_size]
                result = self.supabase.table('books').insert(batch).execute()
                print(f"  📦 Inserted batch {i//batch_size + 1}/{(len(books_to_add) + batch_size - 1)//batch_size}")
            
            # Log today's additions
            log_entry = {
                "date": today,
                "books_added": books_added,
                "total_books": books_added  # This would be calculated from actual count
            }
            
            self.supabase.table('daily_logs').insert(log_entry).execute()
            
            print(f"\n🎉 Successfully added {books_added} books to Supabase!")
            print(f"📊 Date: {today}")
            print(f"🛡️ This activity will prevent Supabase from pausing!")
            
        except Exception as e:
            print(f"❌ Error adding books to Supabase: {e}")
    
    def get_stats(self):
        """Get database statistics from Supabase"""
        try:
            # Get total book count
            books_result = self.supabase.table('books').select('id', count='exact').execute()
            total_books = books_result.count if books_result.count else 0
            
            # Get today's additions
            today = datetime.now().strftime("%Y-%m-%d")
            today_log = self.supabase.table('daily_logs').select('*').eq('date', today).execute()
            
            print("\n📊 ReadAI Supabase Database Statistics")
            print("=" * 50)
            print(f"📚 Total Books: {total_books}")
            print(f"📅 Today's Date: {today}")
            
            if today_log.data:
                print(f"📈 Books Added Today: {today_log.data[0]['books_added']}")
            else:
                print("📈 Books Added Today: 0")
            
            print(f"🛡️ Database Status: Active (prevents pausing)")
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
    
    def migrate_from_json(self, json_file_path):
        """Migrate existing JSON database to Supabase"""
        print(f"🔄 Migrating books from {json_file_path} to Supabase...")
        
        try:
            with open(json_file_path, 'r') as f:
                data = json.load(f)
            
            books_to_migrate = []
            
            # Extract books from JSON structure
            for category_name, category_data in data.get('categories', {}).items():
                for subcategory_name, subcategory_data in category_data.get('subcategories', {}).items():
                    for book in subcategory_data.get('books', []):
                        book['category'] = category_name
                        book['subcategory'] = subcategory_name
                        books_to_migrate.append(book)
            
            print(f"📚 Found {len(books_to_migrate)} books to migrate")
            
            # Insert in batches
            batch_size = 50
            for i in range(0, len(books_to_migrate), batch_size):
                batch = books_to_migrate[i:i + batch_size]
                self.supabase.table('books').insert(batch).execute()
                print(f"  📦 Migrated batch {i//batch_size + 1}/{(len(books_to_migrate) + batch_size - 1)//batch_size}")
            
            print(f"✅ Successfully migrated {len(books_to_migrate)} books to Supabase!")
            
        except Exception as e:
            print(f"❌ Error migrating books: {e}")
    
    def run_daily_addition(self):
        """Run the daily book addition process"""
        print("🤖 ReadAI Supabase Daily Book Adder")
        print("=" * 50)
        
        # Test connection first
        if not self.test_connection():
            return
        
        # Add daily books
        self.add_daily_books()
        
        # Show stats
        self.get_stats()
        
        print(f"\n🚀 Next run: Tomorrow at the same time")
        print("💡 This system will add 200 books per day to Supabase!")
        print("🛡️ This activity will prevent Supabase from pausing!")

def main():
    """Main function"""
    try:
        connector = ReadAISupabaseConnector()
        connector.run_daily_addition()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure to set up your .env file with Supabase credentials")

if __name__ == "__main__":
    main()
