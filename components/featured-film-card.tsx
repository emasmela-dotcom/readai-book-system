import Link from 'next/link'
import type { FeaturedFilm } from '@/lib/movie-sources'
import type { FeaturedFilmDisplay } from '@/lib/movie-book-covers'
import { MovieBookCoverImage } from '@/components/movie-book-cover-image'

export function FeaturedFilmCard({
  film,
  display,
}: {
  film: FeaturedFilm
  display: FeaturedFilmDisplay
}) {
  const inner = (
    <div className="flex gap-4">
      <MovieBookCoverImage
        coverUrl={display.coverUrl}
        title={film.title}
        className="h-[6.5rem] w-[4.5rem] shrink-0 border border-white/15 bg-[#18120e] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg text-[#f5f2ed]">
          {film.title}
          {film.year ? <span className="text-[#d4cdc4]"> ({film.year})</span> : null}
        </p>
        <p className="mt-1 text-xs text-[#eadfce]">{display.bookTitle}</p>
        {display.sourceLabel ? (
          <p className="mt-1 text-[10px] uppercase tracking-wider text-[#c9a96e]/90">
            {display.inClub ? 'On the club shelves' : `Via ${display.sourceLabel}`}
          </p>
        ) : null}
        {display.href ? (
          <p className="mt-3 text-[10px] uppercase tracking-wider text-[#c9a96e]">Open book →</p>
        ) : null}
      </div>
    </div>
  )

  if (!display.href) {
    return <li className="border border-white/15 bg-[#171311] p-4">{inner}</li>
  }

  if (display.inClub) {
    return (
      <li>
        <Link
          href={display.href}
          className="block border border-white/15 bg-[#171311] p-4 transition hover:border-[#c9a96e]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]"
        >
          {inner}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <a
        href={display.href}
        target="_blank"
        rel="noreferrer"
        className="block border border-white/15 bg-[#171311] p-4 transition hover:border-[#c9a96e]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]"
      >
        {inner}
      </a>
    </li>
  )
}
