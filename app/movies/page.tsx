import Link from 'next/link'
import { FeaturedFilmCard } from '@/components/featured-film-card'
import { MovieSearchPanel } from '@/components/movie-search-panel'
import { resolveFeaturedFilmListing } from '@/lib/movie-book-covers'
import { FEATURED_FILMS } from '@/lib/movie-sources'

export const metadata = {
  title: 'Movies & Movie Books | ReadAI',
  description: 'Find movie tie-in books via connected sources.',
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { q?: string | string[] } | Promise<{ q?: string | string[] }>
}) {
  const resolvedParams = await Promise.resolve(searchParams)
  const rawQ = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q
  const initialQuery = rawQ?.trim() ?? ''

  const featuredWithBooks = FEATURED_FILMS.map((film) => ({
    film,
    display: resolveFeaturedFilmListing(film),
  }))

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Home
          </Link>
          <span className="text-[#d4cdc4]">/</span>
          <span className="text-[#f5f2ed]">Movies</span>
        </nav>

        <header className="border-b border-white/10 pb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Film room</p>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">Movies &amp; movie books</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#f5f2ed]">
            Movie books link out to connected sources — Open Library, Gutenberg, Internet Archive, and
            more. ReadAI does not host a private movie-book catalog.
          </p>
        </header>

        <section className="mt-10 border border-white/10 bg-[#16110d] p-5 md:p-8">
          <h2 className="font-serif text-2xl text-[#f5f2ed]">Search a film&apos;s book</h2>
          <p className="mt-2 text-sm text-[#eadfce]">
            Search by film title to see connected source links for the related book.
          </p>
          <div className="mt-6">
            <MovieSearchPanel initialQuery={initialQuery} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-[#f5f2ed]">
            Popular films <span className="text-[#c9a96e]">({FEATURED_FILMS.length})</span>
          </h2>
          <p className="mt-2 text-sm text-[#eadfce]">
            Each card shows source links for that film&apos;s book. Covers load as you scroll.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredWithBooks.map(({ film, display }, index) => (
              <FeaturedFilmCard
                key={film.key}
                film={film}
                display={display}
                eagerCover={index < 12}
              />
            ))}
          </ul>
        </section>

        <p className="mt-12 text-center text-sm text-[#eadfce]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Back to source search
          </Link>
        </p>
      </div>
    </main>
  )
}
