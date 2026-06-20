import { buildReadableSourceLinks, resolveBookSourceHref, type BookSourceLink } from '@/lib/book-sources'
import { normalisePhrase, parseTitleAuthorQuery, tokeniseSearch } from '@/lib/book-search'
import { buildClubSearchGuide, type ClubSearchGuide } from '@/lib/club-search-guide'
import { parseClubSearchIntent, resolveSearchSubject } from '@/lib/club-search-intent'
import { sql } from '@/lib/db'
import {
  pickPlainTextUrl,
  type GutendexBook,
} from '@/lib/gutenberg'
import { FEATURED_FILMS, matchKnownFilm } from '@/lib/movie-sources'

export type SourceSearchMatch = {
  title: string
  author: string | null
  coverUrl: string | null
  gutenbergId: number
  /** In-app read or direct Gutenberg edition URL. */
  readHref: string
  sourceLabel: string
}

export type SourceSearchFilmMatch = {
  title: string
  bookTitle: string
  readHref: string | null
}

export type SourceSearchResult = {
  query: string
  match: SourceSearchMatch | null
  sources: BookSourceLink[]
  film: SourceSearchFilmMatch | null
  /** Why no match was returned — shown on the homepage. */
  unavailableReason: 'copyright' | 'not_found' | null
  unavailableNote: string | null
  /** When listed in catalogs but not readable here — includes data readers can verify. */
  catalogHint: {
    title: string
    author: string | null
    firstPublishYear: number | null
    verifyHref: string
  } | null
  /** Book-club prompts tailored to the search intent (discussion, themes, etc.). */
  clubGuide: ClubSearchGuide | null
}

function titleMatchesQuery(query: string, titlePart: string, bookTitle: string): boolean {
  const book = normalisePhrase(bookTitle)
  if (!book) return false

  const candidates = [query, titlePart].map((part) => normalisePhrase(part)).filter(Boolean)
  for (const candidate of candidates) {
    if (book === candidate || book.startsWith(candidate) || candidate.startsWith(book)) return true
    if (candidate.length >= 4 && (book.includes(candidate) || candidate.includes(book))) return true
  }

  const tokens = tokeniseSearch(titlePart || query)
  if (tokens.length === 0) return false
  return tokens.every((token) => book.includes(token))
}

function scoreGutenbergBook(
  query: string,
  titlePart: string,
  authorPart: string,
  book: GutendexBook,
): number {
  if (!titleMatchesQuery(query, titlePart, book.title ?? '')) return -1

  const q = normalisePhrase(query)
  const titleQ = normalisePhrase(titlePart)
  const title = normalisePhrase(book.title ?? '')

  let score = 0
  if (title === q || title === titleQ) score += 100
  else if (title.startsWith(titleQ) || titleQ.startsWith(title)) score += 85
  else if (title.includes(titleQ) || titleQ.includes(title)) score += 70
  else score += 55

  const authorName = book.authors?.[0]?.name?.trim()
  if (authorPart.trim() && authorName) {
    const authorQ = normalisePhrase(authorPart)
    const author = normalisePhrase(authorName)
    if (author.includes(authorQ) || authorQ.includes(author)) score += 30
    else if (authorPart !== query.trim()) score -= 10
  }

  return score
}

function isReadableGutenbergBook(book: GutendexBook): boolean {
  if (!book.languages?.includes('en')) return false
  return pickPlainTextUrl(book.formats) != null
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms)
    }),
  ])
}

