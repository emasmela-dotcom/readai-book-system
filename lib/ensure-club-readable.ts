import { resolveGutenbergReadableMatch } from '@/lib/club-search'
import { fetchGutendexBookById } from '@/lib/gutenberg'
import { importGutenbergBookByGutendex } from '@/lib/gutenberg-ingest'
import { resolveClubBookByQuery } from '@/lib/resolve-club-book'

export async function ensureClubReadableBook(
  title: string,
  author: string | null,
): Promise<{ id: number } | null> {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) return null

  const query = [trimmedTitle, author?.trim()].filter(Boolean).join(' ')
  const existing = await resolveClubBookByQuery(query)
  if (existing) return { id: existing.id }

  const gutenbergMatch = await resolveGutenbergReadableMatch(
    query,
    trimmedTitle,
    author?.trim() ?? '',
    12_000,
  )
  if (!gutenbergMatch) return null

  if (gutenbergMatch.bookId) return { id: gutenbergMatch.bookId }

  const fullBook = await fetchGutendexBookById(gutenbergMatch.gutenbergId)
  if (!fullBook) return null

  const importedId = await importGutenbergBookByGutendex(fullBook)
  if (importedId) return { id: importedId }

  const afterImport = await resolveClubBookByQuery(query)
  return afterImport ? { id: afterImport.id } : null
}
