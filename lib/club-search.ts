import { buildReadableSourceLinks, resolveBookSourceHref, type BookSourceLink } from '@/lib/book-sources'
import { clubOpenHref } from '@/lib/club-open-href'
import { normalisePhrase, parseTitleAuthorQuery, primaryTitleForMatch, significantTitleTokens, titleSearchVariants } from '@/lib/book-search'
import { buildClubSearchGuide, buildClubPicksGuide, buildFallbackPickGuide, type ClubSearchGuide } from '@/lib/club-search-guide'
import { getDailyClubReadableMatches } from '@/lib/daily-club-picks'
import {
  parseClubSearchIntent,
  resolveSearchSubject,
  isClubSearchIntent,
  type ClubSearchIntent,
} from '@/lib/club-search-intent'
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
  bookId: number | null
}

export type SourceSearchFilmMatch = {
  title: string
  bookTitle: string
  readHref: string | null
}

export type SourceSearchResult = {
  query: string
  match: SourceSearchMatch | null
  /** Daily or club-pick shelf — full reads with covers, not text-only guides. */
  pickBooks: SourceSearchMatch[]
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

  const variants = [...new Set([...titleSearchVariants(titlePart), ...titleSearchVariants(query)])]

  for (const variant of variants) {
    const candidate = normalisePhrase(variant)
    if (!candidate) continue
    if (book === candidate) return true
    if (candidate.length >= 8 && book.startsWith(candidate)) return true
    if (book.length >= 8 && candidate.startsWith(book)) return true
  }

  for (const variant of variants) {
    const queryTokens = significantTitleTokens(variant)
    if (queryTokens.length === 0) continue

    const bookTokens = significantTitleTokens(bookTitle)
    if (bookTokens.length === 0) continue

    const bookTokenSet = new Set(bookTokens)
    let shared = 0
    for (const token of queryTokens) {
      if (bookTokenSet.has(token)) shared += 1
    }

    if (shared >= Math.min(queryTokens.length, bookTokens.length)) return true
    if (queryTokens.length >= 2 && shared / queryTokens.length >= 0.75) return true
  }

  return false
}

