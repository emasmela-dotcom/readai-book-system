import Link from 'next/link'
import { FeaturedFilmCard } from '@/components/featured-film-card'
import { MovieSearchPanel } from '@/components/movie-search-panel'
import { resolveMovieBook } from '@/lib/movie-book-covers'
import { FEATURED_FILMS } from '@/lib/movie-sources'

export const metadata = {
  title: 'Movies & Movie Books | ReadAI',
  description: 'Open movie tie-in books on the ReadAI club shelves.',
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
      book: await resolveMovieBook(film.title, film.clubBookTitle),
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
            Each film opens its book on the club shelves when we carry it — full text, cover to cover.
          </p>
        </header>

        <section className="mt-10 border border-white/10 bg-[#16110d] p-5 md:p-8">
          <h2 className="font-serif text-2xl text-[#f5f2ed]">Open a film&apos;s book</h2>
          <p className="mt-2 text-sm text-[#eadfce]">
            Search by film title — opens the club book when it is on the shelves.
          </p>
          <div className="mt-6">
            <MovieSearchPanel initialQuery={initialQuery} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-[#f5f2ed]">Popular films</h2>
          <p className="mt-2 text-sm text-[#eadfce]">
            Tap a film to open its book when it is on the club shelves.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredWithBooks.map(({ film, book }) => (
              <FeaturedFilmCard key={film.key} film={film} book={book} />
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
