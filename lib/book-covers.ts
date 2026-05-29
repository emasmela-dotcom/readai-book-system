/** Scanned jacket from Project Gutenberg. */
export function gutenbergScannedCoverUrl(gutenbergId: number): string {
  return `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/images/cover.jpg`
}

/** Open Library cover by Gutenberg id (often missing; validated before use). */
export function openLibraryGutenbergCoverUrl(gutenbergId: number): string {
  return `https://covers.openlibrary.org/b/gutenberg/${gutenbergId}-M.jpg`
}

export function openLibraryCoverIdUrl(coverId: number): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
}

/** Real cover URLs only — no PG auto-generated title cards. */
export function coverUrlCandidates(gutenbergId: number): string[] {
  return [gutenbergScannedCoverUrl(gutenbergId), openLibraryGutenbergCoverUrl(gutenbergId)]
}

export const MIN_SCANNED_COVER_BYTES = 2_000
export const MIN_OPEN_LIBRARY_COVER_BYTES = 1_000

export function isUsableCoverBytes(byteLength: number, minBytes: number): boolean {
  return byteLength >= minBytes
}

function isImageContentType(contentType: string | null): boolean {
  return Boolean(contentType?.toLowerCase().startsWith('image/'))
}

async function fetchImageBytes(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    if (!isImageContentType(res.headers.get('content-type'))) return null
    return res.arrayBuffer()
  } catch {
    return null
  }
}

export async function hasGutenbergScannedCover(gutenbergId: number): Promise<boolean> {
  const buf = await fetchImageBytes(gutenbergScannedCoverUrl(gutenbergId))
  return buf != null && isUsableCoverBytes(buf.byteLength, MIN_SCANNED_COVER_BYTES)
}

async function hasOpenLibraryImageUrl(url: string): Promise<boolean> {
  const buf = await fetchImageBytes(url)
  return buf != null && isUsableCoverBytes(buf.byteLength, MIN_OPEN_LIBRARY_COVER_BYTES)
}

async function hasOpenLibraryGutenbergCover(gutenbergId: number): Promise<boolean> {
  return hasOpenLibraryImageUrl(openLibraryGutenbergCoverUrl(gutenbergId))
}

export function isGutenbergScannedCoverUrl(url: string): boolean {
  return /gutenberg\.org\/files\/\d+\/\d+-h\/images\/cover\.jpg$/i.test(url.trim())
}

/** PG cache/epub title cards — not real jackets. */
export function isGutenbergGeneratedCoverUrl(url: string): boolean {
  return /gutenberg\.org\/cache\/epub\/\d+\/pg\d+\.cover\./i.test(url.trim())
}

export function isOpenLibraryCoverIdUrl(url: string): boolean {
  return /openlibrary\.org\/b\/id\/\d+/i.test(url.trim())
}

/** Only scanned PG jackets or Open Library edition covers. */
export function isRealCoverUrl(url: string): boolean {
  const u = url.trim()
  if (!u || isGutenbergGeneratedCoverUrl(u)) return false
  return isGutenbergScannedCoverUrl(u) || isOpenLibraryCoverIdUrl(u)
}

/** @deprecated use isRealCoverUrl */
export function isUsableStoredCoverUrl(url: string): boolean {
  return isRealCoverUrl(url)
}

/** Safe for client components — no DB imports. */
export function hasRealCoverUrl(coverUrl: string | null | undefined): boolean {
  const url = coverUrl?.trim()
  if (!url) return false
  return isRealCoverUrl(url)
}

function authorSearchTerm(author: string | null | undefined): string | undefined {
  if (!author?.trim()) return undefined
  const cleaned = author.trim().replace(/\s+author$/i, '')
  const comma = cleaned.split(',')[0]?.trim()
  if (comma) return comma
  const parts = cleaned.split(/\s+/).filter(Boolean)
  return parts[parts.length - 1]
}

async function pickFromOpenLibraryDocs(
  docs: { cover_i?: number }[] | undefined,
): Promise<string | null> {
  for (const doc of docs ?? []) {
    if (typeof doc.cover_i !== 'number') continue
    const url = openLibraryCoverIdUrl(doc.cover_i)
    if (await hasOpenLibraryImageUrl(url)) return url
  }
  return null
}

async function queryOpenLibrary(params: URLSearchParams): Promise<string | null> {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'ReadAI-Book-Club/1.0' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { docs?: { cover_i?: number }[] }
    return pickFromOpenLibraryDocs(data.docs)
  } catch {
    return null
  }
}

export async function searchOpenLibraryCover(
  title: string,
  author: string | null | undefined,
): Promise<string | null> {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) return null

  const authorTerm = authorSearchTerm(author)

  if (authorTerm) {
    const withAuthor = new URLSearchParams({
      limit: '8',
      fields: 'title,author_name,cover_i',
      title: trimmedTitle,
      author: authorTerm,
    })
    const found = await queryOpenLibrary(withAuthor)
    if (found) return found
  }

  const titleOnly = new URLSearchParams({
    limit: '10',
    fields: 'title,author_name,cover_i',
    title: trimmedTitle,
  })
  const byTitle = await queryOpenLibrary(titleOnly)
  if (byTitle) return byTitle

  const broad = new URLSearchParams({
    limit: '10',
    fields: 'title,author_name,cover_i',
    q: [trimmedTitle, authorTerm].filter(Boolean).join(' '),
  })
  return queryOpenLibrary(broad)
}

export interface ResolveCoverOptions {
  title?: string
  author?: string | null
}

export async function resolveBestCoverUrl(
  gutenbergId: number,
  options?: ResolveCoverOptions,
): Promise<string | null> {
  const { resolveCoverFromSources } = await import('@/lib/book-cover-sources')
  const resolved = await resolveCoverFromSources({
    gutenbergId,
    title: options?.title ?? '',
    author: options?.author,
    coverUrl: null,
  })
  return resolved?.url ?? null
}