function normalisedTitlesAlign(a: string, b: string): boolean {
  const left = normalisePhrase(a)
  const right = normalisePhrase(b)
  if (!left || !right) return false
  return left === right || left.startsWith(right) || right.startsWith(left)
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

async function fetchGutendexSearchQuick(term: string, timeoutMs = 10_000): Promise<{ results: GutendexBook[] }> {
  const params = new URLSearchParams({ search: term.trim(), languages: 'en' })
  try {
    const res = await fetch(`https://gutendex.com/books/?${params.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
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

export async function resolveGutenbergReadableMatch(
  query: string,
  titlePart: string,
  authorPart: string,
  timeoutMs = 10_000,
): Promise<SourceSearchMatch | null> {
  const primaryTitle = primaryTitleForMatch(titlePart)
  const terms = [
    ...new Set(
      [
        query,
        titlePart,
        primaryTitle,
        `${titlePart} ${authorPart}`.trim(),
        `${primaryTitle} ${authorPart}`.trim(),
      ].filter((term) => term.trim().length > 0),
    ),
  ]

  const catalogs = await Promise.all(terms.map((term) => fetchGutendexSearchQuick(term, timeoutMs)))

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
    readHref: clubOpenHref(title, author),
    sourceLabel: 'ReadAI · full read',
    bookId: null,
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
      bookId: Number(row.id),
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
    return `First published ${year}. This title is likely public domain. Tap Open in ReadAI below — we load full-text editions when available.`
  }
  return `This title appears in library catalogs. Recent works are usually still under copyright. ReadAI only lists public-domain books you can read in full.`
}

function unavailableReasonForHint(hint: CatalogHint): 'copyright' | 'not_found' {
  const year = hint.firstPublishYear
  if (year != null && year < US_PUBLIC_DOMAIN_CUTOFF_YEAR) return 'not_found'
  return 'copyright'
}

/** Library catalog check — recent first-publish years are treated as still under copyright. */
export async function isLikelyCopyrightedTitle(
  title: string,
  author: string | null,
): Promise<boolean> {
  const titlePart = primaryTitleForMatch(title.trim())
  if (!titlePart) return false

  const query = [titlePart, author?.trim()].filter(Boolean).join(' ')
  const hint = await lookupCatalogHint(query, titlePart)
  if (!hint) return false

  return unavailableReasonForHint(hint) === 'copyright'
}

/** True when the query looks like a specific title — not vague topic or nonsense. */
function isSpecificTitleLookup(query: string, intent: ClubSearchIntent): boolean {
  if (intent !== 'book_lookup') return false

  const trimmed = query.trim()
  if (!trimmed) return false

  const lower = trimmed.toLowerCase()
  if (/^(xyz|qwerty|asdf|test123|nonsense)\b/.test(lower)) return false
  if (/^[a-z0-9]{1,16}$/.test(lower) && !/[aeiouy]/.test(lower)) return false

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length === 0) return false

  const titleCaseWords = words.filter(
    (word) => /^[A-Z][a-z]/.test(word) || /^[A-Z]{2,}$/.test(word),
  ).length

  if (words.length === 1 && trimmed.length > 3 && /^[A-Z]/.test(trimmed)) return true
  if (words.length >= 2 && words.length <= 8 && titleCaseWords >= 2) return true
  if (words.length === 2 && titleCaseWords >= 1 && words.every((word) => /^[A-Z]/.test(word))) {
    return true
  }

  return false
}

function shouldOfferFallbackPicks(
  parsed: ReturnType<typeof parseClubSearchIntent>,
  match: SourceSearchMatch | null,
  catalogHint: CatalogHint | null,
  unavailableReason: 'copyright' | 'not_found' | null,
): boolean {
  if (match) return false
  if (catalogHint) return false
  if (unavailableReason === 'copyright') return false
  if (isSpecificTitleLookup(parsed.raw, parsed.intent)) return false
  if (isClubSearchIntent(parsed.intent)) return true
  return true
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
        if (!title) continue
        const queryNorm = normalisePhrase(titlePart || searchTerm)
        const titleNorm = normalisePhrase(title)
        if (titleNorm !== queryNorm && !titleMatchesQuery(query, titlePart, title)) continue
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

  if (parsed.intent === 'club_picks') {
    const pickBooks = await getDailyClubReadableMatches()
    return {
      query,
      match: null,
      pickBooks,
      sources: [],
      film: null,
      unavailableReason: null,
      unavailableNote: null,
      catalogHint: null,
      clubGuide: buildClubPicksGuide(),
    }
  }

  const clubIntent = isClubSearchIntent(parsed.intent)
  const searchTerm = resolveSearchSubject(parsed.subject.trim() || query)
  const { titlePart, authorPart } = parseTitleAuthorQuery(searchTerm)
  const lookupTimeoutMs = clubIntent ? 4_000 : 10_000
  const specificTitle = isSpecificTitleLookup(parsed.raw, parsed.intent)

  let match: SourceSearchMatch | null = null
  let film: SourceSearchFilmMatch | null = null
  let catalogHint: CatalogHint | null = null

  try {
    const knownFilm = !clubIntent ? matchKnownFilm(searchTerm) ?? matchKnownFilm(titlePart) : null
    const featuredFilm = knownFilm
      ? FEATURED_FILMS.find((entry) => entry.title === knownFilm.title)
      : undefined

    if (clubIntent) {
      match = await withTimeout(resolveDbReadableMatch(searchTerm, titlePart), 2_500)
      if (!match) {
        match = await withTimeout(
          resolveGutenbergReadableMatch(searchTerm, titlePart, authorPart, 3_500),
          3_500,
        )
      }
    } else {
      const gutenbergMatch = await resolveGutenbergReadableMatch(
        searchTerm,
        titlePart,
        authorPart,
        lookupTimeoutMs,
      )
      match =
        gutenbergMatch ??
        (await withTimeout(resolveDbReadableMatch(searchTerm, titlePart), lookupTimeoutMs))
    }

    if (knownFilm) {
      const filmBookTitle =
        featuredFilm?.bookDisplayTitle?.trim() ||
        featuredFilm?.clubBookTitle?.trim() ||
        `${knownFilm.title} (movie book)`
      const filmMatch = await withTimeout(
        resolveGutenbergReadableMatch(filmBookTitle, filmBookTitle, '', lookupTimeoutMs),
        lookupTimeoutMs,
      )
      film = {
        title: knownFilm.title,
        bookTitle: filmMatch?.title ?? filmBookTitle,
        readHref: filmMatch?.readHref ?? null,
      }
    }

    const needsCatalogHint = !match || specificTitle || (match && !clubIntent)
    if (needsCatalogHint && !clubIntent) {
      catalogHint = await lookupCatalogHint(searchTerm, titlePart)
    } else if (!match && clubIntent) {
      catalogHint = await withTimeout(lookupCatalogHint(searchTerm, titlePart), 2_500)
    }

    if (match && catalogHint && !normalisedTitlesAlign(match.title, catalogHint.title)) {
      const queryNorm = normalisePhrase(titlePart || query)
      const hintNorm = normalisePhrase(catalogHint.title)
      if (hintNorm === queryNorm || normalisedTitlesAlign(titlePart || query, catalogHint.title)) {
        match = null
      }
    }
  } catch (error) {
    console.error('[club-search] lookup error:', error)
  }

  let unavailableReason: 'copyright' | 'not_found' | null = null
  let unavailableNote: string | null = null

  if (!match) {
    if (catalogHint) {
      unavailableReason = unavailableReasonForHint(catalogHint)
      unavailableNote = copyrightNoticeForHint(catalogHint)
    } else if (!clubIntent) {
      unavailableReason = 'not_found'
      unavailableNote =
        'No public-domain full read found on Project Gutenberg. Try a classic title or author name.'
    }
  }

  const guideTitle =
    clubIntent
      ? searchTerm
      : match?.title ?? catalogHint?.title ?? searchTerm
  const guideAuthor = match?.author ?? catalogHint?.author ?? null

  const guideBook = guideTitle
    ? { title: guideTitle, author: guideAuthor, subjects: [] as string[] }
    : null

  const clubGuide = (() => {
    if (clubIntent && guideBook) {
      try {
        return buildClubSearchGuide(parsed, guideBook)
      } catch (error) {
        console.error('[club-search] guide build error:', error)
      }
    }
    return null
  })()

  const offerFallbackPicks = shouldOfferFallbackPicks(
    parsed,
    match,
    catalogHint,
    unavailableReason,
  )

  const finalGuide =
    clubGuide ?? (offerFallbackPicks ? buildFallbackPickGuide(query) : null)

  const pickBooks =
    offerFallbackPicks && finalGuide?.intent === 'club_picks' && !match
      ? await getDailyClubReadableMatches()
      : []

  const sourceBook = match
    ? {
        title: match.title,
        author: match.author ?? '',
        gutenbergId: match.gutenbergId,
      }
    : null

  return {
    query,
    match,
    pickBooks,
    sources: sourceBook ? buildReadableSourceLinks(sourceBook) : [],
    film,
    unavailableReason,
    unavailableNote:
      finalGuide && !match
        ? unavailableNote ??
          (clubIntent
            ? `Book club guide for “${guideTitle}”. Search the exact title for a readable edition when available.`
            : null)
        : unavailableNote,
    catalogHint,
    clubGuide: finalGuide,
  }
}

export { sourceAccessLabel } from '@/lib/book-sources'
