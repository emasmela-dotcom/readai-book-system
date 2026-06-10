import type { BookstoreAisle } from '@/lib/bookstore-sections'
import { sql } from '@/lib/db'
import { isExpandedAisle } from '@/lib/aisle-shelf-queries'

export type ShelfBookRow = {
  id: number
  title: string
  author: string
  rating: string | number | null
  pages: number | null
  gutenberg_id: number | null
  cover_url: string | null
}

export async function fetchCookingShelfBooks(
  limit: number,
  offset: number,
): Promise<{ total: number; rows: ShelfBookRow[] }> {
  const countRows = await sql`
    SELECT COUNT(*)::int as count FROM books
    WHERE gutenberg_id IS NOT NULL
    AND cover_url IS NOT NULL
    AND cover_url NOT LIKE '%/cache/epub/%'
    AND (
      cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
      OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
    )
    AND (
      subcategory = 'cooking'
      OR LOWER(title) LIKE '%cookery%'
      OR LOWER(title) LIKE '%cook book%'
      OR LOWER(title) LIKE '%cookbook%'
      OR LOWER(title) LIKE '%kitchen%'
      OR LOWER(title) LIKE '%culinary%'
      OR LOWER(title) LIKE '%gastronom%'
      OR LOWER(title) LIKE '%domestic economy%'
    )
  `
  const rows = await sql`
    SELECT id, title, author, rating, pages, gutenberg_id, cover_url
    FROM books
    WHERE gutenberg_id IS NOT NULL
    AND cover_url IS NOT NULL
    AND cover_url NOT LIKE '%/cache/epub/%'
    AND (
      cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
      OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
    )
    AND (
      subcategory = 'cooking'
      OR LOWER(title) LIKE '%cookery%'
      OR LOWER(title) LIKE '%cook book%'
      OR LOWER(title) LIKE '%cookbook%'
      OR LOWER(title) LIKE '%kitchen%'
      OR LOWER(title) LIKE '%culinary%'
      OR LOWER(title) LIKE '%gastronom%'
      OR LOWER(title) LIKE '%domestic economy%'
    )
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return { total: Number(countRows[0]?.count ?? 0), rows: rows as ShelfBookRow[] }
}

/** Full club books for a reading room — readable in ReadAI, not external catalog pages. */
export async function fetchGenreClubShelf(
  aisle: BookstoreAisle,
  limit: number,
  offset: number,
): Promise<{ total: number; rows: ShelfBookRow[] }> {
  if (isExpandedAisle(aisle.id) && aisle.id === 'cooking') {
    return fetchCookingShelfBooks(limit, offset)
  }

  if (aisle.subcategory) {
    const countRows = await sql`
      SELECT COUNT(*)::int as count FROM books
      WHERE category = ${aisle.category}
        AND subcategory = ${aisle.subcategory}
        AND gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
    `
    const rows = await sql`
      SELECT id, title, author, rating, pages, gutenberg_id, cover_url
      FROM books
      WHERE category = ${aisle.category}
        AND subcategory = ${aisle.subcategory}
        AND gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return { total: Number(countRows[0]?.count ?? 0), rows: rows as ShelfBookRow[] }
  }

  const countRows = await sql`
    SELECT COUNT(*)::int as count FROM books
    WHERE category = ${aisle.category}
      AND gutenberg_id IS NOT NULL
      AND cover_url IS NOT NULL
      AND cover_url NOT LIKE '%/cache/epub/%'
      AND (
        cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
        OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
      )
  `
  const rows = await sql`
    SELECT id, title, author, rating, pages, gutenberg_id, cover_url
    FROM books
    WHERE category = ${aisle.category}
      AND gutenberg_id IS NOT NULL
      AND cover_url IS NOT NULL
      AND cover_url NOT LIKE '%/cache/epub/%'
      AND (
        cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
        OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
      )
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return { total: Number(countRows[0]?.count ?? 0), rows: rows as ShelfBookRow[] }
}
