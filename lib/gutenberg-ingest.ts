import { sql } from '@/lib/db'
import { resolveBestCoverUrl } from '@/lib/book-covers'
import {
  downloadGutenbergCacheText,
  downloadPlainText,
  fetchGutendexPage,
  isFullBookText,
  type GutendexBook,
  wordCount,
} from '@/lib/gutenberg'

/** Public-domain classics — fetched from gutenberg.org when Gutendex is unavailable. */
export const CURATED_GUTENBERG = [
  { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen', subjects: ['Romance', 'England -- Fiction'] },
  { id: 84, title: 'Frankenstein; Or, The Modern Prometheus', author: 'Mary Wollstonecraft Shelley', subjects: ['Science fiction', 'Horror'] },
  { id: 2701, title: 'Moby Dick; Or, The Whale', author: 'Herman Melville', subjects: ['Adventure', 'Sea stories'] },
  { id: 98, title: 'A Tale of Two Cities', author: 'Charles Dickens', subjects: ['Historical fiction', 'France -- Fiction'] },
  { id: 11, title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', subjects: ['Fantasy', 'Juvenile literature'] },
  { id: 1661, title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', subjects: ['Mystery', 'Detective'] },
  { id: 345, title: 'Dracula', author: 'Bram Stoker', subjects: ['Horror', 'Vampires'] },
  { id: 174, title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', subjects: ['Fiction'] },
  { id: 76, title: 'Adventures of Huckleberry Finn', author: 'Mark Twain', subjects: ['Adventure', 'Bildungsroman'] },
  { id: 5200, title: 'Metamorphosis', author: 'Franz Kafka', subjects: ['Fiction'] },
  { id: 2554, title: 'Crime and Punishment', author: 'Fyodor Dostoyevsky', subjects: ['Psychological fiction', 'Crime'] },
  { id: 120, title: 'Treasure Island', author: 'Robert Louis Stevenson', subjects: ['Adventure', 'Pirates'] },
  { id: 158, title: 'Emma', author: 'Jane Austen', subjects: ['Romance', 'England -- Fiction'] },
  { id: 1232, title: 'The Prince', author: 'Niccolò Machiavelli', subjects: ['Political science', 'Philosophy'] },
  { id: 259, title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne', subjects: ['Historical fiction', 'Puritans'] },
  { id: 1400, title: 'Great Expectations', author: 'Charles Dickens', subjects: ['Bildungsroman', 'England -- Fiction'] },
  { id: 46, title: 'A Christmas Carol', author: 'Charles Dickens', subjects: ['Ghost stories', 'Christmas'] },
  { id: 140, title: 'Jane Eyre', author: 'Charlotte Brontë', subjects: ['Romance', 'Gothic fiction'] },
  { id: 768, title: 'Wuthering Heights', author: 'Emily Brontë', subjects: ['Romance', 'Gothic fiction'] },
  { id: 36, title: 'The War of the Worlds', author: 'H. G. Wells', subjects: ['Science fiction', 'Mars'] },
  { id: 35, title: 'The Time Machine', author: 'H. G. Wells', subjects: ['Science fiction'] },
  { id: 43, title: 'The Strange Case of Dr. Jekyll and Mr. Hyde', author: 'Robert Louis Stevenson', subjects: ['Horror', 'Science fiction'] },
  { id: 244, title: 'A Study in Scarlet', author: 'Arthur Conan Doyle', subjects: ['Mystery', 'Detective'] },
  { id: 2852, title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', subjects: ['Mystery', 'Detective'] },
  { id: 16, title: 'Peter Pan', author: 'J. M. Barrie', subjects: ['Fantasy', 'Children'] },
  { id: 55, title: 'The Wonderful Wizard of Oz', author: 'L. Frank Baum', subjects: ['Fantasy', 'Children'] },
  { id: 74, title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', subjects: ['Adventure', 'Bildungsroman'] },
  { id: 829, title: 'Gulliver\'s Travels', author: 'Jonathan Swift', subjects: ['Satire', 'Adventure'] },
  { id: 6130, title: 'The Iliad', author: 'Homer', subjects: ['Epic poetry', 'Classical literature'] },
  { id: 1727, title: 'The Odyssey', author: 'Homer', subjects: ['Epic poetry', 'Adventure'] },
  { id: 205, title: 'Walden', author: 'Henry David Thoreau', subjects: ['Philosophy', 'Nature'] },
  { id: 2814, title: 'Dubliners', author: 'James Joyce', subjects: ['Short stories', 'Ireland -- Fiction'] },
  { id: 1952, title: 'The Yellow Wallpaper', author: 'Charlotte Perkins Gilman', subjects: ['Psychological fiction', 'Horror'] },
  { id: 2500, title: 'Siddhartha', author: 'Hermann Hesse', subjects: ['Philosophy', 'Buddhism'] },
  { id: 2600, title: 'War and Peace', author: 'Leo Tolstoy', subjects: ['Historical fiction', 'War stories'] },
  { id: 996, title: 'Don Quixote', author: 'Miguel de Cervantes', subjects: ['Adventure', 'Satire'] },
  { id: 1184, title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', subjects: ['Adventure', 'Revenge'] },
  { id: 161, title: 'Sense and Sensibility', author: 'Jane Austen', subjects: ['Romance', 'England -- Fiction'] },
  { id: 121, title: 'Northanger Abbey', author: 'Jane Austen', subjects: ['Romance', 'Gothic fiction'] },
  { id: 105, title: 'Persuasion', author: 'Jane Austen', subjects: ['Romance', 'England -- Fiction'] },
  { id: 514, title: 'Little Women', author: 'Louisa May Alcott', subjects: ['Romance', 'Young adult'] },
  { id: 1257, title: 'The Secret Garden', author: 'Frances Hodgson Burnett', subjects: ['Children', 'Fiction'] },
  { id: 103, title: 'Around the World in Eighty Days', author: 'Jules Verne', subjects: ['Adventure', 'Science fiction'] },
  { id: 164, title: 'Twenty Thousand Leagues under the Sea', author: 'Jules Verne', subjects: ['Adventure', 'Science fiction'] },
  { id: 135, title: 'Les Misérables', author: 'Victor Hugo', subjects: ['Historical fiction', 'France -- Fiction'] },
  { id: 2527, title: 'The Three Musketeers', author: 'Alexandre Dumas', subjects: ['Adventure', 'Historical fiction'] },
  { id: 219, title: 'Heart of Darkness', author: 'Joseph Conrad', subjects: ['Fiction', 'Psychological fiction'] },
  { id: 1497, title: 'Paradise Lost', author: 'John Milton', subjects: ['Poetry', 'Epic'] },
  { id: 6530, title: 'The Art of War', author: 'Sun Tzu', subjects: ['Philosophy', 'War'] },
  { id: 3011, title: 'The Republic', author: 'Plato', subjects: ['Philosophy', 'Political science'] },
  { id: 14591, title: 'Middlemarch', author: 'George Eliot', subjects: ['Fiction', 'England -- Fiction'] },
  { id: 236, title: 'The Jungle Book', author: 'Rudyard Kipling', subjects: ['Adventure', 'Children'] },
  { id: 8492, title: 'The King in Yellow', author: 'Robert W. Chambers', subjects: ['Horror', 'Short stories'] },
] as const

export interface IngestResult {
  imported: number
  skipped: number
  errors: string[]
  titles: { id: number; title: string; author: string; words: number }[]
}

function primaryAuthor(book: GutendexBook): string {
  return book.authors[0]?.name?.trim() || 'Unknown author'
}

function cleanTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim()
}

function mapSubjects(subjects: string[]): { category: string; subcategory: string } {
  const s = subjects.join(' ').toLowerCase()

  if (s.includes('science fiction') || s.includes('sci-fi')) {
    return { category: 'fiction', subcategory: 'sci_fi' }
  }
  if (s.includes('horror') || s.includes('ghost')) {
    return { category: 'fiction', subcategory: 'horror' }
  }
  if (s.includes('mystery') || s.includes('detective') || s.includes('crime')) {
    return { category: 'fiction', subcategory: 'mystery' }
  }
  if (s.includes('romance') || s.includes('love stories')) {
    return { category: 'fiction', subcategory: 'romance' }
  }
  if (s.includes('fantasy') || s.includes('fairy')) {
    return { category: 'fiction', subcategory: 'fantasy' }
  }
  if (s.includes('adventure')) {
    return { category: 'fiction', subcategory: 'thriller' }
  }
  if (s.includes('historical')) {
    return { category: 'fiction', subcategory: 'historical_fiction' }
  }
  if (s.includes('biograph')) {
    return { category: 'non_fiction', subcategory: 'biography' }
  }
  if (s.includes('history')) {
    return { category: 'non_fiction', subcategory: 'history' }
  }
  if (s.includes('philosophy')) {
    return { category: 'non_fiction', subcategory: 'philosophy' }
  }
  if (s.includes('psycholog')) {
    return { category: 'non_fiction', subcategory: 'psychology' }
  }
  if (s.includes('science') && !s.includes('fiction')) {
    return { category: 'non_fiction', subcategory: 'science' }
  }
  if (s.includes('juvenile') || s.includes('children')) {
    return { category: 'children', subcategory: 'children_fiction' }
  }

  return { category: 'fiction', subcategory: 'literary' }
}

function descriptionFromText(text: string): string {
  const stripped = text
    .replace(/\*\*\* START OF (THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i, '')
    .replace(/\*\*\* END OF (THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*/i, '')
    .trim()

  const chunk = stripped.slice(0, 1200)
  const end = chunk.lastIndexOf('. ')
  const slice = end > 200 ? chunk.slice(0, end + 1) : chunk.slice(0, 500)
  return slice.trim() || 'A complete public-domain book from the ReadAI club library.'
}

function estimatePages(words: number): number {
  return Math.max(1, Math.round(words / 250))
}

function estimateRating(downloadCount: number): number {
  const base = 3.8 + Math.min(1.1, Math.log10(Math.max(downloadCount, 10)) / 3)
  return Math.round(base * 10) / 10
}

async function alreadyImported(gutenbergId: number, title: string, author: string): Promise<boolean> {
  try {
    const byGutenberg = await sql`
      SELECT id FROM books WHERE gutenberg_id = ${gutenbergId} LIMIT 1
    `
    if (byGutenberg.length > 0) return true
  } catch {
    // gutenberg_id column may be missing until migration runs
  }

  const byTitle = await sql`
    SELECT id FROM books
    WHERE lower(trim(title)) = lower(trim(${title}))
      AND lower(trim(author)) = lower(trim(${author}))
      AND gutenberg_id IS NOT NULL
    LIMIT 1
  `
  return byTitle.length > 0
}

async function insertFullBook(
  book: GutendexBook,
  bodyText: string,
): Promise<{ id: number; title: string; author: string; words: number }> {
  const title = cleanTitle(book.title)
  const author = primaryAuthor(book)
  const { category, subcategory } = mapSubjects(book.subjects ?? [])
  const words = wordCount(bodyText)
  const pages = estimatePages(words)
  const description = descriptionFromText(bodyText)
  const tags = (book.subjects ?? []).slice(0, 6).map((t) => t.slice(0, 80))
  const addedDate = new Date().toISOString().split('T')[0]
  const rating = estimateRating(book.download_count ?? 0)
  const coverUrl = await resolveBestCoverUrl(book.id, {
    title: book.title,
    author: book.authors[0]?.name ?? '',
  })

  try {
    const rows = await sql`
      INSERT INTO books (
        title, author, year, rating, description, tags, pages, difficulty,
        recommended_for, category, subcategory, added_date, gutenberg_id, cover_url
      )
      VALUES (
        ${title},
        ${author},
        null,
        ${rating},
        ${description},
        ${tags},
        ${pages},
        ${'intermediate'},
        ${'adults'},
        ${category},
        ${subcategory},
        ${addedDate},
        ${book.id},
        ${coverUrl}
      )
      RETURNING id
    `
    return { id: rows[0].id as number, title, author, words }
  } catch {
    const rows = await sql`
      INSERT INTO books (
        title, author, year, rating, description, tags, pages, difficulty,
        recommended_for, category, subcategory, added_date
      )
      VALUES (
        ${title},
        ${author},
        null,
        ${rating},
        ${description},
        ${tags},
        ${pages},
        ${'intermediate'},
        ${'adults'},
        ${category},
        ${subcategory},
        ${addedDate}
      )
      RETURNING id
    `
    return { id: rows[0].id as number, title, author, words }
  }
}

export async function importGutenbergBooks(
  targetCount: number,
  startPage = 1,
): Promise<IngestResult> {
  const result: IngestResult = {
    imported: 0,
    skipped: 0,
    errors: [],
    titles: [],
  }

  let page = startPage
  const maxPages = startPage + 40

  while (result.imported < targetCount && page <= maxPages) {
    const catalog = await fetchGutendexPage(page)

    for (const candidate of catalog.results) {
      if (result.imported >= targetCount) break

      const title = cleanTitle(candidate.title)
      const author = primaryAuthor(candidate)

      try {
        if (!candidate.languages?.includes('en')) {
          result.skipped++
          continue
        }

        if (await alreadyImported(candidate.id, title, author)) {
          result.skipped++
          continue
        }

        const bodyText = await downloadPlainText(candidate.formats)
        if (!isFullBookText(bodyText)) {
          result.skipped++
          continue
        }

        const inserted = await insertFullBook(candidate, bodyText!)
        result.imported++
        result.titles.push(inserted)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        result.errors.push(`${title}: ${message}`)
      }
    }

    if (!catalog.next) break
    page++
  }

  return result
}

function curatedToGutendexBook(entry: (typeof CURATED_GUTENBERG)[number]): GutendexBook {
  return {
    id: entry.id,
    title: entry.title,
    authors: [{ name: entry.author }],
    subjects: [...entry.subjects],
    languages: ['en'],
    download_count: 10_000,
    formats: {},
  }
}

/** Import known Gutenberg IDs via gutenberg.org cache (no Gutendex). */
export async function importCuratedGutenbergBooks(targetCount: number): Promise<IngestResult> {
  const result: IngestResult = {
    imported: 0,
    skipped: 0,
    errors: [],
    titles: [],
  }

  for (const entry of CURATED_GUTENBERG) {
    if (result.imported >= targetCount) break

    const title = cleanTitle(entry.title)
    const author = entry.author.trim()

    try {
      if (await alreadyImported(entry.id, title, author)) {
        result.skipped++
        continue
      }

      const bodyText = await downloadGutenbergCacheText(entry.id)
      if (!isFullBookText(bodyText)) {
        result.skipped++
        result.errors.push(`${title}: text too short or download failed`)
        continue
      }

      const inserted = await insertFullBook(curatedToGutendexBook(entry), bodyText!)
      result.imported++
      result.titles.push(inserted)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      result.errors.push(`${title}: ${message}`)
    }
  }

  return result
}
