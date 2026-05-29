import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { realCoverAnd } from '@/lib/real-cover-filter'

export const dynamic = 'force-dynamic'

async function ensureCoverUrlColumn() {
  try {
    await sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT`
  } catch {
    // ignore if already applied or no permission
  }
}

export async function GET() {
  try {
    await ensureCoverUrlColumn()

    const rows = await sql`
      SELECT id, title, author, gutenberg_id, cover_url, subcategory, category
      FROM books
      WHERE gutenberg_id IS NOT NULL
      ${realCoverAnd}
      ORDER BY id DESC
      LIMIT 120
    `

    return NextResponse.json({
      success: true,
      books: rows.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        gutenbergId: b.gutenberg_id as number,
        coverUrl: b.cover_url as string,
        genreTitle: (b.subcategory ?? b.category ?? undefined) as string | undefined,
      })),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
