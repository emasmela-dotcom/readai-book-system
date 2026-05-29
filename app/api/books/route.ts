import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { realCoverAnd } from '@/lib/real-cover-filter'
import {
  exactPhraseVariants,
  exactWordsRegex,
  normalisePhrase,
  parseTitleAuthorQuery,
  phraseLike,
} from '@/lib/book-search'

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
        ${realCoverAnd}
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books 
        WHERE category = ${category}
          AND subcategory = ${subcategory}
          AND gutenberg_id IS NOT NULL
        ${realCoverAnd}
      `
    } else if (category) {
      booksResult = await sql`
        SELECT * FROM books 
        WHERE category = ${category}
          AND gutenberg_id IS NOT NULL
        ${realCoverAnd}
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books 
        WHERE category = ${category}
          AND gutenberg_id IS NOT NULL
        ${realCoverAnd}
      `
    } else if (search) {
      const raw = search.trim()
      const { titlePart, authorPart, isTitleByAuthor } = parseTitleAuthorQuery(raw)

      if (isTitleByAuthor) {
        const titleRegex = exactWordsRegex(exactPhraseVariants(titlePart))
        const authorRegex = exactWordsRegex(exactPhraseVariants(authorPart))

        if (!titleRegex || !authorRegex) {
          booksResult = []
          countResult = [{ count: 0 }]
        } else {
          booksResult = await sql`
            SELECT * FROM books
            WHERE LOWER(title) ~* ${titleRegex}
              AND LOWER(author) ~* ${authorRegex}
              AND gutenberg_id IS NOT NULL
            ORDER BY added_date DESC, id DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          countResult = await sql`
            SELECT COUNT(*) as count FROM books
            WHERE LOWER(title) ~* ${titleRegex}
              AND LOWER(author) ~* ${authorRegex}
              AND gutenberg_id IS NOT NULL
          `
        }
      } else {
        const regex = exactWordsRegex(exactPhraseVariants(raw))
        const titleExactLike = phraseLike(normalisePhrase(raw))

        if (!regex) {
          booksResult = []
          countResult = [{ count: 0 }]
        } else {
          booksResult = await sql`
            SELECT * FROM books
            WHERE (LOWER(title) ~* ${regex}
               OR LOWER(author) ~* ${regex})
              AND gutenberg_id IS NOT NULL
            ORDER BY
              CASE WHEN LOWER(title) LIKE ${titleExactLike} THEN 0 ELSE 1 END,
              added_date DESC,
              id DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          countResult = await sql`
            SELECT COUNT(*) as count FROM books
            WHERE (LOWER(title) ~* ${regex}
               OR LOWER(author) ~* ${regex})
              AND gutenberg_id IS NOT NULL
          `
        }
      }
    } else {
      booksResult = await sql`
        SELECT * FROM books 
        WHERE gutenberg_id IS NOT NULL
        ${realCoverAnd}
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books
        WHERE gutenberg_id IS NOT NULL
        ${realCoverAnd}
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
