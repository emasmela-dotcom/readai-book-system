import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { realCoverAnd } from '@/lib/real-cover-filter'

export async function GET() {
  try {
    // Get total book count
    const result = await sql`
      SELECT COUNT(*) as count FROM books
      WHERE gutenberg_id IS NOT NULL
      ${realCoverAnd}
    `
    const totalBooks = parseInt(result[0]?.count || 0)
    
    // Get breakdown by category
    const byCategory = await sql`
      SELECT category, COUNT(*) as count 
      FROM books 
      WHERE gutenberg_id IS NOT NULL
      ${realCoverAnd}
      GROUP BY category 
      ORDER BY count DESC
    `

    const bySubcategory = await sql`
      SELECT category, subcategory, COUNT(*) as count
      FROM books
      WHERE gutenberg_id IS NOT NULL
      ${realCoverAnd}
      GROUP BY category, subcategory
      ORDER BY category, count DESC
    `
    
    // Get today's date and today's additions
    const today = new Date().toISOString().split('T')[0]
    const todayCount = await sql`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE added_date = ${today}
        AND gutenberg_id IS NOT NULL
      ${realCoverAnd}
    `
    
    // Get recent daily logs
    const recentLogs = await sql`
      SELECT date, books_added, total_books 
      FROM daily_logs 
      ORDER BY date DESC 
      LIMIT 5
    `
    
    return NextResponse.json({
      success: true,
      totalBooks,
      today: {
        date: today,
        booksAdded: parseInt(todayCount[0]?.count || 0)
      },
      byCategory: byCategory.map(row => ({
        category: row.category,
        count: parseInt(row.count)
      })),
      bySubcategory: bySubcategory.map(row => ({
        category: row.category,
        subcategory: row.subcategory,
        count: parseInt(row.count)
      })),
      recentLogs: recentLogs.map(log => ({
        date: log.date,
        booksAdded: log.books_added,
        totalBooks: log.total_books
      }))
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    )
  }
}

