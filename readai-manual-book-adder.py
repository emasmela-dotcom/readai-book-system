#!/usr/bin/env python3
"""
ReadAI Manual Book Adder
Lightweight version - only runs when you manually execute it
No background processes or resource consumption
"""

import json
import random
from datetime import datetime
import os

class ReadAIManualBookAdder:
    def __init__(self):
        self.database_file = "readai-books-database.json"
        
        # Same distribution as before, but only runs when called
        self.category_distribution = {
            "fiction": {
                "sci_fi": 8, "fantasy": 8, "mystery": 6, "romance": 6,
                "literary": 4, "thriller": 4, "horror": 3, "historical_fiction": 3,
                "adventure": 2, "humor": 2, "classic": 2, "contemporary": 2
            },
            "non_fiction": {
                "self_help": 6, "business": 5, "history": 4, "science": 4,
                "biography": 3, "memoir": 3, "philosophy": 2, "psychology": 2,
                "health": 2, "travel": 2, "cooking": 2, "art": 2,
                "politics": 2, "economics": 2, "technology": 2, "education": 2,
                "religion": 2, "sports": 2, "nature": 2, "true_crime": 2
            },
            "children": {
                "picture_books": 4, "young_adult": 4, "middle_grade": 3,
                "children_fiction": 3, "educational": 2, "comics_graphic": 2
            },
            "educational": {
                "programming": 3, "language_learning": 2, "academic": 2,
                "reference": 2, "textbooks": 1
            }
        }
        
        # Same book templates
        self.book_templates = {
            "sci_fi": {
                "titles": ["Quantum Paradox", "Neural Networks", "Stellar Colonies", "Digital Consciousness"],
                "authors": ["Alex Chen", "Sarah Martinez", "David Kim", "Emma Thompson"],
                "tags": ["space", "technology", "future", "AI", "robots"]
            },
            "fantasy": {
                "titles": ["Dragon's Legacy", "Magic Academy", "Elven Kingdoms", "Shadow Realms"],
                "authors": ["Morgan Black", "Luna Silver", "Phoenix Gold", "Storm Rider"],
                "tags": ["magic", "dragons", "elves", "wizards", "quest"]
            },
            "mystery": {
                "titles": ["Midnight Murders", "Hidden Clues", "Silent Witness", "Dark Secrets"],
                "authors": ["Detective Stone", "Mystery Writer", "Crime Solver", "Private Eye"],
                "tags": ["murder", "detective", "mystery", "crime", "investigation"]
            },
            "romance": {
                "titles": ["Love's Journey", "Heart's Desire", "Passionate Embrace", "Sweet Romance"],
                "authors": ["Romance Writer", "Love Storyteller", "Heart Mender", "Passion Weaver"],
                "tags": ["love", "romance", "passion", "heart", "relationship"]
            },
            "self_help": {
                "titles": ["Mindful Living", "Success Habits", "Positive Thinking", "Life Transformation"],
                "authors": ["Life Coach", "Success Mentor", "Wellness Expert", "Motivation Speaker"],
                "tags": ["self-improvement", "motivation", "success", "happiness", "growth"]
            },
            "business": {
                "titles": ["Startup Success", "Business Strategy", "Leadership Excellence", "Marketing Mastery"],
                "authors": ["Business Expert", "Entrepreneur", "Management Guru", "Marketing Pro"],
                "tags": ["business", "entrepreneurship", "leadership", "marketing", "strategy"]
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
    
    def add_books_manually(self, num_books=50):
        """Add books manually - no background processes"""
        database = self.load_database()
        today = datetime.now().strftime("%Y-%m-%d")
        
        print(f"📚 Adding {num_books} books manually...")
        print("💡 This is a one-time addition - no background processes")
        
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
                    if books_added >= num_books:
                        break
                    book = self.generate_book(main_category, subcategory)
                    database["categories"][main_category]["subcategories"][subcategory]["books"].append(book)
                    books_added += 1
                    print(f"  ✅ Added: {book['title']} by {book['author']} ({subcategory})")
                
                if books_added >= num_books:
                    break
            
            if books_added >= num_books:
                break
        
        # Update database metadata
        database["total_books"] += books_added
        database["last_updated"] = today
        
        # Save database
        with open(self.database_file, 'w') as f:
            json.dump(database, f, indent=2)
        
        print(f"\n🎉 Successfully added {books_added} books!")
        print(f"📊 Total books in database: {database['total_books']}")
        print(f"📅 Date: {today}")
        print("💡 No background processes running - your Mac resources are free!")
    
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

def main():
    """Main function"""
    adder = ReadAIManualBookAdder()
    
    print("🤖 ReadAI Manual Book Adder")
    print("=" * 40)
    print("💡 Lightweight version - no background processes")
    print("🎯 Add books only when you run this script")
    print("")
    
    # Show current stats
    adder.show_stats()
    
    print("\n" + "=" * 40)
    response = input("Add 50 books now? (y/n): ").lower().strip()
    
    if response == 'y' or response == 'yes':
        adder.add_books_manually(50)
        print("\n" + "=" * 40)
        adder.show_stats()
    else:
        print("👍 No books added. Run this script anytime to add more books!")

if __name__ == "__main__":
    main()
