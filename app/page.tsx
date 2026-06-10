'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HomeBrowseHub } from '@/components/home-browse-hub'
import { ConnectedSourcesBlock } from '@/components/connected-sources-block'
import { MagazineSourcesBlock } from '@/components/magazine-sources-block'
import { GenreDirectoryGrid } from '@/components/genre-directory-grid'
import { sourceAccessLabel } from '@/lib/book-sources'
import { FEATURED_FILMS } from '@/lib/movie-sources'

const FEATURED_FILM_COUNT = FEATURED_FILMS.length

interface SourceSearchMatch {
  title: string
  author: string | null
  coverUrl: string | null
  gutenbergId: number
  readHref: string
  sourceLabel: string
}

interface SourceSearchLink {
  id: string
  label: string
  tagline: string
  href: string
  access: 'read' | 'catalog' | 'search' | 'borrow'
}

interface SourceSearchFilm {
  title: string
  bookTitle: string
  readHref: string | null
}

interface SourceSearchState {
  match: SourceSearchMatch | null
  sources: SourceSearchLink[]
  film: SourceSearchFilm | null
  unavailableReason: 'copyright' | 'not_found' | null
  unavailableNote: string | null
  catalogHint: { title: string; author: string | null; firstPublishYear: number | null; verifyHref: string } | null
}

interface GenreListingSection {
  id: string
  title: string
  tagline: string
  count: number
}

const SEARCH_MATCH_CARD_CLASS =
  'flex items-start gap-4 border border-white/15 bg-[#171311] p-4'

