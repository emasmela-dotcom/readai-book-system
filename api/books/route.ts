import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    let booksResult: any[]
    let countResult: any[]

    // Build queries based on filters
    if (category && subcategory) {
      booksResult = await sql`
        SELECT * FROM books 
        WHERE category = ${category} AND subcategory = ${subcategory}
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books 
        WHERE category = ${category} AND subcategory = ${subcategory}
      `
    } else if (category) {
      booksResult = await sql`
        SELECT * FROM books 
        WHERE category = ${category}
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books 
        WHERE category = ${category}
      `
    } else if (search) {
      const searchTerm = `%${search.toLowerCase()}%`
      booksResult = await sql`
        SELECT * FROM books 
        WHERE LOWER(title) LIKE ${searchTerm} OR LOWER(author) LIKE ${searchTerm}
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*) as count FROM books 
        WHERE LOWER(title) LIKE ${searchTerm} OR LOWER(author) LIKE ${searchTerm}
      `
    } else {
      // No filters - get all books
      booksResult = await sql`
        SELECT * FROM books 
        ORDER BY added_date DESC, id DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`SELECT COUNT(*) as count FROM books`
    }

    const totalBooks = parseInt(countResult[0]?.count || 0)
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
        hasPrev: page > 1
      }
    })
  } catch (error: any) {
    console.error('Books API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
