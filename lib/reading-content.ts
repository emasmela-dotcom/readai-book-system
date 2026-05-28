/** Reading copy derived from existing catalog fields and daily-books genre blurbs. */

const SUBCATEGORY_BLURBS: Record<string, string> = {
  sci_fi:
    'A thrilling science fiction adventure exploring space, technology, the future, AI, or time travel.',
  fantasy:
    'An epic fantasy tale of magic, dragons, heroes, quests, or mystical realms.',
  mystery:
    'A gripping mystery involving murder, secrets, detectives, crime, or investigation.',
  romance:
    'A heartwarming romance story about love, relationships, passion, second chances, or true love.',
  self_help:
    'A practical guide to personal growth, success, happiness, motivation, or life improvement.',
  business:
    'Essential insights into business strategy, leadership, entrepreneurship, marketing, or success.',
  horror: 'A chilling horror story of dread, the uncanny, and what waits in the dark.',
  thriller: 'A high-stakes thriller where every chapter tightens the tension.',
  literary: 'A literary novel focused on voice, character, and the weight of ordinary life.',
  historical_fiction: 'A historical novel that brings a past era to life through story.',
}

export interface ReadingSource {
  title: string
  author: string
  description: string | null
  category: string | null
  subcategory: string | null
  pages: number | null
}

export function readingParagraphs(book: ReadingSource): string[] {
  const paragraphs: string[] = []
  const desc = book.description?.trim()

  if (desc) paragraphs.push(desc)

  const genreBlurb =
    (book.subcategory && SUBCATEGORY_BLURBS[book.subcategory]) ||
    (book.category === 'fiction' ? SUBCATEGORY_BLURBS.mystery : null)

  if (genreBlurb && (!desc || desc.length < 80)) {
    paragraphs.push(genreBlurb)
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      `${book.title} by ${book.author} is part of the ReadAI club library.`,
    )
  }

  return paragraphs
}
