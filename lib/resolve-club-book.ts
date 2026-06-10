import { normalisePhrase, parseTitleAuthorQuery } from '@/lib/book-search'
import { sql } from '@/lib/db'
import { searchBooks } from '@/lib/search-books'

export const CLUB_READ_LABEL = 'ReadAI · read in club'

export type ClubBookMatch = {
  id: number
  title: string
  author: string | null
  coverUrl: string | null
  href: string
  sourceLabel: string
}

type BookRow = {
  id?: number
  title?: string
  author?: string | null
  cover_url?: string | null
}

function scoreTitleMatch(
  query: string,
  titlePart: string,
  bookTitle: string,
  bookAuthor: string | null,
  authorPart: string,
): number {
  const q = normalisePhrase(query)
  const titleQ = normalisePhrase(titlePart)
  const book = normalisePhrase(bookTitle)
  if (!book) return -1

  let score = 0
  if (book === q || book === titleQ) score += 100
  else if (book.startsWith(titleQ) || titleQ.startsWith(book)) score += 75
  else if (book.includes(titleQ) || titleQ.includes(book)) score += 55
  else {
    const qWords = titleQ.split(' ').filter(Boolean)
    const matched = qWords.filter((word) => book.includes(word)).length
    if (matched < Math.max(1, Math.ceil(qWords.length * 0.6))) return -1
    score += matched * 12
  }

  if (authorPart.trim() && bookAuthor?.trim()) {
    const authorQ = normalisePhrase(authorPart)
    const author = normalisePhrase(bookAuthor)
    if (author.includes(authorQ) || authorQ.includes(author)) score += 30
    else if (authorPart !== query.trim()) score -= 15
  }

  return score
}

function toClubMatch(row: BookRow, fallbackTitle: string): ClubBookMatch | null {
  if (!row.id) return null
  const coverUrl = row.cover_url?.trim() || null
  return {
    id: row.id,
    title: row.title?.trim() || fallbackTitle,
    author: row.author?.trim() ?? null,
    coverUrl,
    href: `/books/${row.id}/read`,
    sourceLabel: CLUB_READ_LABEL,
  }
}

/** Resolve a search query to a readable club book — never an external catalog page. */
export async function resolveClubBookByQuery(raw: string): Promise<ClubBookMatch | null> {
  const query = raw.trim()
  if (!query) return null

  const { titlePart, authorPart } = parseTitleAuthorQuery(query)
  const attempts = [...new Set([query, titlePart].filter(Boolean))]

  let best: { row: BookRow; score: number } | null = null

  for (const term of attempts) {
    const { books } = await searchBooks(term, 15, 0)
    for (const book of books) {
      const row = book as BookRow
      if (!row.id) continue
      const score = scoreTitleMatch(query, titlePart, row.title ?? '', row.author ?? null, authorPart)
      if (score < 45) continue
      if (!best || score > best.score) best = { row, score }
    }
  }

  if (best) return toClubMatch(best.row, titlePart)

  const exact = await sql`
    SELECT id, title, author, cover_url
    FROM books
    WHERE gutenberg_id IS NOT NULL
      AND LOWER(TRIM(title)) = LOWER(TRIM(${titlePart}))
    LIMIT 1
  `
  if (exact[0]?.id) {
    return toClubMatch(exact[0] as BookRow, titlePart)
  }

  return null
}

function scoreFilmClubTitle(filmTitle: string, bookTitle: string): number {
  const film = normalisePhrase(filmTitle)
  const book = normalisePhrase(bookTitle)
  if (!film || !book) return -1
  if (book === film) return 100
  if (book.startsWith(film + ' ')) return 85
  return -1
}

/** Film tie-in books that live on club shelves (not external movie-book pages). */
export async function resolveClubBookForFilm(
  filmTitle: string,
  clubBookTitle?: string,
  bookSearchQuery?: string,
): Promise<ClubBookMatch | null> {
  const title = filmTitle.trim()
  if (!title) return null

  const terms = [
    ...new Set([clubBookTitle, bookSearchQuery, title].filter((t): t is string => Boolean(t?.trim()))),
  ]
  for (const term of terms) {
    const byQuery = await resolveClubBookByQuery(term)
    if (byQuery) return byQuery
  }

  for (const term of terms) {
    const exact = await sql`
      SELECT id, title, author, cover_url
      FROM books
      WHERE gutenberg_id IS NOT NULL
        AND LOWER(TRIM(title)) = LOWER(TRIM(${term}))
      LIMIT 1
    `
    if (exact[0]?.id) return toClubMatch(exact[0] as BookRow, term)
  }

  const candidates = await sql`
    SELECT id, title, author, cover_url
    FROM books
    WHERE gutenberg_id IS NOT NULL
      AND (
        LOWER(TRIM(title)) = LOWER(TRIM(${title}))
        OR LOWER(title) LIKE LOWER(TRIM(${title})) || ' %'
      )
    ORDER BY id DESC
    LIMIT 20
  `

  for (const row of candidates) {
    if (scoreFilmClubTitle(title, row.title as string) >= 85) {
      return toClubMatch(row as BookRow, title)
    }
  }

  return null
}
