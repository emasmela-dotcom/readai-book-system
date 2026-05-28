// Quick script to check total book count in ReadAI Neon database
require('dotenv').config()
const { neon } = require('@neondatabase/serverless')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set')
  console.log('💡 Set it with: export DATABASE_URL="your-neon-connection-string"')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function checkCount() {
  try {
    console.log('📚 Checking ReadAI book count...\n')
    
    const result = await sql`SELECT COUNT(*) as count FROM books`
    const totalBooks = parseInt(result[0]?.count || 0)
    
    console.log(`✅ Total books in ReadAI: ${totalBooks.toLocaleString()}`)
    
    // Also check by category
    const byCategory = await sql`
      SELECT category, COUNT(*) as count 
      FROM books 
      GROUP BY category 
      ORDER BY count DESC
    `
    
    console.log('\n📊 Breakdown by category:')
    byCategory.forEach(row => {
      console.log(`   ${row.category}: ${parseInt(row.count).toLocaleString()} books`)
    })
    
    // Check today's additions
    const today = new Date().toISOString().split('T')[0]
    const todayCount = await sql`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE added_date = ${today}
    `
    console.log(`\n📅 Books added today (${today}): ${parseInt(todayCount[0]?.count || 0)}`)
    
    // Check daily logs
    const recentLogs = await sql`
      SELECT date, books_added, total_books 
      FROM daily_logs 
      ORDER BY date DESC 
      LIMIT 5
    `
    
    if (recentLogs.length > 0) {
      console.log('\n📋 Recent daily additions:')
      recentLogs.forEach(log => {
        console.log(`   ${log.date}: +${log.books_added} books (Total: ${log.total_books})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Make sure DATABASE_URL is set in your .env file')
  }
}

checkCount()

