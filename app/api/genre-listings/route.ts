import { NextResponse } from 'next/server'
import { fetchGenreAisleListings } from '@/lib/genre-aisle-counts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sections = await fetchGenreAisleListings()
    const totalTitlesViaSources = sections.reduce((sum, section) => sum + section.count, 0)
    return NextResponse.json({ success: true, sections, totalTitlesViaSources })
  } catch (error) {
    console.error('[genre-listings]', error)
    return NextResponse.json({ success: false, sections: [] }, { status: 500 })
  }
}
