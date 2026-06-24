import { resolveGutenbergReadableMatch } from '@/lib/club-search'
import { findQueuedClubBook, markClubBookImported, queueClubBookImport } from '@/lib/club-import-queue'
import { normalisePhrase, primaryTitleForMatch, significantTitleTokens } from '@/lib/book-search'
import { fetchGutendexBookById } from '@/lib/gutenberg'
import { CURATED_GUTENBERG, importGutenbergBookByGutendex } from '@/lib/gutenberg-ingest'
import { resolveClubBookByQuery } from '@/lib/resolve-club-book'

export type EnsureClubBookResult =
  | { status: 'ready'; bookId: number }
  | { status: 'loading'; title: string; author: string | null }
  | { status: 'sources_only'; title: string; author: string | null }

function matchCuratedGutenbergId(title: string): number | null {
  const primary = normalisePhrase(primaryTitleForMatch(title))
  const queryTokens = significantTitleTokens(primaryTitleForMatch(title))
  if (!primary || queryTokens.length === 0) return null

  for (const book of CURATED_GUTENBERG) {
    const curated = normalisePhrase(book.title)
    const curatedTokens = significantTitleTokens(book.title)
    if (curated.includes(primary) || primary.includes(curated)) return book.id

    const querySet = new Set(queryTokens)
    let shared = 0
    for (const token of curatedTokens) {
      if (querySet.has(token)) shared += 1
    }
    if (shared >= 2 || (queryTokens.length === 1 && shared === 1 && queryTokens[0].length >= 5)) {
      return book.id
    }
  }

  return null
}

async function importByGutenbergId(gutenbergId: number): Promise<number | null> {
  const existing = await importGutenbergBookByGutendex({
    id: gutenbergId,
    title: '',
    authors: [],
    subjects: [],
    languages: ['en'],
    download_count: 0,
    formats: {},
  })
  if (existing) return existing

  const fullBook = await fetchGutendexBookById(gutenbergId)
  if (!fullBook) return null
  return importGutenbergBookByGutendex(fullBook)
}

async function tryImportTitle(searchTitle: string, author: string | null): Promise<number | null> {
  const query = [searchTitle, author?.trim()].filter(Boolean).join(' ')

  const existing = await resolveClubBookByQuery(query)
  if (existing) return existing.id

  const curatedId = matchCuratedGutenbergId(searchTitle)
  if (curatedId) {
    const imported = await importByGutenbergId(curatedId)
    if (imported) return imported
  }

  const gutenbergMatch = await resolveGutenbergReadableMatch(
    query,
    searchTitle,
    author?.trim() ?? '',
    15_000,
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

  return resolveClubBookByQuery(query).then((match) => match?.id ?? null)
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
  if (!trimmedTitle) return { status: 'sources_only', title: trimmedTitle, author }

  const queued = await findQueuedClubBook(trimmedTitle, author)
  if (queued?.status === 'imported' && queued.bookId) {
    return { status: 'ready', bookId: queued.bookId }
  }

  const primaryTitle = primaryTitleForMatch(trimmedTitle)
  const searchTitles = [...new Set([trimmedTitle, primaryTitle].filter(Boolean))]

  for (const searchTitle of searchTitles) {
    const bookId = await tryImportTitle(searchTitle, author)
    if (bookId) {
      await markClubBookImported(trimmedTitle, author, bookId, matchCuratedGutenbergId(searchTitle))
      return { status: 'ready', bookId }
    }
  }

  const hasPublicDomainSignal =
    matchCuratedGutenbergId(trimmedTitle) != null ||
    (await resolveGutenbergReadableMatch(
      [primaryTitle, author?.trim()].filter(Boolean).join(' '),
      primaryTitle,
      author?.trim() ?? '',
      15_000,
    )) != null

  if (hasPublicDomainSignal) {
    await queueClubBookImport({
      title: trimmedTitle,
      author,
      gutenbergId: matchCuratedGutenbergId(trimmedTitle),
      status: 'pending',
    })
    return { status: 'loading', title: trimmedTitle, author }
  }

  return { status: 'sources_only', title: trimmedTitle, author }
}
