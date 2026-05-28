import { NextRequest, NextResponse } from 'next/server'
import { importGutenbergBooks } from '@/lib/gutenberg-ingest'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const count = Math.min(50, Math.max(1, Number(searchParams.get('count') || '10')))
  const page = Math.max(1, Number(searchParams.get('page') || '1'))

  try {
    const result = await importGutenbergBooks(count, page)
    const totalResult = await sql`
      SELECT COUNT(*)::int AS count FROM books
      WHERE gutenberg_id IS NOT NULL
    `

    return NextResponse.json({
      success: true,
      ...result,
      fullBooksInLibrary: totalResult[0]?.count ?? 0,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
