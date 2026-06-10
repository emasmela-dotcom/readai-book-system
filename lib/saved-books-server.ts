import type { ReadingPosition } from '@/lib/reading-position'
import { sql } from '@/lib/db'

export type SavedBookRow = {
  bookId: number
  position: ReadingPosition
  updatedAt: number
  title: string
  author: string
  coverUrl?: string
  gutenbergId?: number
}

function positionFromRow(row: {
  position_mode: string
  position_page: number | null
  position_scroll_y: number | null
}): ReadingPosition {
  if (row.position_mode === 'scroll') {
    return {
      mode: 'scroll',
      scrollY: row.position_scroll_y ?? 0,
    }
  }
  return {
    mode: 'pages',
    page: row.position_page ?? 1,
  }
}

export async function listSavedBooksForUser(userId: string): Promise<SavedBookRow[]> {
  const rows = await sql`
    SELECT
      s.book_id,
      s.position_mode,
      s.position_page,
      s.position_scroll_y,
      s.updated_at,
      b.title,
      b.author,
      b.cover_url,
      b.gutenberg_id
    FROM user_saved_books s
    INNER JOIN books b ON b.id = s.book_id
    WHERE s.user_id = ${userId}
    ORDER BY s.updated_at DESC
  `

  return rows.map((row) => ({
    bookId: row.book_id as number,
    position: positionFromRow({
      position_mode: row.position_mode as string,
      position_page: row.position_page as number | null,
      position_scroll_y: row.position_scroll_y as number | null,
    }),
    updatedAt: new Date(row.updated_at as string).getTime(),
    title: (row.title as string) ?? 'Untitled',
    author: (row.author as string) ?? 'Unknown author',
    coverUrl: (row.cover_url as string | null) ?? undefined,
    gutenbergId: (row.gutenberg_id as number | null) ?? undefined,
  }))
}

export async function saveBookForUser(
  userId: string,
  bookId: number,
  position: ReadingPosition,
): Promise<void> {
  const page = position.mode === 'pages' ? position.page ?? 1 : null
  const scrollY = position.mode === 'scroll' ? position.scrollY ?? 0 : null

  await sql`
    INSERT INTO user_saved_books (user_id, book_id, position_mode, position_page, position_scroll_y, updated_at)
    VALUES (${userId}, ${bookId}, ${position.mode}, ${page}, ${scrollY}, NOW())
    ON CONFLICT (user_id, book_id) DO UPDATE SET
      position_mode = EXCLUDED.position_mode,
      position_page = EXCLUDED.position_page,
      position_scroll_y = EXCLUDED.position_scroll_y,
      updated_at = NOW()
  `
}

export async function unsaveBookForUser(userId: string, bookId: number): Promise<void> {
  await sql`
    DELETE FROM user_saved_books
    WHERE user_id = ${userId}
      AND book_id = ${bookId}
  `
}

export async function isBookSavedForUser(userId: string, bookId: number): Promise<boolean> {
  const rows = await sql`
    SELECT 1
    FROM user_saved_books
    WHERE user_id = ${userId}
      AND book_id = ${bookId}
    LIMIT 1
  `
  return rows.length > 0
}
