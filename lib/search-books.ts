import { neon } from '@neondatabase/serverless'
import { getDatabaseUrl } from '@/lib/db'
import {
  buildFlexibleSearchQuery,
  buildTitleAuthorSearchQuery,
  parseTitleAuthorQuery,
} from '@/lib/book-search'

export interface SearchBooksResult {
  books: unknown[]
  totalBooks: number
}

export async function searchBooks(
  raw: string,
  limit: number,
  offset: number,
): Promise<SearchBooksResult> {
  const trimmed = raw.trim()
  const { titlePart, authorPart, isTitleByAuthor } = parseTitleAuthorQuery(trimmed)

  const plan = isTitleByAuthor
    ? buildTitleAuthorSearchQuery(titlePart, authorPart)
    : buildFlexibleSearchQuery(trimmed)

  if (!plan) return { books: [], totalBooks: 0 }

  const db = neon(getDatabaseUrl())

  const books = await db(
    `SELECT * FROM (
       SELECT DISTINCT ON (LOWER(TRIM(title)))
         *
       FROM books
       WHERE ${plan.whereSql}
       ORDER BY LOWER(TRIM(title)), ${plan.orderSql}
     ) AS deduped
     ORDER BY ${plan.orderSql}
     LIMIT $${plan.params.length + 1}
     OFFSET $${plan.params.length + 2}`,
    [...plan.params, limit, offset],
  )

  const countRows = await db(
    `SELECT COUNT(*)::int AS count FROM (
       SELECT DISTINCT LOWER(TRIM(title))
       FROM books
       WHERE ${plan.whereSql}
     ) AS deduped`,
    plan.params,
  )

  const totalBooks = (countRows[0] as { count?: number })?.count ?? 0
  return { books, totalBooks }
}