async function fetchGutendexSearchQuick(term: string): Promise<{ results: GutendexBook[] }> {
  const params = new URLSearchParams({ search: term.trim(), languages: 'en' })
  try {
    const res = await fetch(`https://gutendex.com/books/?${params.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { results: [] }
    const data = (await res.json()) as { results?: GutendexBook[] }
    return { results: data.results ?? [] }
  } catch {
    return { results: [] }
  }
}

function gutenbergCoverUrl(gutenbergId: number): string {
  return `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`
}

async function resolveGutenbergReadableMatch(
  query: string,
  titlePart: string,
  authorPart: string,
): Promise<SourceSearchMatch | null> {
  const terms = [
    ...new Set(
      [query, titlePart, `${titlePart} ${authorPart}`.trim()].filter((term) => term.trim().length > 0),
    ),
  ]

  const catalogs = await Promise.all(terms.map((term) => fetchGutendexSearchQuick(term)))

  let best: { book: GutendexBook; score: number } | null = null

  for (const catalog of catalogs) {
    for (const book of catalog.results ?? []) {
      if (!isReadableGutenbergBook(book)) continue
      const score = scoreGutenbergBook(query, titlePart, authorPart, book)
      if (score < 55) continue
      if (!best || score > best.score) best = { book, score }
    }
  }

  if (!best) return null

  const title = best.book.title.trim()
  const author = best.book.authors?.[0]?.name?.trim() ?? null
  const gutenbergId = best.book.id
  const coverUrl = gutenbergCoverUrl(gutenbergId)

  return {
    title,
    author,
    coverUrl,
    gutenbergId,
    readHref: `https://www.gutenberg.org/ebooks/${gutenbergId}`,
    sourceLabel: 'Project Gutenberg · full read',
  }
}

async function resolveDbReadableMatch(
  query: string,
  titlePart: string,
): Promise<SourceSearchMatch | null> {
  try {
    const rows = await sql`
    SELECT id, title, author, cover_url, gutenberg_id
    FROM books
    WHERE gutenberg_id IS NOT NULL
      AND (
        LOWER(TRIM(title)) = LOWER(TRIM(${titlePart}))
        OR LOWER(title) LIKE LOWER(TRIM(${titlePart})) || '%'
        OR LOWER(TRIM(title)) = LOWER(TRIM(${query}))
      )
    ORDER BY id DESC
    LIMIT 8
  `

  for (const row of rows) {
    const title = String(row.title ?? '').trim()
    if (!title || !titleMatchesQuery(query, titlePart, title)) continue

    const gutenbergId = row.gutenberg_id
    if (typeof gutenbergId !== 'number') continue

    const coverUrl =
      (typeof row.cover_url === 'string' && row.cover_url.trim()) || gutenbergCoverUrl(gutenbergId)

    return {
      title,
      author: typeof row.author === 'string' ? row.author.trim() : null,
      coverUrl,
      gutenbergId,
      readHref: `/books/${row.id}/read`,
      sourceLabel: 'ReadAI · full read',
    }
  }

  return null
  } catch {
    return null
  }
}

type CatalogHint = {
  title: string
  author: string | null
  firstPublishYear: number | null
  verifyHref: string
}

/** U.S. works published before this year are generally public domain (verify locally for your use). */
const US_PUBLIC_DOMAIN_CUTOFF_YEAR = 1929

function copyrightNoticeForHint(hint: CatalogHint): string {
  const year = hint.firstPublishYear
  if (year != null && year >= US_PUBLIC_DOMAIN_CUTOFF_YEAR) {
    return `First published ${year}. Works this recent are usually still under copyright. ReadAI only lists public-domain books you can read in full.`
  }
  if (year != null && year < US_PUBLIC_DOMAIN_CUTOFF_YEAR) {
    return `First published ${year}. This older title may be public domain, but ReadAI has no full free read for it on Project Gutenberg yet.`
  }
  return `This title appears in library catalogs. Recent works are usually still under copyright. ReadAI only lists public-domain books you can read in full.`
}

function unavailableReasonForHint(hint: CatalogHint): 'copyright' | 'not_found' {
  const year = hint.firstPublishYear
  if (year != null && year < US_PUBLIC_DOMAIN_CUTOFF_YEAR) return 'not_found'
  return 'copyright'
}

async function lookupCatalogHint(query: string, titlePart: string): Promise<CatalogHint | null> {
  const searchTerm = titlePart.trim() || query.trim()
  if (!searchTerm) return null

  const result = await withTimeout(
    (async () => {
      const params = new URLSearchParams({
        limit: '3',
        fields: 'title,author_name,first_publish_year',
        q: searchTerm,
      })
      const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(6_000),
        headers: { 'User-Agent': 'ReadAI-Book-Club/1.0' },
      })
      if (!res.ok) return null

      const data = (await res.json()) as {
        docs?: { title?: string; author_name?: string[]; first_publish_year?: number }[]
      }

      for (const doc of data.docs ?? []) {
        const title = doc.title?.trim()
        if (!title || !titleMatchesQuery(query, titlePart, title)) continue
        const author = doc.author_name?.[0]?.trim() ?? null
        const firstPublishYear =
          typeof doc.first_publish_year === 'number' ? doc.first_publish_year : null
        return {
          title,
          author,
          firstPublishYear,
          verifyHref: resolveBookSourceHref('open-library', { title, author: author ?? '' }),
        }
      }

      return null
    })(),
    7_000,
  )

  return result ?? null
}

