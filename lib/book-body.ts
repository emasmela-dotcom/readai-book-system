import { hasReadableBookSource } from '@/lib/full-books'
import { sql } from '@/lib/db'
import {
  downloadGutenbergCacheText,
  fetchGutenbergPlainText,
  isFullBookText,
  MIN_FULL_BOOK_WORDS,
  wordCount,
} from '@/lib/gutenberg'

export type BookBodySource = 'library' | 'gutenberg'

export interface ResolvedBookBody {
  text: string
  source: BookBodySource
  wordCount: number
}

interface BookForBody {
  id: number
  title: string
  author: string
}

export async function bookHasFullText(bookId: number): Promise<boolean> {
  const rows = await sql`
    SELECT gutenberg_id FROM books WHERE id = ${bookId} LIMIT 1
  `
  return hasReadableBookSource(rows[0] ?? {})
}

/** Full book text only — no sample chapters. */
export async function resolveBookBody(book: BookForBody): Promise<ResolvedBookBody | null> {
  let gutenbergId: number | null = null

  try {
    const rows = await sql`
      SELECT gutenberg_id FROM books WHERE id = ${book.id} LIMIT 1
    `
    const rawGutenbergId = rows[0]?.gutenberg_id
    if (typeof rawGutenbergId === 'number') {
      gutenbergId = rawGutenbergId
    }
  } catch {
    return null
  }

  if (gutenbergId != null) {
    const direct = await downloadGutenbergCacheText(gutenbergId)
    if (direct && isFullBookText(direct)) {
      return { text: direct, source: 'gutenberg', wordCount: wordCount(direct) }
    }
  }

  const gutenberg = await fetchGutenbergPlainText(book.title, book.author)
  if (gutenberg && isFullBookText(gutenberg)) {
    return { text: gutenberg, source: 'gutenberg', wordCount: wordCount(gutenberg) }
  }

  return null
}

export { MIN_FULL_BOOK_WORDS }

const WORDS_PER_PAGE = 350

export function paginateBookText(
  fullText: string,
  page: number,
): { pageText: string; page: number; totalPages: number; wordCount: number } {
  const words = fullText.split(/\s+/).filter(Boolean)
  const totalWords = words.length
  const totalPages = Math.max(1, Math.ceil(totalWords / WORDS_PER_PAGE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * WORDS_PER_PAGE
  const pageWords = words.slice(start, start + WORDS_PER_PAGE)
  const pageText = pageWords.join(' ')

  return { pageText, page: safePage, totalPages, wordCount: totalWords }
}

export function formatPageText(pageText: string): string[] {
  return pageText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}
