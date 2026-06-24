import { openLibraryCoverIdUrl } from '@/lib/book-covers'
import { resolveBookSourceHref } from '@/lib/book-sources'
import type { BookstoreAisle } from '@/lib/bookstore-sections'
import { getAisleById } from '@/lib/bookstore-sections'
import { canOpenInReadAI, US_PUBLIC_DOMAIN_CUTOFF_YEAR } from '@/lib/public-domain-cutoff'

/** Open Library subject slug for each reading room. */
const GENRE_OPEN_LIBRARY_SUBJECTS: Record<string, string> = {
  horror: 'horror',
  mystery: 'mystery',
  thriller: 'thrillers',
  romance: 'romance',
  'sci-fi': 'science_fiction',
  fantasy: 'fantasy',
  literary: 'fiction',
  'historical-fiction': 'historical_fiction',
  biography: 'biography',
  history: 'history',
  business: 'business',
  science: 'science',
  'self-help': 'self-help',
  psychology: 'psychology',
  health: 'health',
  travel: 'travel',
  cooking: 'cookery',
  technology: 'technology',
  'young-adult': 'young_adult_fiction',
  'picture-books': 'picture_books',
  'middle-grade': 'juvenile_fiction',
  programming: 'computers',
  textbooks: 'textbooks',
  language: 'language_study',
  'movie-books': 'motion_pictures',
}

export type GenreSourceShelfBook = {
  key: string
  title: string
  author: string | null
  coverUrl: string | null
  readHref: string
  readLabel: string
  openLibraryHref: string
  openLibraryLabel: string
}

type OpenLibrarySearchDoc = {
  key?: string
  title?: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
}

const OPEN_LIBRARY_HEADERS = { 'User-Agent': 'ReadAI-Book-Club/1.0' }
const OPEN_LIBRARY_SEARCH_TIMEOUT_MS = 15_000
const SHELF_SCAN_BATCH_SIZE = 100
const SHELF_SCAN_MAX_OFFSET = 8_000

export function getGenreOpenLibrarySubject(aisleId: string): string | null {
  return GENRE_OPEN_LIBRARY_SUBJECTS[aisleId] ?? null
}

export function genreSourceBrowseLinks(aisle: BookstoreAisle): { label: string; href: string }[] {
  const subject = getGenreOpenLibrarySubject(aisle.id)
  const query = encodeURIComponent(aisle.title)
  const links: { label: string; href: string }[] = []

  if (subject) {
    links.push({
      label: 'Open Library subject',
      href: `https://openlibrary.org/subjects/${subject}`,
    })
  }

  links.push({
    label: 'Project Gutenberg search',
    href: `https://www.gutenberg.org/ebooks/search/?query=${query}`,
  })
  links.push({
    label: 'Internet Archive texts',
    href: `https://archive.org/search?query=${query}&and[]=mediatype%3A%22texts%22`,
  })

  return links
}

function sourceLinksForWork(
  title: string,
  author: string | null,
): Pick<GenreSourceShelfBook, 'readHref' | 'readLabel' | 'openLibraryHref' | 'openLibraryLabel'> {
  const book = { title, author: author ?? '' }
  return {
    readHref: resolveBookSourceHref('gutenberg', book),
    readLabel: 'Search Gutenberg',
    openLibraryHref: resolveBookSourceHref('open-library', book),
    openLibraryLabel: 'Search Open Library',
  }
}

function mapSearchDoc(doc: OpenLibrarySearchDoc): GenreSourceShelfBook | null {
  if (!doc.key || !doc.title?.trim()) return null

  const title = doc.title.trim()
  const author = doc.author_name?.[0]?.trim() || null
  const firstPublishYear =
    typeof doc.first_publish_year === 'number' ? doc.first_publish_year : null

  if (!canOpenInReadAI(firstPublishYear)) return null

  return {
    key: doc.key,
    title,
    author,
    coverUrl: doc.cover_i ? openLibraryCoverIdUrl(doc.cover_i) : null,
    ...sourceLinksForWork(title, author),
  }
}

async function fetchSearchBatch(
  subject: string,
  limit: number,
  offset: number,
): Promise<OpenLibrarySearchDoc[]> {
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=subject:${encodeURIComponent(subject)}&limit=${limit}&offset=${offset}&fields=key,title,author_name,cover_i,first_publish_year`,
      {
        cache: 'no-store',
        headers: OPEN_LIBRARY_HEADERS,
        signal: AbortSignal.timeout(OPEN_LIBRARY_SEARCH_TIMEOUT_MS),
      },
    )
    if (!res.ok) return []

    const data = (await res.json()) as { docs?: OpenLibrarySearchDoc[] }
    return data.docs ?? []
  } catch {
    return []
  }
}

async function collectReadableShelfBooks(
  subject: string,
  skip: number,
  limit: number,
): Promise<GenreSourceShelfBook[]> {
  const books: GenreSourceShelfBook[] = []
  let skipped = 0
  let olOffset = 0

  while (books.length < limit && olOffset < SHELF_SCAN_MAX_OFFSET) {
    const docs = await fetchSearchBatch(subject, SHELF_SCAN_BATCH_SIZE, olOffset)
    if (docs.length === 0) break

    for (const doc of docs) {
      const book = mapSearchDoc(doc)
      if (!book) continue

      if (skipped < skip) {
        skipped += 1
        continue
      }

      books.push(book)
      if (books.length >= limit) break
    }

    olOffset += SHELF_SCAN_BATCH_SIZE
  }

  return books
}

export async function fetchGenreSourceShelf(
  aisleId: string,
  limit: number,
  offset: number,
): Promise<{ total: number; books: GenreSourceShelfBook[] }> {
  const subject = getGenreOpenLibrarySubject(aisleId)
  if (!subject) {
    return { total: 0, books: [] }
  }

  const books = await collectReadableShelfBooks(subject, offset, limit)
  const total = await fetchGenreSourceCount(aisleId)

  return { total, books }
}

export async function fetchGenreSourceCount(aisleId: string): Promise<number> {
  const subject = getGenreOpenLibrarySubject(aisleId)
  if (!subject) return 0

  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=subject:${encodeURIComponent(subject)} AND first_publish_year:[* TO ${US_PUBLIC_DOMAIN_CUTOFF_YEAR - 1}]&limit=0`,
      {
        next: { revalidate: 3600 },
        headers: OPEN_LIBRARY_HEADERS,
        signal: AbortSignal.timeout(OPEN_LIBRARY_SEARCH_TIMEOUT_MS),
      },
    )
    if (res.ok) {
      const data = (await res.json()) as { num_found?: number; numFound?: number }
      const count = data.num_found ?? data.numFound
      if (typeof count === 'number') return count
    }
  } catch {
    // no count available
  }

  return 0
}

export async function fetchGenreSourceCountsForAisles(
  aisleIds: string[],
): Promise<Map<string, number>> {
  const entries = await Promise.all(
    aisleIds.map(async (id) => {
      const count = await fetchGenreSourceCount(id)
      return [id, count] as const
    }),
  )

  return new Map(entries)
}

export function genreAisleHasSourceShelf(aisleId: string): boolean {
  return getAisleById(aisleId) != null && getGenreOpenLibrarySubject(aisleId) != null
}
