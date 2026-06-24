import { resolveGutenbergReadableMatch } from '@/lib/club-search'
import {
  findQueuedClubBook,
  markClubBookImported,
  markClubBookUnavailable,
  queueClubBookImport,
} from '@/lib/club-import-queue'
import { primaryTitleForMatch } from '@/lib/book-search'
import { fetchGutendexBookById } from '@/lib/gutenberg'
import { importGutenbergBookByGutendex } from '@/lib/gutenberg-ingest'
import { resolveClubBookByQuery } from '@/lib/resolve-club-book'

export function clubOpenHref(title: string, author: string | null): string {
  const params = new URLSearchParams({ title })
  if (author?.trim()) params.set('author', author.trim())
  return `/books/open?${params.toString()}`
}

export type EnsureClubBookResult =
  | { status: 'ready'; bookId: number }
  | { status: 'adding'; title: string; author: string | null }
  | { status: 'unavailable'; reason: 'copyright' | 'not_found' }

async function tryImportTitle(
  searchTitle: string,
  author: string | null,
): Promise<number | null> {
  const query = [searchTitle, author?.trim()].filter(Boolean).join(' ')

  const existing = await resolveClubBookByQuery(query)
  if (existing) return existing.id

  const gutenbergMatch = await resolveGutenbergReadableMatch(
    query,
    searchTitle,
    author?.trim() ?? '',
    12_000,
  )
  if (!gutenbergMatch) return null

  if (gutenbergMatch.bookId) return gutenbergMatch.bookId

  const fullBook = await fetchGutendexBookById(gutenbergMatch.gutenbergId)
  if (!fullBook) return null

  const importedId = await importGutenbergBookByGutendex(fullBook)
  if (importedId) {
    await markClubBookImported(searchTitle, author, importedId, gutenbergMatch.gutenbergId)
    return importedId
  }

  const afterImport = await resolveClubBookByQuery(query)
  return afterImport?.id ?? null
}

/** Load or import a public-domain book into the club catalog. */
export async function ensureClubReadableBook(
  title: string,
  author: string | null,
): Promise<{ id: number } | null> {
  const result = await ensureClubReadableBookWithStatus(title, author)
  return result.status === 'ready' ? { id: result.bookId } : null
}

export async function ensureClubReadableBookWithStatus(
  title: string,
  author: string | null,
): Promise<EnsureClubBookResult> {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) return { status: 'unavailable', reason: 'not_found' }

  const queued = await findQueuedClubBook(trimmedTitle, author)
  if (queued?.status === 'imported' && queued.bookId) {
    return { status: 'ready', bookId: queued.bookId }
  }
  if (queued?.status === 'unavailable') {
    return { status: 'unavailable', reason: 'copyright' }
  }

  const primaryTitle = primaryTitleForMatch(trimmedTitle)
  const searchTitles = [...new Set([trimmedTitle, primaryTitle].filter(Boolean))]

  for (const searchTitle of searchTitles) {
    const bookId = await tryImportTitle(searchTitle, author)
    if (bookId) return { status: 'ready', bookId }
  }

  const query = [primaryTitle, author?.trim()].filter(Boolean).join(' ')
  const gutenbergMatch = await resolveGutenbergReadableMatch(
    query,
    primaryTitle,
    author?.trim() ?? '',
    12_000,
  )

  if (gutenbergMatch) {
    await queueClubBookImport({
      title: trimmedTitle,
      author,
      gutenbergId: gutenbergMatch.gutenbergId,
      status: 'pending',
    })
    return { status: 'adding', title: trimmedTitle, author }
  }

  await queueClubBookImport({
    title: trimmedTitle,
    author,
    gutenbergId: null,
    status: 'unavailable',
  })
  await markClubBookUnavailable(trimmedTitle, author)
  return { status: 'unavailable', reason: 'copyright' }
}
