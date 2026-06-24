import { resolveGutenbergReadableMatch } from '@/lib/club-search'
import { primaryTitleForMatch } from '@/lib/book-search'
import { fetchGutendexBookById } from '@/lib/gutenberg'
import { importGutenbergBookByGutendex } from '@/lib/gutenberg-ingest'
import { resolveClubBookByQuery } from '@/lib/resolve-club-book'

export function clubOpenHref(title: string, author: string | null): string {
  const params = new URLSearchParams({ title })
  if (author?.trim()) params.set('author', author.trim())
  return `/books/open?${params.toString()}`
}

export async function ensureClubReadableBook(
  title: string,
  author: string | null,
): Promise<{ id: number } | null> {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) return null

  const primaryTitle = primaryTitleForMatch(trimmedTitle)
  const searchTitles = [...new Set([trimmedTitle, primaryTitle].filter(Boolean))]

  for (const searchTitle of searchTitles) {
    const query = [searchTitle, author?.trim()].filter(Boolean).join(' ')
    const existing = await resolveClubBookByQuery(query)
    if (existing) return { id: existing.id }

    const gutenbergMatch = await resolveGutenbergReadableMatch(
      query,
      searchTitle,
      author?.trim() ?? '',
      12_000,
    )
    if (!gutenbergMatch) continue

    if (gutenbergMatch.bookId) return { id: gutenbergMatch.bookId }

    const fullBook = await fetchGutendexBookById(gutenbergMatch.gutenbergId)
    if (!fullBook) continue

    const importedId = await importGutenbergBookByGutendex(fullBook)
    if (importedId) return { id: importedId }

    const afterImport = await resolveClubBookByQuery(query)
    if (afterImport) return { id: afterImport.id }
  }

  return null
}
