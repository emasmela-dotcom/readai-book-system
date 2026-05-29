/**
 * Real cover resolution: try each source in order until a usable jacket image is found.
 * See COVER_SOURCE_STEPS for the canonical sequence and provider links.
 */

import {
  coverUrlCandidates,
  gutenbergScannedCoverUrl,
  isGutenbergGeneratedCoverUrl,
  isRealCoverUrl,
  isUsableCoverBytes,
  MIN_OPEN_LIBRARY_COVER_BYTES,
  MIN_SCANNED_COVER_BYTES,
  openLibraryGutenbergCoverUrl,
  searchOpenLibraryCover,
} from '@/lib/book-covers'

export type CoverSourceId =
  | 'stored'
  | 'gutenberg-scanned'
  | 'open-library-search'
  | 'open-library-gutenberg'

export interface CoverBookInput {
  title: string
  author?: string | null
  gutenbergId?: number | null
  coverUrl?: string | null
}

export interface CoverProviderLink {
  order: number
  sourceId: CoverSourceId | 'gutenberg-ebook' | 'open-library-catalog' | 'internet-archive' | 'google-books'
  label: string
  description: string
  href: string
}

export interface ResolvedCover {
  url: string
  sourceId: CoverSourceId
}

/** Order used by resolveCoverFromSources — do not reorder without updating docs/UI. */
export const COVER_SOURCE_STEPS: { id: CoverSourceId; label: string }[] = [
  { id: 'stored', label: 'Saved cover URL (Neon)' },
  { id: 'gutenberg-scanned', label: 'Project Gutenberg scanned jacket' },
  { id: 'open-library-search', label: 'Open Library title/author match' },
  { id: 'open-library-gutenberg', label: 'Open Library cover by Gutenberg id' },
]

function encodeQuery(title: string, author?: string | null): string {
  return encodeURIComponent([title, author?.trim()].filter(Boolean).join(' ').trim())
}

function minBytesForUrl(url: string): number {
  if (url.includes('openlibrary.org')) return MIN_OPEN_LIBRARY_COVER_BYTES
  if (url.includes('gutenberg.org')) return MIN_SCANNED_COVER_BYTES
  return MIN_OPEN_LIBRARY_COVER_BYTES
}

async function fetchImageBytes(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'ReadAI-Book-Club/1.0' },
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.toLowerCase().startsWith('image/')) return null
    return res.arrayBuffer()
  } catch {
    return null
  }
}

/** Returns true when the URL returns a real image above minimum size (not a 1×1 placeholder). */
export async function isUsableCoverImageUrl(url: string): Promise<boolean> {
  const buf = await fetchImageBytes(url)
  return buf != null && isUsableCoverBytes(buf.byteLength, minBytesForUrl(url))
}

/**
 * Links to browse each provider for this title (manual verification).
 * Image resolution uses COVER_SOURCE_STEPS automatically.
 */
export function buildCoverProviderLinks(book: CoverBookInput): CoverProviderLink[] {
  const query = encodeQuery(book.title, book.author)
  const links: CoverProviderLink[] = []
  let order = 1

  if (book.gutenbergId) {
    const gid = book.gutenbergId
    links.push({
      order: order++,
      sourceId: 'gutenberg-ebook',
      label: 'Project Gutenberg — ebook',
      description: 'Read the edition; check for a scanned cover in the book files.',
      href: `https://www.gutenberg.org/ebooks/${gid}`,
    })
    links.push({
      order: order++,
      sourceId: 'gutenberg-scanned',
      label: 'Project Gutenberg — cover image',
      description: 'Direct scanned jacket URL used in step 2 of auto-resolution.',
      href: gutenbergScannedCoverUrl(gid),
    })
  }

  links.push({
    order: order++,
    sourceId: 'open-library-catalog',
    label: 'Open Library — search',
    description: 'Find the edition; cover art used in steps 3–4 when matched.',
    href: `https://openlibrary.org/search?q=${query}`,
  })

  if (book.gutenbergId) {
    links.push({
      order: order++,
      sourceId: 'open-library-gutenberg',
      label: 'Open Library — Gutenberg cover',
      description: 'Cover keyed to this Gutenberg id (step 4).',
      href: openLibraryGutenbergCoverUrl(book.gutenbergId),
    })
  }

  links.push({
    order: order++,
    sourceId: 'internet-archive',
    label: 'Internet Archive',
    description: 'Scans and borrowable editions that may include jacket images.',
    href: `https://archive.org/search?query=${query}`,
  })

  links.push({
    order: order++,
    sourceId: 'google-books',
    label: 'Google Books',
    description: 'Preview and discovery for jacket reference.',
    href: `https://books.google.com/books?q=${query}`,
  })

  return links
}

/**
 * Direct image URLs to try in the browser (sync). Open Library search runs on the server
 * via /api/book-cover/[id] or resolveCoverFromSources.
 */
export function buildDirectCoverImageUrls(book: CoverBookInput): string[] {
  const urls: string[] = []
  const push = (url: string) => {
    const u = url.trim()
    if (!u || isGutenbergGeneratedCoverUrl(u) || urls.includes(u)) return
    urls.push(u)
  }

  const stored = book.coverUrl?.trim()
  if (stored && isRealCoverUrl(stored)) push(stored)

  if (book.gutenbergId != null) {
    for (const url of coverUrlCandidates(book.gutenbergId)) push(url)
  }

  return urls
}

/**
 * Walk each source in COVER_SOURCE_STEPS until a real jacket image is found for this book.
 */
export async function resolveCoverFromSources(book: CoverBookInput): Promise<ResolvedCover | null> {
  const stored = book.coverUrl?.trim()
  if (stored && isRealCoverUrl(stored) && !isGutenbergGeneratedCoverUrl(stored)) {
    if (await isUsableCoverImageUrl(stored)) {
      return { url: stored, sourceId: 'stored' }
    }
  }

  const gid = book.gutenbergId
  if (gid != null) {
    const pgUrl = gutenbergScannedCoverUrl(gid)
    if (await isUsableCoverImageUrl(pgUrl)) {
      return { url: pgUrl, sourceId: 'gutenberg-scanned' }
    }
  }

  const title = book.title?.trim()
  if (title) {
    const fromSearch = await searchOpenLibraryCover(title, book.author)
    if (fromSearch && (await isUsableCoverImageUrl(fromSearch))) {
      return { url: fromSearch, sourceId: 'open-library-search' }
    }
  }

  if (gid != null) {
    const olGut = openLibraryGutenbergCoverUrl(gid)
    if (await isUsableCoverImageUrl(olGut)) {
      return { url: olGut, sourceId: 'open-library-gutenberg' }
    }
  }

  return null
}

export function coverSourceLabel(sourceId: CoverSourceId): string {
  return COVER_SOURCE_STEPS.find((s) => s.id === sourceId)?.label ?? sourceId
}
