import { searchOpenLibraryCover } from '@/lib/book-covers'
import { sql } from '@/lib/db'

export interface MovieBookMatch {
  bookTitle: string
  coverUrl: string | null
  /** ReadAI book page only */
  href: string
}

function normaliseTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleTokens(s: string): string[] {
  const n = normaliseTitle(s)
  return n.split(' ').filter((t) => t.length >= 3 && t !== 'the')
}

function scoreClubTitle(filmTitle: string, bookTitle: string): number {
  const film = normaliseTitle(filmTitle)
  const book = normaliseTitle(bookTitle)
  if (!film || !book) return -1
  if (book === film) return 100
  if (book.startsWith(film + ' ')) return 80
  if (book.includes(film)) return 60
  const tokens = titleTokens(filmTitle)
  if (tokens.length === 0) return -1
  const matched = tokens.filter((t) => book.includes(t)).length
  if (matched === tokens.length) return 40 + matched
  return -1
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

  const mainToken = titleTokens(filmTitle)[0] ?? titleTokens(clubBookTitle ?? '')[0]
  if (!mainToken) return null

  const candidates = await sql`
    SELECT id, title, cover_url
    FROM books
    WHERE gutenberg_id IS NOT NULL
      AND LOWER(title) LIKE '%' || ${mainToken} || '%'
    ORDER BY id DESC
    LIMIT 40
  `

  let best: { id: number; title: string; cover_url: string | null; score: number } | null = null
  for (const row of candidates) {
    const score = Math.max(
      scoreClubTitle(filmTitle, row.title as string),
      clubBookTitle ? scoreClubTitle(clubBookTitle, row.title as string) : -1,
    )
    if (score < 0) continue
    if (!best || score > best.score) {
      best = {
        id: row.id as number,
        title: row.title as string,
        cover_url: (row.cover_url as string | null) ?? null,
        score,
      }
    }
  }

  if (!best) return null
  return { id: best.id, title: best.title, cover_url: best.cover_url }
}

/** Club shelf book for a film — only returns a link when the full book is in ReadAI. */
export async function resolveMovieBook(
  filmTitle: string,
  clubBookTitle?: string,
): Promise<MovieBookMatch | null> {
  const title = filmTitle.trim()
  if (!title) return null

  const club = await findClubBook(title, clubBookTitle)
  if (!club) return null

  let coverUrl = club.cover_url?.trim() || null
  if (!coverUrl) {
    coverUrl = await searchOpenLibraryCover(club.title, null)
  }

  return {
    bookTitle: club.title,
    coverUrl,
    href: `/books/${club.id}`,
  }
}

export async function searchMovieBookCover(filmTitle: string, clubBookTitle?: string): Promise<string | null> {
  const match = await resolveMovieBook(filmTitle, clubBookTitle)
  return match?.coverUrl ?? null
}
