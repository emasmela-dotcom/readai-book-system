import {
  hasOpenLibraryImageUrl,
  openLibraryCoverIdUrl,
  searchOpenLibraryCover,
} from '@/lib/book-covers'
import { sql } from '@/lib/db'
import type { FeaturedFilm } from '@/lib/movie-sources'

export interface FeaturedFilmDisplay {
  bookTitle: string
  coverUrl: string | null
  /** Club read page or connected source (e.g. Open Library book page) */
  href: string | null
  inClub: boolean
  sourceLabel: string | null
}

type OpenLibraryDoc = {
  title?: string
  author_name?: string[]
  cover_i?: number
  edition_count?: number
  key?: string
  edition_key?: string[]
  has_fulltext?: boolean
  ebook_access?: string
  ia?: string[]
  lending_identifier_s?: string
}

function normaliseTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreClubTitle(filmTitle: string, bookTitle: string): number {
  const film = normaliseTitle(filmTitle)
  const book = normaliseTitle(bookTitle)
  if (!film || !book) return -1
  if (book === film) return 100
  if (book.startsWith(film + ' ')) return 85
  return -1
}

function scoreMovieBookDoc(filmTitle: string, doc: OpenLibraryDoc): number {
  const film = normaliseTitle(filmTitle)
  const book = normaliseTitle(doc.title ?? '')
  if (!film || !book) return -1

  let score = 0
  if (book === film) score += 100
  else if (book.startsWith(film + ' ') || book.startsWith(film + ':')) {
    const suffix = book.slice(film.length).trim().replace(/^:/, '').trim()
    if (/^\d|sequel|part\s*2|\b2\b/.test(suffix)) score += 15
    else score += 60
  } else return -1

  if (/\breturns?\b|\brevenge\b|\bfacts\b|\btrivia\b|\bmovies\b|\bannotated\b|\bpirate\b|\bfleet\b|\bbattle\b/i.test(
    doc.title ?? '',
  )) {
    score -= 50
  }
  if (/\breluctant\b/i.test(book)) score -= 50

  if (doc.has_fulltext) score += 45
  if (doc.ebook_access === 'public') score += 55
  else if (doc.ebook_access === 'borrowable') score += 40
  else if (doc.ebook_access === 'printdisabled') score += 15
  else if (doc.ebook_access === 'no_ebook') score -= 80

  if (doc.lending_identifier_s?.trim() || (doc.ia?.length ?? 0) > 0) score += 35

  score += Math.min(doc.edition_count ?? 0, 50)
  return score
}

function internetArchiveDetailsHref(identifier: string): string {
  const id = identifier.trim().replace(/^\/details\//, '')
  return `https://archive.org/details/${encodeURIComponent(id)}`
}

/** Link where the user can read or borrow — not a catalog-only edition page. */
function readableHrefFromDoc(doc: OpenLibraryDoc): string | null {
  const lending = doc.lending_identifier_s?.trim()
  if (lending) return internetArchiveDetailsHref(lending)

  const ia = (doc.ia ?? []).map((x) => x.trim()).filter(Boolean)
  if (ia.length > 0 && doc.has_fulltext) {
    const filmSlug = normaliseTitle(doc.title ?? '').replace(/\s+/g, '')
    const preferred =
      ia.find((id) => id.includes(filmSlug) && !id.startsWith('isbn_')) ??
      ia.find((id) => !id.startsWith('isbn_')) ??
      ia[0]
    return internetArchiveDetailsHref(preferred)
  }

  return null
}

function internetArchiveSearchHref(query: string): string {
  return `https://archive.org/search?query=${encodeURIComponent(query.trim())}`
}

function archiveAccessLabel(ebookAccess?: string): string {
  return ebookAccess === 'public' ? 'Internet Archive · read' : 'Internet Archive · borrow'
}

async function resolveCuratedArchiveLink(
  archiveId: string,
  displayTitle: string,
): Promise<{ bookTitle: string; coverUrl: string | null; href: string; sourceLabel: string }> {
  const href = internetArchiveDetailsHref(archiveId)
  let coverUrl = await searchOpenLibraryCover(displayTitle, null)
  if (!coverUrl) {
    try {
      const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(archiveId)}`, {
        cache: 'no-store',
        headers: { 'User-Agent': 'ReadAI-Book-Club/1.0' },
      })
      if (res.ok) {
        const data = (await res.json()) as { metadata?: { title?: string } }
        const metaTitle = data.metadata?.title?.trim()
        if (metaTitle) coverUrl = await searchOpenLibraryCover(metaTitle, null)
      }
    } catch {
      /* cover optional */
    }
  }
  return {
    bookTitle: displayTitle,
    coverUrl,
    href,
    sourceLabel: 'Internet Archive · borrow',
  }
}

function openLibrarySearchHref(title: string): string {
  return `https://openlibrary.org/search?q=${encodeURIComponent(title.trim())}`
}

async function fetchOpenLibraryDocs(params: URLSearchParams): Promise<OpenLibraryDoc[]> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'ReadAI-Book-Club/1.0' },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: OpenLibraryDoc[] }
    return data.docs ?? []
  } catch {
    return []
  }
}

