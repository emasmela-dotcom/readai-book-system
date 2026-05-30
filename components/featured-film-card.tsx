import Link from 'next/link'
import type { FeaturedFilm } from '@/lib/movie-sources'
import type { MovieBookMatch } from '@/lib/movie-book-covers'
import { MovieBookCoverImage } from '@/components/movie-book-cover-image'

export function FeaturedFilmCard({
  film,
  book,
}: {
  film: FeaturedFilm
  book: MovieBookMatch | null
}) {
  const inner = (
    <div className="flex gap-4">
      <MovieBookCoverImage
        coverUrl={book?.coverUrl ?? null}
        title={book?.bookTitle ?? film.title}
        className="h-[6.5rem] w-[4.5rem] shrink-0 border border-white/15 bg-[#18120e] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg text-[#f5f2ed]">
          {film.title}
          {film.year ? <span className="text-[#d4cdc4]"> ({film.year})</span> : null}
        </p>
        {book ? (
          <>
            <p className="mt-1 text-xs text-[#eadfce]">{book.bookTitle}</p>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-[#c9a96e]">Open book →</p>
          </>
        ) : (
          <p className="mt-1 text-xs text-[#eadfce]">Not on the club shelves yet</p>
        )}
      </div>
    </div>
  )

  if (!book) {
    return (
      <li className="border border-white/15 bg-[#171311] p-4 opacity-90">{inner}</li>
    )
  }

  return (
    <li>
      <Link
        href={book.href}
        className="block border border-white/15 bg-[#171311] p-4 transition hover:border-[#c9a96e]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]"
      >
        {inner}
      </Link>
    </li>
  )
}
