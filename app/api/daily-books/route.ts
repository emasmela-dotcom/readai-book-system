import { NextRequest, NextResponse } from 'next/server'
import { importCuratedGutenbergBooks, importGutenbergBooks } from '@/lib/gutenberg-ingest'
import { sql } from '@/lib/db'

/** How many complete public-domain books to add per cron run. */
const BOOKS_PER_DAY = 10

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  const log: string[] = []
  log.push(`\n🕕 ${new Date().toISOString()} - ReadAI full-book import`)
  log.push(`📅 Date: ${today}`)

  try {
    const existingLogs = await sql`
      SELECT * FROM daily_logs 
      WHERE date = ${today}
      LIMIT 1
    `

    if (existingLogs.length > 0) {
      log.push(`✅ Full books already imported for ${today}`)
      return NextResponse.json({
        success: true,
        message: 'Books already added today',
        log: log.join('\n'),
        previous: existingLogs[0],
      })
    }

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
    )
    const startPage = (dayOfYear % 80) + 1

    log.push(`📚 Importing ${BOOKS_PER_DAY} full books from Project Gutenberg (page ${startPage})...`)

    let result
    try {
      result = await importGutenbergBooks(BOOKS_PER_DAY, startPage)
    } catch {
      log.push('Gutendex unavailable — importing from curated Gutenberg list...')
      result = await importCuratedGutenbergBooks(BOOKS_PER_DAY)
    }

    for (const book of result.titles) {
      log.push(`  ✅ ${book.title} by ${book.author} (${book.words.toLocaleString()} words)`)
    }
    log.push(`⏭️ Skipped: ${result.skipped}`)
    if (result.errors.length > 0) {
      log.push(`⚠️ Errors: ${result.errors.slice(0, 5).join('; ')}`)
    }

    const totalBooksResult = await sql`SELECT COUNT(*)::int as count FROM books`
    const fullBooksResult = await sql`
      SELECT COUNT(*)::int as count FROM books
      WHERE gutenberg_id IS NOT NULL
    `
    const totalBooks = totalBooksResult[0]?.count ?? 0
    const fullBooks = fullBooksResult[0]?.count ?? 0

    await sql`
      INSERT INTO daily_logs (date, books_added, total_books, execution_time, status)
      VALUES (${today}, ${result.imported}, ${totalBooks}, ${new Date().toISOString()}, 'success')
    `

    log.push(`\n🎉 Imported ${result.imported} full books`)
    log.push(`📖 Full books in club library: ${fullBooks}`)
    log.push(`📊 Total catalog rows: ${totalBooks}`)

    return NextResponse.json({
      success: true,
      date: today,
      booksAdded: result.imported,
      fullBooksInLibrary: fullBooks,
      totalBooks,
      startPage,
      executionTime: new Date().toISOString(),
      log: log.join('\n'),
      imported: result.titles,
      skipped: result.skipped,
      errors: result.errors,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errorLog = [...log, `\n❌ Error: ${message}`]

    try {
      await sql`
        INSERT INTO daily_logs (date, books_added, total_books, execution_time, status, error_message)
        VALUES (${today}, 0, 0, ${new Date().toISOString()}, 'error', ${message})
      `
    } catch {
      // ignore log failure
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        log: errorLog.join('\n'),
      },
      { status: 500 },
    )
  }
}
