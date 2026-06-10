import { NextResponse } from 'next/server'
import { fetchGenreAisleListings } from '@/lib/genre-aisle-counts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sections = await fetchGenreAisleListings()
    return NextResponse.json({ success: true, sections })
  } catch (error) {
    console.error('[genre-listings]', error)
    return NextResponse.json({ success: false, sections: [] }, { status: 500 })
  }
}
