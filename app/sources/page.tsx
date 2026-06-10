import Link from 'next/link'
import { FullSourcesDirectory } from '@/components/full-sources-directory'
import { CONNECTED_SOURCES } from '@/lib/book-sources'
import { COOKBOOK_SOURCES } from '@/lib/cookbook-sources'
import { MAGAZINE_SOURCES } from '@/lib/magazine-sources'
import { CONNECTED_MOVIE_SOURCES } from '@/lib/movie-sources'

const REFERENCE_SECTION_COUNT = 4
const REFERENCE_LINK_COUNT =
  CONNECTED_SOURCES.length + CONNECTED_MOVIE_SOURCES.length + COOKBOOK_SOURCES.length + MAGAZINE_SOURCES.length

export const metadata = {
  title: 'Sources Reference | ReadAI',
  description:
    'Master reference for every legal reading, library, film, cookbook, and magazine source connected to ReadAI Book Club.',
}

export default function SourcesPage() {
  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Club home
          </Link>
          <span className="text-[#d4cdc4]">/</span>
          <span className="text-[#f5f2ed]">Sources</span>
        </nav>

        <header className="border-b border-white/10 pb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Sources reference</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed] md:text-4xl">
            Legal reading &amp; discovery
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
            This page is the master reference for every connected site ReadAI links to — public-domain
            readers, library borrow apps, archives, film and cookbook hubs, and magazines. Open a book on
            the club for title-specific search links; use this page to browse all
            providers in one place.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#c9a96e]">
            {REFERENCE_SECTION_COUNT} sections · {REFERENCE_LINK_COUNT} links
          </p>
        </header>

        <div className="mt-10">
          <FullSourcesDirectory />
        </div>
      </div>
    </main>
  )
}
