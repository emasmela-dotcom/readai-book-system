import Link from 'next/link'
import { GenreDirectoryGrid } from '@/components/genre-directory-grid'
import { fetchGenreAisleListings, totalTitlesViaSources } from '@/lib/genre-aisle-counts'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Genres | ReadAI',
  description: 'Pick a reading room and browse titles via connected sources.',
}

export default async function GenresPage() {
  const listings = await fetchGenreAisleListings()
  const sorted = [...listings].sort((a, b) => a.title.localeCompare(b.title))
  const totalTitles = totalTitlesViaSources(listings)

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Club home
          </Link>
          <span className="text-[#d4cdc4]">/</span>
          <span className="text-[#f5f2ed]">Genres</span>
        </nav>

        <header className="border-b border-white/10 pb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Reading rooms</p>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">Pick a room</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#e8e4df]/80">
            Every room browses connected sources — Open Library, Gutenberg, and more. Pick a genre and
            follow the source links for each title.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#c9a96e]">
            {totalTitles.toLocaleString()} titles via sources across {listings.length} rooms
          </p>
        </header>

        <GenreDirectoryGrid sections={sorted} />
      </div>
    </main>
  )
}
