import { NextRequest, NextResponse } from 'next/server'
import { fetchCookingShelfBooks } from '@/lib/aisle-shelf-books'
import { sql } from '@/lib/db'
import { isHomeSectionId, type HomeSectionId } from '@/lib/home-section-books'

export const dynamic = 'force-dynamic'

function parseLimit(raw: string | null): number {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return 24
  return Math.min(n, 48)
}

function parsePage(raw: string | null): number {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return 1
  return n
}

function mapRows(rows: Record<string, unknown>[]) {
  return rows.map((b) => ({
    id: b.id as number,
    title: b.title as string,
    author: b.author as string,
    rating: b.rating != null ? Number(b.rating) : null,
    pages: b.pages as number | null,
    gutenberg_id: b.gutenberg_id as number | null,
    cover_url: b.cover_url as string | null,
  }))
}

async function booksForSection(section: HomeSectionId, limit: number, offset: number) {
  switch (section) {
    case 'cookbooks': {
      const { total, rows } = await fetchCookingShelfBooks(limit, offset)
      return { total, rows }
    }
    case 'magazines': {
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
          LOWER(title) LIKE '%magazine%'
          OR LOWER(title) LIKE '%periodical%'
          OR LOWER(title) LIKE '%harper%'
          OR LOWER(title) LIKE '%atlantic%'
          OR LOWER(title) LIKE '%review%'
          OR LOWER(title) LIKE '%journal%'
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
          LOWER(title) LIKE '%magazine%'
          OR LOWER(title) LIKE '%periodical%'
          OR LOWER(title) LIKE '%harper%'
          OR LOWER(title) LIKE '%atlantic%'
          OR LOWER(title) LIKE '%review%'
          OR LOWER(title) LIKE '%journal%'
        )
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      return { total: Number(countRows[0]?.count ?? 0), rows }
    }
    case 'movies': {
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
          category = 'movie_books'
          OR LOWER(title) LIKE '%cinema%'
          OR LOWER(title) LIKE '%screen%'
          OR LOWER(title) LIKE '%film%'
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
          category = 'movie_books'
          OR LOWER(title) LIKE '%cinema%'
          OR LOWER(title) LIKE '%screen%'
          OR LOWER(title) LIKE '%film%'
        )
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      return { total: Number(countRows[0]?.count ?? 0), rows }
    }
    case 'library': {
      const countRows = await sql`
        SELECT COUNT(*)::int as count FROM books
        WHERE gutenberg_id IS NOT NULL
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
        WHERE gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
        ORDER BY added_date DESC NULLS LAST, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      return { total: Number(countRows[0]?.count ?? 0), rows }
    }
  }
}

export async function GET(request: NextRequest) {
  const sectionRaw = request.nextUrl.searchParams.get('section')?.trim() ?? ''
  if (!isHomeSectionId(sectionRaw)) {
    return NextResponse.json({ success: false, error: 'Invalid section' }, { status: 400 })
  }

  const limit = parseLimit(request.nextUrl.searchParams.get('limit'))
  const page = parsePage(request.nextUrl.searchParams.get('page'))
  const offset = (page - 1) * limit

  try {
    const { total, rows } = await booksForSection(sectionRaw, limit, offset)
    const books = mapRows(rows as Record<string, unknown>[])

    return NextResponse.json(
      {
        success: true,
        section: sectionRaw,
        books,
        pagination: {
          page,
          limit,
          totalBooks: total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, books: [] }, { status: 500 })
  }
}
