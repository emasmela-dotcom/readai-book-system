import { NextRequest, NextResponse } from 'next/server'
import { FEATURED_FILMS, matchKnownFilm } from '@/lib/movie-sources'
import { resolveMovieBook } from '@/lib/movie-book-covers'

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
    const match = await resolveMovieBook(searchTitle, featured?.clubBookTitle)

    return NextResponse.json(
      {
        success: true,
        coverUrl: match?.coverUrl ?? null,
        href: match?.href ?? null,
        bookTitle: match?.bookTitle ?? searchTitle,
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
