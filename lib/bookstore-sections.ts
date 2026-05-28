/** Bookstore-style departments — maps to ReadAI category + subcategory in Neon */

export interface BookstoreAisle {
  id: string
  title: string
  tagline: string
  category: string
  /** Omit to include all subcategories in that department */
  subcategory?: string
}

export const BOOKSTORE_AISLES: BookstoreAisle[] = [
  // Fiction — front of store
  { id: 'horror', title: 'Horror', tagline: 'Chills, dread, and things that wait in the dark.', category: 'fiction', subcategory: 'horror' },
  { id: 'mystery', title: 'Mystery', tagline: 'Puzzles, detectives, and secrets worth unraveling.', category: 'fiction', subcategory: 'mystery' },
  { id: 'thriller', title: 'Thriller', tagline: 'Pulse-quickening stakes from the first page.', category: 'fiction', subcategory: 'thriller' },
  { id: 'romance', title: 'Romance', tagline: 'Love stories across every mood and era.', category: 'fiction', subcategory: 'romance' },
  { id: 'sci-fi', title: 'Science Fiction', tagline: 'Future worlds, technology, and the stars.', category: 'fiction', subcategory: 'sci_fi' },
  { id: 'fantasy', title: 'Fantasy', tagline: 'Magic, myth, and realms beyond the map.', category: 'fiction', subcategory: 'fantasy' },
  { id: 'literary', title: 'Literary Fiction', tagline: 'Character, voice, and the drama of human life.', category: 'fiction', subcategory: 'literary' },
  { id: 'historical-fiction', title: 'Historical Fiction', tagline: 'Past eras brought to life through story.', category: 'fiction', subcategory: 'historical_fiction' },
  // Non-fiction
  { id: 'biography', title: 'Biography & Memoir', tagline: 'Lives examined, remembered, and retold.', category: 'non_fiction', subcategory: 'biography' },
  { id: 'history', title: 'History', tagline: 'Civilizations, turning points, and memory.', category: 'non_fiction', subcategory: 'history' },
  { id: 'business', title: 'Business', tagline: 'Strategy, leadership, and the world of work.', category: 'non_fiction', subcategory: 'business' },
  { id: 'science', title: 'Science', tagline: 'Discovery, nature, and how things work.', category: 'non_fiction', subcategory: 'science' },
  { id: 'self-help', title: 'Self-Help', tagline: 'Growth, habits, and a clearer path forward.', category: 'non_fiction', subcategory: 'self_help' },
  { id: 'psychology', title: 'Psychology', tagline: 'Mind, behavior, and what drives us.', category: 'non_fiction', subcategory: 'psychology' },
  { id: 'health', title: 'Health & Wellness', tagline: 'Body, balance, and living well.', category: 'non_fiction', subcategory: 'health' },
  { id: 'travel', title: 'Travel', tagline: 'Journeys, places, and far horizons.', category: 'non_fiction', subcategory: 'travel' },
  { id: 'cooking', title: 'Cooking & Food', tagline: 'Kitchen craft, flavor, and gathering.', category: 'non_fiction', subcategory: 'cooking' },
  { id: 'technology', title: 'Technology', tagline: 'Innovation, digital life, and what comes next.', category: 'non_fiction', subcategory: 'technology' },
  // Children's & learning
  { id: 'young-adult', title: 'Young Adult', tagline: 'Coming-of-age voices for teen readers.', category: 'children', subcategory: 'young_adult' },
  { id: 'picture-books', title: "Picture Books", tagline: 'Stories for the youngest readers.', category: 'children', subcategory: 'picture_books' },
  { id: 'middle-grade', title: 'Middle Grade', tagline: 'Adventure and heart for ages 8–12.', category: 'children', subcategory: 'middle_grade' },
  { id: 'programming', title: 'Programming', tagline: 'Code, systems, and building software.', category: 'educational', subcategory: 'programming' },
  { id: 'textbooks', title: 'Textbooks & Academic', tagline: 'Structured learning across disciplines.', category: 'educational', subcategory: 'textbooks' },
  { id: 'language', title: 'Language Learning', tagline: 'New tongues, new worlds.', category: 'educational', subcategory: 'language_learning' },
  // Specialty
  { id: 'movie-books', title: 'Books on Film', tagline: 'Cinema, adaptation, and the screen.', category: 'movie_books' },
]

export function getAisleById(id: string): BookstoreAisle | undefined {
  return BOOKSTORE_AISLES.find((aisle) => aisle.id === id)
}

export function findAisleForBook(
  category: string,
  subcategory: string | null | undefined,
): BookstoreAisle | undefined {
  if (subcategory) {
    return BOOKSTORE_AISLES.find(
      (a) => a.category === category && a.subcategory === subcategory,
    )
  }
  return BOOKSTORE_AISLES.find((a) => a.category === category && !a.subcategory)
}
