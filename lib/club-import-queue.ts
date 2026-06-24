import { sql } from '@/lib/db'

export type ClubImportQueueStatus = 'pending' | 'imported' | 'unavailable'

function queueKey(title: string, author: string | null): { title: string; author: string } {
  return {
    title: title.trim().toLowerCase(),
    author: (author?.trim() || '').toLowerCase(),
  }
}

async function ensureQueueTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS club_import_queue (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      display_title TEXT NOT NULL,
      display_author TEXT,
      gutenberg_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      book_id INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (title, author)
    )
  `
}

export async function queueClubBookImport(input: {
  title: string
  author: string | null
  gutenbergId: number | null
  status?: ClubImportQueueStatus
  bookId?: number | null
}): Promise<void> {
  await ensureQueueTable()
  const key = queueKey(input.title, input.author)

  await sql`
    INSERT INTO club_import_queue (
      title,
      author,
      display_title,
      display_author,
      gutenberg_id,
      status,
      book_id,
      updated_at
    )
    VALUES (
      ${key.title},
      ${key.author},
      ${input.title.trim()},
      ${input.author?.trim() || null},
      ${input.gutenbergId},
      ${input.status ?? 'pending'},
      ${input.bookId ?? null},
      NOW()
    )
    ON CONFLICT (title, author) DO UPDATE SET
      gutenberg_id = COALESCE(EXCLUDED.gutenberg_id, club_import_queue.gutenberg_id),
      status = CASE
        WHEN club_import_queue.status = 'imported' THEN club_import_queue.status
        ELSE EXCLUDED.status
      END,
      book_id = COALESCE(EXCLUDED.book_id, club_import_queue.book_id),
      display_title = EXCLUDED.display_title,
      display_author = EXCLUDED.display_author,
      updated_at = NOW()
  `
}

export async function markClubBookImported(
  title: string,
  author: string | null,
  bookId: number,
  gutenbergId: number | null,
): Promise<void> {
  await ensureQueueTable()
  const key = queueKey(title, author)
  await sql`
    UPDATE club_import_queue
    SET status = 'imported', book_id = ${bookId}, gutenberg_id = ${gutenbergId}, updated_at = NOW()
    WHERE title = ${key.title} AND author = ${key.author}
  `
}

export async function markClubBookUnavailable(title: string, author: string | null): Promise<void> {
  await ensureQueueTable()
  const key = queueKey(title, author)
  await sql`
    UPDATE club_import_queue
    SET status = 'unavailable', updated_at = NOW()
    WHERE title = ${key.title} AND author = ${key.author}
  `
}

export async function findQueuedClubBook(
  title: string,
  author: string | null,
): Promise<{ status: ClubImportQueueStatus; bookId: number | null } | null> {
  await ensureQueueTable()
  const key = queueKey(title, author)
  const rows = await sql`
    SELECT status, book_id
    FROM club_import_queue
    WHERE title = ${key.title} AND author = ${key.author}
    LIMIT 1
  `
  const row = rows[0] as { status: string; book_id: number | null } | undefined
  if (!row) return null
  const status = row.status as ClubImportQueueStatus
  if (status !== 'pending' && status !== 'imported' && status !== 'unavailable') return null
  return { status, bookId: row.book_id }
}
