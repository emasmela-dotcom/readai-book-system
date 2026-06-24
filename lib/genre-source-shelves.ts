import { openLibraryCoverIdUrl } from '@/lib/book-covers'
import { resolveBookSourceHref } from '@/lib/book-sources'
import type { BookstoreAisle } from '@/lib/bookstore-sections'
import { getAisleById } from '@/lib/bookstore-sections'

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

type OpenLibrarySubjectWork = {
  key?: string
  title?: string
  authors?: { name?: string }[]
  cover_id?: number
}

type OpenLibrarySubjectResponse = {
  work_count?: number
  works?: OpenLibrarySubjectWork[]
}

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

function authorName(work: OpenLibrarySubjectWork): string | null {
  const name = work.authors?.[0]?.name?.trim()
  return name || null
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

const OPEN_LIBRARY_HEADERS = { 'User-Agent': 'ReadAI-Book-Club/1.0' }
const OPEN_LIBRARY_SEARCH_TIMEOUT_MS = 15_000
const OPEN_LIBRARY_SUBJECT_TIMEOUT_MS = 8_000

async function fetchGenreShelfFromSearch(
  subject: string,
  limit: number,
  offset: number,
): Promise<{ total: number; books: GenreSourceShelfBook[] } | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=subject:${encodeURIComponent(subject)}&limit=${limit}&offset=${offset}&fields=key,title,author_name,cover_i`,
      {
        cache: 'no-store',
        headers: OPEN_LIBRARY_HEADERS,
        signal: AbortSignal.timeout(OPEN_LIBRARY_SEARCH_TIMEOUT_MS),
      },
    )
    if (!res.ok) return null

    const data = (await res.json()) as {
      num_found?: number
      numFound?: number
      docs?: { key?: string; title?: string; author_name?: string[]; cover_i?: number }[]
    }

    const books = (data.docs ?? [])
      .filter((doc) => doc.key && doc.title?.trim())
      .map((doc) => {
        const title = doc.title!.trim()
        const author = doc.author_name?.[0]?.trim() || null
        const links = sourceLinksForWork(title, author)
        return {
          key: doc.key!,
          title,
          author,
          coverUrl: doc.cover_i ? openLibraryCoverIdUrl(doc.cover_i) : null,
          ...links,
        }
      })

    if (books.length === 0) return null

    return {
      total: data.num_found ?? data.numFound ?? books.length,
      books,
    }
  } catch {
    return null
  }
}

async function fetchGenreShelfFromSubject(
  subject: string,
  limit: number,
  offset: number,
): Promise<{ total: number; books: GenreSourceShelfBook[] } | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/subjects/${subject}.json?limit=${limit}&offset=${offset}`,
      {
        cache: 'no-store',
        headers: OPEN_LIBRARY_HEADERS,
        signal: AbortSignal.timeout(OPEN_LIBRARY_SUBJECT_TIMEOUT_MS),
      },
    )

    if (!res.ok) return null

    const data = (await res.json()) as OpenLibrarySubjectResponse
    const mapped = mapSubjectResponse(data)
    if (mapped.books.length === 0) return null
    return mapped
  } catch {
    return null
  }
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

  const fromSearch = await fetchGenreShelfFromSearch(subject, limit, offset)
  if (fromSearch) return fromSearch

  const fromSubject = await fetchGenreShelfFromSubject(subject, limit, offset)
  if (fromSubject) return fromSubject

  return { total: 0, books: [] }
}

function mapSubjectResponse(data: OpenLibrarySubjectResponse): {
  total: number
  books: GenreSourceShelfBook[]
} {
  const total = data.work_count ?? 0
  const books = (data.works ?? [])
    .filter((work) => work.key && work.title?.trim())
    .map((work) => {
      const title = work.title!.trim()
      const author = authorName(work)
      const links = sourceLinksForWork(title, author)
      return {
        key: work.key!,
        title,
        author,
        coverUrl: work.cover_id ? openLibraryCoverIdUrl(work.cover_id) : null,
        ...links,
      }
    })

  return { total, books }
}

export async function fetchGenreSourceCount(aisleId: string): Promise<number> {
  const subject = getGenreOpenLibrarySubject(aisleId)
  if (!subject) return 0

  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=subject:${encodeURIComponent(subject)}&limit=1&fields=key`,
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
    // fall through to subject count
  }

  try {
    const res = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=1`, {
      next: { revalidate: 3600 },
      headers: OPEN_LIBRARY_HEADERS,
      signal: AbortSignal.timeout(OPEN_LIBRARY_SUBJECT_TIMEOUT_MS),
    })
    if (res.ok) {
      const data = (await res.json()) as OpenLibrarySubjectResponse
      if (typeof data.work_count === 'number') return data.work_count
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
