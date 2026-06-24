/** Project Gutenberg via Gutendex (public domain, no API key). */

export interface GutendexAuthor {
  name: string
}

export interface GutendexBook {
  id: number
  title: string
  authors: GutendexAuthor[]
  subjects: string[]
  languages: string[]
  download_count: number
  formats: Record<string, string>
}

export interface GutendexResponse {
  count: number
  next: string | null
  previous: string | null
  results: GutendexBook[]
}

export const MIN_FULL_BOOK_WORDS = 5000

export function pickPlainTextUrl(formats: Record<string, string>): string | null {
  return (
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain'] ||
    Object.entries(formats).find(([key]) => key.startsWith('text/plain'))?.[1] ||
    null
  )
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504])

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  attempts = 4,
): Promise<Response> {
  let last: Response | null = null
  let lastError: unknown = null
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { ...init, cache: 'no-store' })
      if (res.ok) return res
      last = res
      if (!RETRYABLE.has(res.status) || i === attempts - 1) return res
    } catch (error) {
      lastError = error
      if (i === attempts - 1) break
    }

    await new Promise((r) => setTimeout(r, 800 * (i + 1)))
  }

  if (last) return last
  throw lastError instanceof Error ? lastError : new Error('Fetch failed')
}

export async function fetchGutendexPage(page: number): Promise<GutendexResponse> {
  const res = await fetchWithRetry(`https://gutendex.com/books/?page=${page}`)
  if (!res.ok) {
    throw new Error(`Gutendex page ${page} failed: ${res.status}`)
  }
  return res.json() as Promise<GutendexResponse>
}

export async function fetchGutendexSearch(
  query: string,
  page = 1,
  languages = 'en',
): Promise<GutendexResponse> {
  const params = new URLSearchParams({ search: query.trim(), languages })
  if (page > 1) params.set('page', String(page))
  const res = await fetchWithRetry(`https://gutendex.com/books/?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Gutendex search "${query}" page ${page} failed: ${res.status}`)
  }
  return res.json() as Promise<GutendexResponse>
}

export async function fetchGutendexBookById(id: number): Promise<GutendexBook | null> {
  try {
    const res = await fetchWithRetry(`https://gutendex.com/books/${id}`)
    if (!res.ok) return null
    return (await res.json()) as GutendexBook
  } catch {
    return null
  }
}

/** Plain text from Project Gutenberg cache (works when Gutendex is down). */
export async function downloadGutenbergCacheText(gutenbergId: number): Promise<string | null> {
  const url = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`
  let res: Response
  try {
    res = await fetchWithRetry(url)
  } catch {
    return null
  }
  if (!res.ok) return null

  let text = await res.text()
  text = text.replace(/\r\n/g, '\n').trim()
  if (!text) return null

  const max = 1_200_000
  return text.length > max ? text.slice(0, max) : text
}

export async function downloadPlainText(formats: Record<string, string>): Promise<string | null> {
  const textUrl = pickPlainTextUrl(formats)
  if (!textUrl) return null

  let textRes: Response
  try {
    textRes = await fetchWithRetry(textUrl)
  } catch {
    return null
  }
  if (!textRes.ok) return null

  let text = await textRes.text()
  text = text.replace(/\r\n/g, '\n').trim()
  if (!text) return null

  const max = 1_200_000
  return text.length > max ? text.slice(0, max) : text
}

export async function fetchGutenbergPlainText(
  title: string,
  author: string,
): Promise<string | null> {
  const search = encodeURIComponent(`${title} ${author}`.trim())
  let indexRes: Response
  try {
    indexRes = await fetchWithRetry(`https://gutendex.com/books/?search=${search}`)
  } catch {
    return null
  }
  if (!indexRes.ok) return null

  const index = (await indexRes.json()) as GutendexResponse
  const hit = index.results?.[0]
  if (!hit) return null

  return downloadPlainText(hit.formats)
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export function isFullBookText(text: string | null | undefined): boolean {
  if (!text?.trim()) return false
  return wordCount(text) >= MIN_FULL_BOOK_WORDS
}
