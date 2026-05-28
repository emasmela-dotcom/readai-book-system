const CATEGORY_LABELS: Record<string, string> = {
  fiction: 'Fiction',
  non_fiction: 'Non-Fiction',
  children: "Children's",
  educational: 'Educational',
  movie_books: 'Movie Books',
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  sci_fi: 'Science Fiction',
  fantasy: 'Fantasy',
  mystery: 'Mystery',
  romance: 'Romance',
  literary: 'Literary',
  thriller: 'Thriller',
  horror: 'Horror',
  historical_fiction: 'Historical Fiction',
  self_help: 'Self-Help',
  business: 'Business',
  history: 'History',
  science: 'Science',
  biography: 'Biography',
  memoir: 'Memoir',
  philosophy: 'Philosophy',
  psychology: 'Psychology',
  health: 'Health',
  travel: 'Travel',
  cooking: 'Cooking',
  art: 'Art',
  technology: 'Technology',
  education: 'Education',
  sports: 'Sports',
  nature: 'Nature',
  picture_books: 'Picture Books',
  young_adult: 'Young Adult',
  middle_grade: 'Middle Grade',
  children_fiction: "Children's Fiction",
  programming: 'Programming',
  language_learning: 'Language Learning',
  academic: 'Academic',
  reference: 'Reference',
  textbooks: 'Textbooks',
}

function titleCase(slug: string): string {
  return slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? titleCase(slug)
}

export function subcategoryLabel(slug: string): string {
  return SUBCATEGORY_LABELS[slug] ?? titleCase(slug)
}
