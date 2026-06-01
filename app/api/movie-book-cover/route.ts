import { NextRequest, NextResponse } from 'next/server'
import { FEATURED_FILMS, matchKnownFilm } from '@/lib/movie-sources'
import { resolveFeaturedFilm } from '@/lib/movie-book-covers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q) {
    return NextResponse.json({ success: false, coverUrl: null, href: null }, { status: 400 })
  }

  try {
    const known = matchKnownFilm(q)
    const featured = known ? FEATURED_FILMS.find((f) => f.title === known.title) : undefined
    const searchTitle = known?.title ?? q
    const display = await resolveFeaturedFilm(
      featured ?? { title: searchTitle, bookSearchQuery: searchTitle },
    )

    return NextResponse.json(
      {
        success: true,
        coverUrl: display.coverUrl,
        href: display.href,
        bookTitle: display.bookTitle,
        inClub: display.inClub,
        sourceLabel: display.sourceLabel,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message, coverUrl: null, href: null },
      { status: 500 },
    )
  }
}