const OL_SEARCH_FIELDS =
  'title,author_name,cover_i,edition_count,key,edition_key,has_fulltext,ebook_access,ia,lending_identifier_s'

async function findReadableMovieBook(
  filmTitle: string,
  bookSearchQuery?: string,
  bookDisplayTitle?: string,
): Promise<{ bookTitle: string; coverUrl: string | null; href: string; sourceLabel: string } | null> {
  const title = filmTitle.trim()
  if (!title) return null

  const query = bookSearchQuery?.trim() || title

  const searches: URLSearchParams[] = [
    new URLSearchParams({
      limit: '12',
      fields: OL_SEARCH_FIELDS,
      q: query,
    }),
    new URLSearchParams({
      limit: '12',
      fields: OL_SEARCH_FIELDS,
      title,
    }),
    new URLSearchParams({
      limit: '6',
      fields: OL_SEARCH_FIELDS,
      title: `${title} novel`,
    }),
  ]

  const ranked: { doc: OpenLibraryDoc; score: number }[] = []

  for (const params of searches) {
    const docs = await fetchOpenLibraryDocs(params)
    for (const doc of docs) {
      const score = scoreMovieBookDoc(title, doc)
      if (score >= 0) ranked.push({ doc, score })
    }
  }

  ranked.sort((a, b) => b.score - a.score)

  for (const { doc } of ranked) {
    const href = readableHrefFromDoc(doc)
    if (!href) continue
    let coverUrl: string | null = null
    if (typeof doc.cover_i === 'number') {
      const url = openLibraryCoverIdUrl(doc.cover_i)
      if (await hasOpenLibraryImageUrl(url)) coverUrl = url
    }
    return {
      bookTitle: bookDisplayTitle?.trim() || doc.title?.trim() || title,
      coverUrl,
      href,
      sourceLabel: archiveAccessLabel(doc.ebook_access),
    }
  }

  const coverUrl = await searchOpenLibraryCover(query, null)
  return {
    bookTitle: bookDisplayTitle?.trim() || title,
    coverUrl,
    href: internetArchiveSearchHref(`${query} book`),
    sourceLabel: 'Internet Archive · search',
  }
}