export default function ReadAIHome() {
  const router = useRouter()
  const [genreListings, setGenreListings] = useState<GenreListingSection[]>([])
  const [genresLoading, setGenresLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [sourceSearch, setSourceSearch] = useState<SourceSearchState | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (window.location.hash === '#sources') {
      router.replace('/sources')
    }
  }, [router])

  useEffect(() => {
    fetch('/api/genre-listings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.sections)) {
          setGenreListings(data.sections)
        }
      })
      .catch(() => {})
      .finally(() => setGenresLoading(false))
  }, [])

  const genrePickerSections = useMemo(() => {
    return [...genreListings].sort((a, b) => a.title.localeCompare(b.title))
  }, [genreListings])

  const topRooms = useMemo(() => {
    return [...genreListings]
      .filter((section) => section.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((section) => ({
        id: section.id,
        title: section.title,
        tagline: section.tagline,
      }))
  }, [genreListings])

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = searchQuery.trim()

    if (!term) {
      setActiveSearch('')
      setSourceSearch(null)
      setSearchError(null)
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    try {
      const params = new URLSearchParams({ q: term })
      const response = await fetch(`/api/club-search?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Search failed')
      }

      setActiveSearch(term)
      setSourceSearch({
        match: data.match ?? null,
        sources: data.sources ?? [],
        film: data.film ?? null,
        unavailableReason: data.unavailableReason ?? null,
        unavailableNote: data.unavailableNote ?? null,
        catalogHint: data.catalogHint ?? null,
      })
    } catch (error) {
      console.error('Search error:', error)
      setActiveSearch(term)
      setSourceSearch(null)
      setSearchError('Search is unavailable right now. Please try again later.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#120d0b]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120d0b]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
          <a href="#" className="font-serif text-xl tracking-wide text-[#e8e4df] md:text-2xl">
            ReadAI
          </a>
          <nav className="hidden gap-6 text-[11px] uppercase tracking-[0.2em] text-[#e8e4df]/70 md:flex">
            <a href="#browse" className="hover:text-[#c9a96e]">
              Browse
            </a>
            <Link href="/genres" className="hover:text-[#c9a96e]">
              Genres
            </Link>
            <a href="#library" className="hover:text-[#c9a96e]">
              Sources
            </a>
            <Link href="/saved" className="hover:text-[#c9a96e]">
              Saved
            </Link>
            <Link href="/movies" className="hover:text-[#c9a96e]">
              Movies
            </Link>
            <a href="#magazines" className="hover:text-[#c9a96e]">
              Magazine
            </a>
            <Link href="/genres/cooking" className="hover:text-[#c9a96e]">
              Cookbooks
            </Link>
            <Link href="/sources" className="hover:text-[#c9a96e]">
              All sources
            </Link>
            <Link href="/sign-up" className="hover:text-[#c9a96e]">
              Start free trial
            </Link>
            <Link href="/sign-in" className="hover:text-[#c9a96e]">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section id="search" className="border-b border-white/10 px-5 py-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <label htmlFor="source-search" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
              Search readable books
            </label>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                id="source-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Public-domain title or author (e.g. Frankenstein, Jane Austen)"
                className="w-full border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] outline-none placeholder:text-[#e8e4df]/45 focus:border-[#c9a96e]"
              />
              <button
                type="submit"
                className="border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84]"
              >
                {searchLoading ? 'Searching' : 'Search'}
              </button>
            </div>
          </form>

          {activeSearch || searchError ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              {searchError ? (
                <p className="text-sm text-[#f3d7a4]">{searchError}</p>
              ) : sourceSearch ? (
                <div className="space-y-6">
                  <p className="text-sm text-[#e8e4df]/75">
                    {sourceSearch.match ? (
                      <>
                        Readable book for{' '}
                        <span className="text-[#f5f2ed]">&ldquo;{activeSearch}&rdquo;</span>
                      </>
                    ) : (
                      <>
                        No readable book for{' '}
                        <span className="text-[#f5f2ed]">&ldquo;{activeSearch}&rdquo;</span>
                      </>
                    )}
                  </p>

                  {sourceSearch.match ? (
                    (() => {
                      const match = sourceSearch.match
                      const isInAppRead = match.readHref.startsWith('/books/')
                      const cardInner = (
                        <>
                          {match.coverUrl ? (
                            <img
                              src={match.coverUrl}
                              alt=""
                              className="h-28 w-20 shrink-0 border border-white/15 bg-[#18120e] object-cover"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                              Best match · {match.sourceLabel}
                            </p>
                            <p className="mt-2 font-serif text-lg text-[#f5f2ed]">{match.title}</p>
                            {match.author ? (
                              <p className="mt-1 text-sm text-[#eadfce]">{match.author}</p>
                            ) : null}
                            <p className="mt-3 text-[10px] uppercase tracking-wider text-[#c9a96e]">
                              Read full book →
                            </p>
                          </div>
                        </>
                      )

                      return isInAppRead ? (
                        <Link
                          href={match.readHref}
                          className={`${SEARCH_MATCH_CARD_CLASS} transition hover:border-[#c9a96e]/45`}
                        >
                          {cardInner}
                        </Link>
                      ) : (
                        <a
                          href={match.readHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${SEARCH_MATCH_CARD_CLASS} transition hover:border-[#c9a96e]/45`}
                        >
                          {cardInner}
                        </a>
                      )
                    })()
                  ) : sourceSearch.unavailableReason === 'copyright' ? (
                    <div className="border border-[#c9a96e]/35 bg-[#1a1410] p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                        Still under copyright
                      </p>
                      {sourceSearch.catalogHint ? (
                        <>
                          <p className="mt-2 font-serif text-lg text-[#f5f2ed]">
                            {sourceSearch.catalogHint.title}
                            {sourceSearch.catalogHint.author ? (
                              <span className="text-[#eadfce]"> · {sourceSearch.catalogHint.author}</span>
                            ) : null}
                            {sourceSearch.catalogHint.firstPublishYear ? (
                              <span className="text-[#eadfce]">
                                {' '}
                                · {sourceSearch.catalogHint.firstPublishYear}
                              </span>
                            ) : null}
                          </p>
                        </>
                      ) : null}
                      <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
                        {sourceSearch.unavailableNote}
                      </p>
                    </div>
                  ) : sourceSearch.catalogHint ? (
                    <div className="border border-white/15 bg-[#171311] p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                        No free full read here
                      </p>
                      <p className="mt-2 font-serif text-lg text-[#f5f2ed]">
                        {sourceSearch.catalogHint.title}
                        {sourceSearch.catalogHint.author ? (
                          <span className="text-[#eadfce]"> · {sourceSearch.catalogHint.author}</span>
                        ) : null}
                        {sourceSearch.catalogHint.firstPublishYear ? (
                          <span className="text-[#eadfce]">
                            {' '}
                            · {sourceSearch.catalogHint.firstPublishYear}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
                        {sourceSearch.unavailableNote}
                      </p>
                    </div>
                  ) : sourceSearch.unavailableNote ? (
                    <p className="text-sm leading-relaxed text-[#eadfce]">{sourceSearch.unavailableNote}</p>
                  ) : (
                    <p className="text-sm text-[#eadfce]">
                      No readable public-domain edition found for this search.
                    </p>
                  )}

                  {sourceSearch.film?.readHref ? (
                    <div className="block border border-white/15 bg-[#171311] p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Film book</p>
                      <p className="mt-2 font-serif text-lg text-[#f5f2ed]">
                        {sourceSearch.film.title}
                        <span className="text-[#eadfce]"> — {sourceSearch.film.bookTitle}</span>
                      </p>
                      <p className="mt-3">
                        <a
                          href={sourceSearch.film.readHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] uppercase tracking-wider text-[#c9a96e] hover:underline"
                        >
                          Read full book →
                        </a>
                      </p>
                    </div>
                  ) : null}

                  {sourceSearch.match && sourceSearch.sources.length > 0 ? (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
                        Other readable sources
                      </p>
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                        {sourceSearch.sources.map((source) => (
                          <li
                            key={source.id}
                            className="border border-white/15 bg-white/[0.02] p-4 transition hover:border-[#c9a96e]/50"
                          >
                            <a href={source.href} target="_blank" rel="noreferrer" className="block">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                                {sourceAccessLabel(source.access)}
                              </p>
                              <p className="mt-2 font-serif text-lg text-[#f5f2ed]">{source.label}</p>
                              <p className="mt-2 text-sm leading-relaxed text-[#eadfce]/85">
                                {source.tagline}
                              </p>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <HomeBrowseHub rooms={topRooms} genresLoading={genresLoading} />

      <section id="genres" className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Reading rooms</p>
          <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Move between rooms</h2>
          <p className="mt-2 max-w-xl text-sm text-[#e8e4df]/70">
            Every room browses connected sources — Open Library, Gutenberg, and more. Pick a genre below,
            or open the full room list.
          </p>

          <p className="mt-4">
            <Link
              href="/genres"
              className="text-xs uppercase tracking-wider text-[#c9a96e] hover:underline"
            >
              View all rooms →
            </Link>
          </p>

          {genresLoading ? (
            <p className="mt-8 text-sm text-[#e8e4df]/70">Loading genres…</p>
          ) : (
            <GenreDirectoryGrid
              sections={genrePickerSections.map((section) => ({
                id: section.id,
                title: section.title,
                tagline: section.tagline,
                count: section.count,
              }))}
            />
          )}
        </div>
      </section>

      <section
        id="library"
        className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-8 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <ConnectedSourcesBlock />
        </div>
      </section>

      <section id="movies" className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Film room</p>
          <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Movies &amp; movie books</h2>
          <p className="mt-2 max-w-xl text-sm text-[#e8e4df]/70">
            Browse {FEATURED_FILM_COUNT} film-to-book pairings — search a title and follow connected
            source links for its book.
          </p>
          <p className="mt-4">
            <Link href="/movies" className="text-xs uppercase tracking-wider text-[#c9a96e] hover:underline">
              Open Movies section →
            </Link>
          </p>
        </div>
      </section>

      <section id="magazines" className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <MagazineSourcesBlock />
        </div>
      </section>

      <section id="cookbooks" className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Kitchen reading</p>
          <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Cookbooks &amp; recipes</h2>
          <p className="mt-2 max-w-xl text-sm text-[#e8e4df]/70">
            Browse cookery titles via connected sources in the cooking room.
          </p>
          <p className="mt-4">
            <Link
              href="/genres/cooking"
              className="text-xs uppercase tracking-wider text-[#c9a96e] hover:underline"
            >
              Open cooking room →
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-6 text-center md:px-8">
        <p className="font-serif text-lg text-[#e8e4df]/70">ReadAI Book Club</p>
        <p className="mt-1 text-xs text-[#e8e4df]/70">Your private reading club</p>
      </footer>
    </div>
  )
}
