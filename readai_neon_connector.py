#!/usr/bin/env python3
"""
ReadAI Neon Connector
Connects ReadAI system to Neon database to prevent pausing
Handles daily book additions and database management
"""

import os
import json
import random
import psycopg2
from psycopg2.extras import execute_values, RealDictCursor
from datetime import datetime, timedelta
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load environment variables
load_dotenv()

class ReadAINeonConnector:
    def __init__(self):
        """Initialize Neon connection"""
        self.database_url = os.getenv('DATABASE_URL')
        
        if not self.database_url:
            raise ValueError("DATABASE_URL must be set in .env file")
        
        # Parse connection string and create connection
        self.conn = psycopg2.connect(self.database_url)
        self.conn.autocommit = False
        
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
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            self.conn.close()
    
    def test_connection(self):
        """Test Neon connection"""
        try:
            with self.conn.cursor() as cur:
                cur.execute("SELECT 1")
                result = cur.fetchone()
            print("✅ Neon connection successful!")
            return True
        except Exception as e:
            print(f"❌ Neon connection failed: {e}")
            return False
    
    def create_tables(self):
        """Create necessary tables in Neon"""
        print("🔧 Creating Neon tables...")
        
        # This would typically be done via SQL in Neon dashboard
        # For now, we'll assume tables exist
        print("✅ Tables should be created via Neon dashboard")
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
        """Add 200 books to Neon database"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Check if books were already added today
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM daily_logs WHERE date = %s", (today,))
                existing_log = cur.fetchone()
                if existing_log:
                    print(f"✅ Books already added for {today}")
                    return
        except Exception as e:
            print(f"⚠️ Could not check existing logs: {e}")
        
        print(f"📚 Adding 200 books to Neon for {today}...")
        
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
        
        # Insert books into Neon
        try:
            with self.conn.cursor() as cur:
                # Insert in batches of 50 to avoid timeout
                batch_size = 50
                for i in range(0, len(books_to_add), batch_size):
                    batch = books_to_add[i:i + batch_size]
                    # Convert tags list to PostgreSQL array format
                    values = []
                    for book in batch:
                        tags_str = "{" + ",".join([f'"{tag}"' for tag in book['tags']]) + "}"
                        values.append((
                            book['title'], book['author'], book['year'], book['rating'],
                            book['description'], tags_str, book['pages'], book['difficulty'],
                            book['recommended_for'], book['category'], book['subcategory'], book['added_date']
                        ))
                    
                    execute_values(
                        cur,
                        """INSERT INTO books (title, author, year, rating, description, tags, pages, difficulty, recommended_for, category, subcategory, added_date)
                           VALUES %s""",
                        values
                    )
                    print(f"  📦 Inserted batch {i//batch_size + 1}/{(len(books_to_add) + batch_size - 1)//batch_size}")
                
                # Log today's additions
                cur.execute("""
                    INSERT INTO daily_logs (date, books_added, total_books)
                    VALUES (%s, %s, %s)
                """, (today, books_added, books_added))
                
                self.conn.commit()
            
            print(f"\n🎉 Successfully added {books_added} books to Neon!")
            print(f"📊 Date: {today}")
            print(f"🛡️ This activity will prevent Neon from pausing!")
            
        except Exception as e:
            self.conn.rollback()
            print(f"❌ Error adding books to Neon: {e}")
    
    def add_daily_books_for_date(self, date_str):
        """Add 200 books for a specific date (for backfilling)"""
        books_to_add = []
        books_added = 0
        
        # Generate books according to distribution
        for main_category, subcategories in self.category_distribution.items():
            for subcategory, count in subcategories.items():
                for _ in range(count):
                    book = self.generate_book(main_category, subcategory)
                    book['added_date'] = date_str  # Override date
                    books_to_add.append(book)
                    books_added += 1
        
        # Insert books into Neon
        try:
            with self.conn.cursor() as cur:
                # Insert in batches of 50
                batch_size = 50
                for i in range(0, len(books_to_add), batch_size):
                    batch = books_to_add[i:i + batch_size]
                    values = []
                    for book in batch:
                        tags_str = "{" + ",".join([f'"{tag}"' for tag in book['tags']]) + "}"
                        values.append((
                            book['title'], book['author'], book['year'], book['rating'],
                            book['description'], tags_str, book['pages'], book['difficulty'],
                            book['recommended_for'], book['category'], book['subcategory'], book['added_date']
                        ))
                    
                    execute_values(
                        cur,
                        """INSERT INTO books (title, author, year, rating, description, tags, pages, difficulty, recommended_for, category, subcategory, added_date)
                           VALUES %s""",
                        values
                    )
                
                # Get total count after insertion
                cur.execute("SELECT COUNT(*) FROM books")
                total_books = cur.fetchone()[0]
                
                # Log this date's additions
                cur.execute("""
                    INSERT INTO daily_logs (date, books_added, total_books, execution_time, status)
                    VALUES (%s, %s, %s, %s, 'backfilled')
                    ON CONFLICT (date) DO UPDATE SET
                        books_added = EXCLUDED.books_added,
                        total_books = EXCLUDED.total_books,
                        status = 'backfilled'
                """, (date_str, books_added, total_books, datetime.now().isoformat()))
                
                self.conn.commit()
            
            return books_added
            
        except Exception as e:
            self.conn.rollback()
            raise e
    
    def get_stats(self):
        """Get database statistics from Neon"""
        try:
            with self.conn.cursor() as cur:
                # Get total book count
                cur.execute("SELECT COUNT(*) FROM books")
                total_books = cur.fetchone()[0]
                
                # Get today's additions
                today = datetime.now().strftime("%Y-%m-%d")
                cur.execute("SELECT * FROM daily_logs WHERE date = %s", (today,))
                today_log = cur.fetchone()
            
            print("\n📊 ReadAI Neon Database Statistics")
            print("=" * 50)
            print(f"📚 Total Books: {total_books}")
            print(f"📅 Today's Date: {today}")
            
            if today_log:
                print(f"📈 Books Added Today: {today_log[2]}")  # books_added column
            else:
                print("📈 Books Added Today: 0")
            
            print(f"🛡️ Database Status: Active (prevents pausing)")
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
    
    def migrate_from_json(self, json_file_path):
        """Migrate existing JSON database to Neon"""
        print(f"🔄 Migrating books from {json_file_path} to Neon...")
        
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
            with self.conn.cursor() as cur:
                for i in range(0, len(books_to_migrate), batch_size):
                    batch = books_to_migrate[i:i + batch_size]
                    values = []
                    for book in batch:
                        tags = book.get('tags', [])
                        tags_str = "{" + ",".join([f'"{tag}"' for tag in tags]) + "}" if isinstance(tags, list) else "{}"
                        values.append((
                            book.get('title'), book.get('author'), book.get('year'), book.get('rating'),
                            book.get('description'), tags_str, book.get('pages'), book.get('difficulty'),
                            book.get('recommended_for'), book.get('category'), book.get('subcategory'), 
                            book.get('added_date', datetime.now().strftime("%Y-%m-%d"))
                        ))
                    
                    execute_values(
                        cur,
                        """INSERT INTO books (title, author, year, rating, description, tags, pages, difficulty, recommended_for, category, subcategory, added_date)
                           VALUES %s""",
                        values
                    )
                    print(f"  📦 Migrated batch {i//batch_size + 1}/{(len(books_to_migrate) + batch_size - 1)//batch_size}")
                
                self.conn.commit()
            
            print(f"✅ Successfully migrated {len(books_to_migrate)} books to Neon!")
            
        except Exception as e:
            self.conn.rollback()
            print(f"❌ Error migrating books: {e}")
    
    def run_daily_addition(self):
        """Run the daily book addition process"""
        print("🤖 ReadAI Neon Daily Book Adder")
        print("=" * 50)
        
        # Test connection first
        if not self.test_connection():
            return
        
        # Add daily books
        self.add_daily_books()
        
        # Show stats
        self.get_stats()
        
        print(f"\n🚀 Next run: Tomorrow at the same time")
        print("💡 This system will add 200 books per day to Neon!")
        print("🛡️ This activity will prevent Neon from pausing!")

def main():
    """Main function"""
    try:
        with ReadAINeonConnector() as connector:
            connector.run_daily_addition()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure to set up your .env file with DATABASE_URL (Neon connection string)")

if __name__ == "__main__":
    main()

