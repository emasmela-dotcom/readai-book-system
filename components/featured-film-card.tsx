import type { FeaturedFilm } from '@/lib/movie-sources'
import type { FeaturedFilmDisplay } from '@/lib/movie-book-covers'
import { FilmCoverThumb } from '@/components/film-cover-thumb'
import { sourceAccessLabel } from '@/lib/book-sources'

export function FeaturedFilmCard({
  film,
  display,
  eagerCover = false,
}: {
  film: FeaturedFilm
  display: FeaturedFilmDisplay
  eagerCover?: boolean
}) {
  return (
    <li className="border border-white/15 bg-[#171311] p-4">
      <div className="flex gap-4">
        <FilmCoverThumb
          filmTitle={film.title}
          eager={eagerCover}
          className="h-[6.5rem] w-[4.5rem] shrink-0 border border-white/15 bg-[#18120e] object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg text-[#f5f2ed]">
            {film.title}
            {film.year ? <span className="text-[#d4cdc4]"> ({film.year})</span> : null}
          </p>
          <p className="mt-1 text-xs text-[#eadfce]">{display.bookTitle}</p>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-[#c9a96e]/90">
            Connected sources
          </p>
          {display.sources.length > 0 ? (
            <ul className="mt-3 space-y-1">
              {display.sources.slice(0, 3).map((source) => (
                <li key={source.id}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#c9a96e] hover:underline"
                  >
                    {sourceAccessLabel(source.access)} · {source.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-[#eadfce]/70">No source links for this title.</p>
          )}
        </div>
      </div>
    </li>
  )
}
