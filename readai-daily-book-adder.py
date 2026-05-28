#!/usr/bin/env python3
"""
ReadAI Daily Book Adder
Automatically adds 50 books per day, evenly distributed across categories
Ensures proper categorization and maintains database integrity
"""

import json
import random
from datetime import datetime, timedelta
import os

class ReadAIDailyBookAdder:
    def __init__(self):
        self.database_file = "readai-books-database.json"
        self.daily_log_file = "readai-daily-additions.log"
        
        # Define categories and their target distribution (200 books total)
        self.category_distribution = {
            "fiction": {
                "sci_fi": 32,      # 16% of 200 = 32 books
                "fantasy": 32,     # 16% of 200 = 32 books  
                "mystery": 24,     # 12% of 200 = 24 books
                "romance": 24,     # 12% of 200 = 24 books
                "literary": 16,    # 8% of 200 = 16 books
                "thriller": 16,    # 8% of 200 = 16 books
                "horror": 12,      # 6% of 200 = 12 books
                "historical_fiction": 12,  # 6% of 200 = 12 books
                "adventure": 8,    # 4% of 200 = 8 books
                "humor": 8,        # 4% of 200 = 8 books
                "classic": 8,      # 4% of 200 = 8 books
                "contemporary": 8  # 4% of 200 = 8 books
            },
            "non_fiction": {
                "self_help": 24,   # 12% of 200 = 24 books
                "business": 20,    # 10% of 200 = 20 books
                "history": 16,     # 8% of 200 = 16 books
                "science": 16,     # 8% of 200 = 16 books
                "biography": 12,   # 6% of 200 = 12 books
                "memoir": 12,      # 6% of 200 = 12 books
                "philosophy": 8,   # 4% of 200 = 8 books
                "psychology": 8,   # 4% of 200 = 8 books
                "health": 8,       # 4% of 200 = 8 books
                "travel": 8,       # 4% of 200 = 8 books
                "cooking": 8,      # 4% of 200 = 8 books
                "art": 8,          # 4% of 200 = 8 books
                "politics": 8,     # 4% of 200 = 8 books
                "economics": 8,    # 4% of 200 = 8 books
                "technology": 8,   # 4% of 200 = 8 books
                "education": 8,    # 4% of 200 = 8 books
                "religion": 8,     # 4% of 200 = 8 books
                "sports": 8,       # 4% of 200 = 8 books
                "nature": 8,       # 4% of 200 = 8 books
                "true_crime": 8    # 4% of 200 = 8 books
            },
            "children": {
                "picture_books": 16,    # 8% of 200 = 16 books
                "young_adult": 16,      # 8% of 200 = 16 books
                "middle_grade": 12,     # 6% of 200 = 12 books
                "children_fiction": 12, # 6% of 200 = 12 books
                "educational": 8,       # 4% of 200 = 8 books
                "comics_graphic": 8     # 4% of 200 = 8 books
            },
            "educational": {
                "programming": 12,      # 6% of 200 = 12 books
                "language_learning": 8, # 4% of 200 = 8 books
                "academic": 8,         # 4% of 200 = 8 books
                "reference": 8,        # 4% of 200 = 8 books
                "textbooks": 4         # 2% of 200 = 4 books
            }
        }
        
        # Book templates for each category
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
    
    def load_database(self):
        """Load existing database or create new one"""
        if os.path.exists(self.database_file):
            with open(self.database_file, 'r') as f:
                return json.load(f)
        else:
            return self.create_empty_database()
    
    def create_empty_database(self):
        """Create empty database structure"""
        return {
            "categories": {
                "fiction": {"name": "Fiction", "description": "Imaginative stories and novels", "subcategories": {}},
                "non_fiction": {"name": "Non-Fiction", "description": "Factual and educational content", "subcategories": {}},
                "children": {"name": "Children & Young Adult", "description": "Books for young readers", "subcategories": {}},
                "educational": {"name": "Educational & Reference", "description": "Learning and reference materials", "subcategories": {}}
            },
            "total_books": 0,
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "version": "1.0"
        }
    
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
            "added_date": datetime.now().strftime("%Y-%m-%d")
        }
    
    def add_daily_books(self):
        """Add 200 books for today, evenly distributed across categories"""
        database = self.load_database()
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Check if books were already added today
        if os.path.exists(self.daily_log_file):
            with open(self.daily_log_file, 'r') as f:
                log_data = json.load(f)
                if log_data.get("last_added") == today:
                    print(f"✅ Books already added for {today}")
                    return
        
        print(f"📚 Adding 200 books for {today}...")
        
        books_added = 0
        
        # Add books according to distribution
        for main_category, subcategories in self.category_distribution.items():
            if main_category not in database["categories"]:
                database["categories"][main_category] = {
                    "name": main_category.replace("_", " ").title(),
                    "description": f"Books in {main_category} category",
                    "subcategories": {}
                }
            
            for subcategory, count in subcategories.items():
                if subcategory not in database["categories"][main_category]["subcategories"]:
                    database["categories"][main_category]["subcategories"][subcategory] = {
                        "name": subcategory.replace("_", " ").title(),
                        "books": []
                    }
                
                # Add the specified number of books
                for _ in range(count):
                    book = self.generate_book(main_category, subcategory)
                    database["categories"][main_category]["subcategories"][subcategory]["books"].append(book)
                    books_added += 1
                    print(f"  ✅ Added: {book['title']} by {book['author']} ({subcategory})")
        
        # Update database metadata
        database["total_books"] += books_added
        database["last_updated"] = today
        
        # Save database
        with open(self.database_file, 'w') as f:
            json.dump(database, f, indent=2)
        
        # Log today's additions
        log_entry = {
            "date": today,
            "books_added": books_added,
            "last_added": today,
            "total_books": database["total_books"]
        }
        
        if os.path.exists(self.daily_log_file):
            with open(self.daily_log_file, 'r') as f:
                log_data = json.load(f)
        else:
            log_data = {"entries": []}
        
        log_data["entries"].append(log_entry)
        log_data["last_added"] = today
        
        with open(self.daily_log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        print(f"\n🎉 Successfully added {books_added} books!")
        print(f"📊 Total books in database: {database['total_books']}")
        print(f"📅 Date: {today}")
    
    def show_stats(self):
        """Show current database statistics"""
        database = self.load_database()
        
        print("\n📊 ReadAI Book Database Statistics")
        print("=" * 50)
        print(f"📚 Total Books: {database['total_books']}")
        print(f"📅 Last Updated: {database['last_updated']}")
        print(f"📁 Categories: {len(database['categories'])}")
        
        for category_name, category_data in database["categories"].items():
            subcategory_count = len(category_data["subcategories"])
            total_books_in_category = sum(
                len(subcat["books"]) 
                for subcat in category_data["subcategories"].values()
            )
            print(f"  📖 {category_name.title()}: {total_books_in_category} books in {subcategory_count} subcategories")
    
    def run_daily_addition(self):
        """Run the daily book addition process"""
        print("🤖 ReadAI Daily Book Adder")
        print("=" * 40)
        
        self.add_daily_books()
        self.show_stats()
        
        print(f"\n🚀 Next run: Tomorrow at the same time")
        print("💡 This system will add 200 books per day automatically!")

def main():
    """Main function"""
    adder = ReadAIDailyBookAdder()
    adder.run_daily_addition()

if __name__ == "__main__":
    main()
