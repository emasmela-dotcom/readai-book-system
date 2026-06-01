import Link from 'next/link'
import { FeaturedFilmCard } from '@/components/featured-film-card'
import { MovieSearchPanel } from '@/components/movie-search-panel'
import { resolveFeaturedFilm } from '@/lib/movie-book-covers'
import { CONNECTED_MOVIE_SOURCES, FEATURED_FILMS, movieAccessLabel } from '@/lib/movie-sources'

export const metadata = {
  title: 'Movies & Movie Books | ReadAI',
  description: 'Open movie tie-in books on the club shelves or via connected sources.',
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { q?: string | string[] } | Promise<{ q?: string | string[] }>
}) {
  const resolvedParams = await Promise.resolve(searchParams)
  const rawQ = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q
  const initialQuery = rawQ?.trim() ?? ''

  const featuredWithBooks = await Promise.all(
    FEATURED_FILMS.map(async (film) => ({
      film,
      display: await resolveFeaturedFilm(film),
    })),
  )

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Club home
          </Link>
          <span className="text-[#d4cdc4]">/</span>
          <span className="text-[#f5f2ed]">Movies</span>
        </nav>

        <header className="border-b border-white/10 pb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Film room</p>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">Movies &amp; movie books</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#f5f2ed]">
            Club shelves hold public-domain full books you read here. Modern film books open on
            Internet Archive to read or borrow — not catalog pages with only &ldquo;Locate.&rdquo;
          </p>
        </header>

        <section className="mt-10 border border-white/10 bg-[#16110d] p-5 md:p-8">
          <h2 className="font-serif text-2xl text-[#f5f2ed]">Open a film&apos;s book</h2>
          <p className="mt-2 text-sm text-[#eadfce]">
            Search by film title — opens the club book or the linked source edition.
          </p>
          <div className="mt-6">
            <MovieSearchPanel initialQuery={initialQuery} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-[#f5f2ed]">Popular films</h2>
          <p className="mt-2 text-sm text-[#eadfce]">
            Tap a film to open its movie book — here on the club or via a connected source.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredWithBooks.map(({ film, display }) => (
              <FeaturedFilmCard key={film.key} film={film} display={display} />
            ))}
          </ul>
        </section>

        <section className="mt-12 border-t border-white/10 pt-10">
          <h2 className="font-serif text-2xl text-[#f5f2ed]">Connected sources</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#eadfce]">
            Movie books that are not on the club shelves are reached through these sites.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CONNECTED_MOVIE_SOURCES.map((source) => (
              <li
                key={source.id}
                className="border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#c9a96e]/40"
              >
                <a href={source.href} target="_blank" rel="noreferrer" className="block">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                    {movieAccessLabel(source.access)}
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-[#f5f2ed]">{source.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#eadfce]">{source.tagline}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-center text-sm text-[#eadfce]">
          <Link href="/#library" className="text-[#c9a96e] hover:underline">
            Back to club book search
          </Link>
        </p>
      </div>
    </main>
  )
}