async function findClubBook(
  filmTitle: string,
  clubBookTitle?: string,
): Promise<{ id: number; title: string; cover_url: string | null } | null> {
  const terms = [...new Set([clubBookTitle, filmTitle].filter((t): t is string => Boolean(t?.trim())))]

  for (const term of terms) {
    const exact = await sql`
      SELECT id, title, cover_url
      FROM books
      WHERE gutenberg_id IS NOT NULL
        AND LOWER(TRIM(title)) = LOWER(TRIM(${term}))
      LIMIT 1
    `
    if (exact[0]?.id) {
      return {
        id: exact[0].id as number,
        title: exact[0].title as string,
        cover_url: (exact[0].cover_url as string | null) ?? null,
      }
    }
  }

  const candidates = await sql`
    SELECT id, title, cover_url
    FROM books
    WHERE gutenberg_id IS NOT NULL
      AND (
        LOWER(TRIM(title)) = LOWER(TRIM(${filmTitle}))
        OR LOWER(title) LIKE LOWER(TRIM(${filmTitle})) || ' %'
      )
    ORDER BY id DESC
    LIMIT 20
  `

  for (const row of candidates) {
    if (scoreClubTitle(filmTitle, row.title as string) >= 85) {
      return {
        id: row.id as number,
        title: row.title as string,
        cover_url: (row.cover_url as string | null) ?? null,
      }
    }
  }

  return null
}

export type ResolveFeaturedFilmInput = Pick<
  FeaturedFilm,
  'title' | 'clubBookTitle' | 'bookSearchQuery' | 'bookDisplayTitle' | 'readArchiveId' | 'searchOnly'
>

/** Club full text first; otherwise verified Internet Archive read/borrow links. */
export async function resolveFeaturedFilm(
  film: ResolveFeaturedFilmInput | string,
  legacyClubBookTitle?: string,
): Promise<FeaturedFilmDisplay> {
  const input: ResolveFeaturedFilmInput =
    typeof film === 'string'
      ? { title: film, clubBookTitle: legacyClubBookTitle }
      : film

  const title = input.title.trim()
  if (!title) {
    return { bookTitle: '', coverUrl: null, href: null, inClub: false, sourceLabel: null }
  }

  const displayTitle = input.bookDisplayTitle?.trim() || title

  const clubRow = await findClubBook(title, input.clubBookTitle)

  if (input.readArchiveId?.trim() && !clubRow) {
    const curated = await resolveCuratedArchiveLink(input.readArchiveId.trim(), displayTitle)
    return {
      bookTitle: curated.bookTitle,
      coverUrl: curated.coverUrl,
      href: curated.href,
      inClub: false,
      sourceLabel: curated.sourceLabel,
    }
  }

  if (input.searchOnly && !clubRow) {
    const query = input.bookSearchQuery?.trim() || title
    const coverUrl = await searchOpenLibraryCover(title, null)
    return {
      bookTitle: displayTitle,
      coverUrl,
      href: internetArchiveSearchHref(query),
      inClub: false,
      sourceLabel: 'Internet Archive · search',
    }
  }

  const source = await findReadableMovieBook(title, input.bookSearchQuery, input.bookDisplayTitle)

  if (clubRow) {
    let coverUrl = clubRow.cover_url?.trim() || null
    if (!coverUrl) coverUrl = source?.coverUrl ?? null
    return {
      bookTitle: clubRow.title,
      coverUrl,
      href: `/books/${clubRow.id}`,
      inClub: true,
      sourceLabel: 'ReadAI club',
    }
  }

  if (source) {
    return {
      bookTitle: source.bookTitle,
      coverUrl: source.coverUrl,
      href: source.href,
      inClub: false,
      sourceLabel: source.sourceLabel,
    }
  }

  return {
    bookTitle: title,
    coverUrl: null,
    href: openLibrarySearchHref(title),
    inClub: false,
    sourceLabel: 'Open Library · search',
  }
}

/** For search API — returns href when club or source has a book. */
export async function resolveMovieBook(film: ResolveFeaturedFilmInput | string): Promise<FeaturedFilmDisplay> {
  return resolveFeaturedFilm(film)
}

export async function searchMovieBookCover(film: ResolveFeaturedFilmInput | string): Promise<string | null> {
  const display = await resolveFeaturedFilm(film)
  return display.coverUrl
}
