import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { searchBooks } from '@/lib/search-books'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    let booksResult: unknown[]
    let countResult: unknown[]

    if (category && subcategory) {
      booksResult = await sql`
        SELECT * FROM books 
        WHERE category = ${category}
          AND subcategory = ${subcategory}
          AND gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books 
        WHERE category = ${category}
          AND subcategory = ${subcategory}
          AND gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
      `
    } else if (category) {
      booksResult = await sql`
        SELECT * FROM books 
        WHERE category = ${category}
          AND gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books 
        WHERE category = ${category}
          AND gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
      `
    } else if (search) {
      const { books, totalBooks } = await searchBooks(search, limit, offset)
      booksResult = books
      countResult = [{ count: totalBooks }]
    } else {
      booksResult = await sql`
        SELECT * FROM books 
        WHERE gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books
        WHERE gutenberg_id IS NOT NULL
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
      `
    }

    const totalBooks = parseInt(String((countResult[0] as { count?: string | number })?.count || 0))
    const totalPages = Math.ceil(totalBooks / limit)

    return NextResponse.json({
      success: true,
      books: booksResult,
      pagination: {
        page,
        limit,
        totalBooks,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Books API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    )
  }
}
