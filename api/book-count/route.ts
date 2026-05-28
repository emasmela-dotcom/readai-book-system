import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get total book count
    const result = await sql`SELECT COUNT(*) as count FROM books`
    const totalBooks = parseInt(result[0]?.count || 0)
    
    // Get breakdown by category
    const byCategory = await sql`
      SELECT category, COUNT(*) as count 
      FROM books 
      GROUP BY category 
      ORDER BY count DESC
    `
    
    // Get today's date and today's additions
    const today = new Date().toISOString().split('T')[0]
    const todayCount = await sql`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE added_date = ${today}
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

