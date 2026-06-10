import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { runSourceSearch } from '@/lib/club-search'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') ?? searchParams.get('search') ?? ''

    if (!query.trim()) {
      return NextResponse.json({ success: false, error: 'Enter a search term.' }, { status: 400 })
    }

    const result = await runSourceSearch(query)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('club-search error:', error)
    return NextResponse.json({ success: false, error: 'Search failed.' }, { status: 500 })
  }
}
