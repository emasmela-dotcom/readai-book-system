import { NextResponse } from 'next/server'
import { fetchCookingShelfBooks } from '@/lib/aisle-shelf-books'
import { isExpandedAisle } from '@/lib/aisle-shelf-queries'
import { hasRealCoverUrl } from '@/lib/real-cover-filter'
import { BOOKSTORE_AISLES } from '@/lib/bookstore-sections'
import { getDbHost, sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const totalResult = await sql`
      SELECT COUNT(*)::int as count FROM books
      WHERE gutenberg_id IS NOT NULL
      AND cover_url IS NOT NULL
      AND cover_url NOT LIKE '%/cache/epub/%'
      AND (
        cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
        OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
      )
    `
    const totalBooks = totalResult[0]?.count ?? 0

    const fullBooks = totalBooks

    const today = new Date().toISOString().split('T')[0]
    const todayResult = await sql`
      SELECT COUNT(*)::int as count FROM books
      WHERE added_date = ${today}
        AND gutenberg_id IS NOT NULL
      AND cover_url IS NOT NULL
      AND cover_url NOT LIKE '%/cache/epub/%'
      AND (
        cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
        OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
      )
    `
    const booksToday = todayResult[0]?.count ?? 0

    const countRows = await sql`
      SELECT category, subcategory, COUNT(*)::int as count
      FROM books
      WHERE gutenberg_id IS NOT NULL
      AND cover_url IS NOT NULL
      AND cover_url NOT LIKE '%/cache/epub/%'
      AND (
        cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
        OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
      )
      GROUP BY category, subcategory
    `
    const countMap = new Map<string, number>()
    for (const row of countRows) {
      countMap.set(`${row.category}:${row.subcategory}`, row.count)
    }

    const sections = await Promise.all(
      BOOKSTORE_AISLES.map(async (aisle) => {
        let count = 0
        if (aisle.subcategory) {
          count = countMap.get(`${aisle.category}:${aisle.subcategory}`) ?? 0
        } else {
          for (const [key, n] of countMap) {
            if (key.startsWith(`${aisle.category}:`)) count += n
          }
        }

        let books: Record<string, unknown>[]

        if (isExpandedAisle(aisle.id) && aisle.id === 'cooking') {
          count = (await fetchCookingShelfBooks(1, 0)).total
          books = (await fetchCookingShelfBooks(6, 0)).rows as Record<string, unknown>[]
        } else if (aisle.subcategory) {
          books = (await sql`
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
              LIMIT 6
            `) as Record<string, unknown>[]
        } else {
          books = (await sql`
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
              LIMIT 6
            `) as Record<string, unknown>[]
        }

        return {
          id: aisle.id,
          title: aisle.title,
          tagline: aisle.tagline,
          category: aisle.category,
          subcategory: aisle.subcategory ?? null,
          count,
          books: books.map((b) => {
            const id = b.id as number
            const coverUrl = typeof b.cover_url === 'string' ? b.cover_url.trim() : ''
            return {
              id,
              title: b.title as string,
              author: b.author as string,
              rating: b.rating != null ? Number(b.rating) : null,
              pages: b.pages as number,
              gutenbergId: b.gutenberg_id as number,
              coverUrl: hasRealCoverUrl(coverUrl) ? coverUrl : undefined,
              fullBook: true,
            }
          }),
        }
      }),
    )

    const departmentTotals = await sql`
      SELECT category, COUNT(*)::int as count
      FROM books
      WHERE gutenberg_id IS NOT NULL
      AND cover_url IS NOT NULL
      AND cover_url NOT LIKE '%/cache/epub/%'
      AND (
        cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
        OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
      )
      GROUP BY category
      ORDER BY count DESC
    `

    return NextResponse.json(
      {
        success: true,
        totalBooks,
        fullBooks,
        booksToday,
        ...(process.env.NODE_ENV === 'development' ? { dbHost: getDbHost() } : {}),
        departments: departmentTotals.map((d) => ({
          category: d.category,
          count: d.count,
        })),
        sections,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