/** Homepage search — readable books plus book-club guide for natural-language queries. */
export async function runSourceSearch(raw: string): Promise<SourceSearchResult> {
  const query = raw.trim()
  const parsed = parseClubSearchIntent(query)
  const searchTerm = resolveSearchSubject(parsed.subject.trim() || query)
  const { titlePart, authorPart } = parseTitleAuthorQuery(searchTerm)

  const knownFilm = matchKnownFilm(searchTerm) ?? matchKnownFilm(titlePart)
  const featuredFilm = knownFilm
    ? FEATURED_FILMS.find((entry) => entry.title === knownFilm.title)
    : undefined

  const gutenbergMatch = await resolveGutenbergReadableMatch(searchTerm, titlePart, authorPart)
  const match =
    gutenbergMatch ?? (await withTimeout(resolveDbReadableMatch(searchTerm, titlePart), 4_000))

  const sourceBook = match
    ? {
        title: match.title,
        author: match.author ?? '',
        gutenbergId: match.gutenbergId,
      }
    : null

  let film: SourceSearchFilmMatch | null = null
  if (knownFilm) {
    const filmBookTitle =
      featuredFilm?.bookDisplayTitle?.trim() ||
      featuredFilm?.clubBookTitle?.trim() ||
      `${knownFilm.title} (movie book)`
    const filmMatch = await resolveGutenbergReadableMatch(
      filmBookTitle,
      filmBookTitle,
      '',
    )
    film = {
      title: knownFilm.title,
      bookTitle: filmMatch?.title ?? filmBookTitle,
      readHref: filmMatch?.readHref ?? null,
    }
  }

  let unavailableReason: 'copyright' | 'not_found' | null = null
  let unavailableNote: string | null = null
  let catalogHint: CatalogHint | null = null

  if (!match) {
    catalogHint = await lookupCatalogHint(searchTerm, titlePart)
    if (catalogHint) {
      unavailableReason = unavailableReasonForHint(catalogHint)
      unavailableNote = copyrightNoticeForHint(catalogHint)
    } else {
      unavailableReason = 'not_found'
      unavailableNote =
        parsed.intent === 'book_lookup'
          ? 'No public-domain full read found on Project Gutenberg. Try a classic title or author name.'
          : `No full read found for “${searchTerm}”. Try the exact title (e.g. Pride and Prejudice) or a public-domain classic.`
    }
  }

  const guideTitle =
    parsed.intent !== 'book_lookup'
      ? searchTerm
      : match?.title ?? catalogHint?.title ?? searchTerm
  const guideAuthor =
    parsed.intent !== 'book_lookup'
      ? match?.author ?? catalogHint?.author ?? null
      : match?.author ?? catalogHint?.author ?? null

  const guideBook = guideTitle
    ? { title: guideTitle, author: guideAuthor, subjects: [] as string[] }
    : null

  const clubGuide =
    parsed.intent === 'book_lookup' && !match && !catalogHint && !searchTerm
      ? null
      : buildClubSearchGuide(parsed, guideBook)

  return {
    query,
    match,
    sources: sourceBook ? buildReadableSourceLinks(sourceBook) : [],
    film,
    unavailableReason,
    unavailableNote,
    catalogHint,
    clubGuide,
  }
}

export { sourceAccessLabel } from '@/lib/book-sources'
