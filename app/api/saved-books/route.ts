import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

function parseIds(raw: string | null): number[] {
  if (!raw?.trim()) return []
  const seen = new Set<number>()
  const ids: number[] = []
  for (const part of raw.split(',')) {
    const n = Number(part.trim())
    if (!Number.isInteger(n) || n < 1 || seen.has(n)) continue
    seen.add(n)
    ids.push(n)
  }
  return ids.slice(0, 200)
}

export async function GET(request: NextRequest) {
  const ids = parseIds(request.nextUrl.searchParams.get('ids'))
  if (ids.length === 0) {
    return NextResponse.json({ success: true, books: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const rows = await sql`
      SELECT id, title, author, cover_url, gutenberg_id
      FROM books
      WHERE id = ANY(${ids})
    `

    const byId = new Map(
      rows.map((row) => [
        row.id as number,
        {
          id: row.id as number,
          title: row.title as string,
          author: row.author as string,
          coverUrl: (row.cover_url as string | null) ?? undefined,
          gutenbergId: (row.gutenberg_id as number | null) ?? undefined,
        },
      ]),
    )

    const books = ids.map((id) => byId.get(id)).filter((book): book is NonNullable<typeof book> => book != null)

    return NextResponse.json({ success: true, books }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, books: [] }, { status: 500 })
  }
}
