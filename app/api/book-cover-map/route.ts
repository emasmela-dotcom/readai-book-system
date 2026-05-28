import { NextResponse } from 'next/server'
import { isGutenbergGeneratedCoverUrl } from '@/lib/book-covers'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** All books with a real (non–auto-generated) cover_url for client merge. */
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, cover_url
      FROM books
      WHERE cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
    `

    const covers: Record<number, string> = {}
    for (const row of rows) {
      const id = row.id as number
      const url = typeof row.cover_url === 'string' ? row.cover_url.trim() : ''
      if (!url || isGutenbergGeneratedCoverUrl(url)) continue
      covers[id] = url
    }

    return NextResponse.json(
      { success: true, covers },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
