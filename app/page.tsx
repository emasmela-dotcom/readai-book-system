'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { HomeBrowseHub } from '@/components/home-browse-hub'
import { ReadingModeTip } from '@/components/reading-mode-tip'
import { BookCoverImage } from '@/components/book-cover-image'
import { BOOK_COVER_THUMB_BOX_CLASS, BOOK_COVER_THUMB_CLASS } from '@/lib/book-cover-size'
import { CONNECTED_SOURCES, sourceAccessLabel } from '@/lib/book-sources'
import { MAGAZINE_SOURCES, magazineAccessLabel } from '@/lib/magazine-sources'
import { categoryLabel } from '@/lib/inventory-labels'
import { hasRealCoverUrl } from '@/lib/book-covers'

interface ShelfBook {
  id: number
  title: string
  author: string
  gutenbergId?: number
  coverUrl?: string
}

interface StoreSection {
  id: string
  title: string
  tagline: string
  category: string
  subcategory: string | null
  count: number
  books: ShelfBook[]
}

interface StorefrontData {
  totalBooks: number
  fullBooks: number
  booksToday: number
  departments: { category: string; count: number }[]
  sections: StoreSection[]
}

interface SearchResultBook {
  id: number
  title: string
  author: string | null
  gutenberg_id?: number | null
  cover_url?: string | null
}

interface BrowseHubBook {
  id: number
  title: string
  author: string
  genreTitle?: string
  gutenbergId?: number
  coverUrl?: string
}

const FEATURED_AISLES = [
  'horror',
  'mystery',
  'romance',
  'sci-fi',
  'fantasy',
  'literary',
  'biography',
  'history',
  'business',
  'young-adult',
]

export default function ReadAIHome() {
  const [store, setStore] = useState<StorefrontData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultBook[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/storefront', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/book-cover-map', { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([data, coverData]) => {
        const covers: Record<number, string> =
          coverData?.success && coverData.covers ? coverData.covers : {}

        if (data.success) {
          setStore({
            totalBooks: data.totalBooks,
            fullBooks: data.fullBooks ?? 0,
            booksToday: data.booksToday,
            departments: data.departments,
            sections: data.sections.map((section: StoreSection) => ({
              ...section,
              books: section.books.map((book) => ({
                ...book,
                coverUrl: book.coverUrl ?? covers[book.id],
              })),
            })),
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const featuredSections = useMemo(() => {
    if (!store) return []
    const byId = new Map(store.sections.map((s) => [s.id, s]))
    return FEATURED_AISLES.map((id) => byId.get(id))
      .filter((s): s is StoreSection => !!s && s.count > 0)
  }, [store])

  const activeGenres = useMemo(
    () => store?.sections.filter((s) => s.count > 0).length ?? 0,
    [store],
  )

  const topRooms = useMemo(() => {
    if (!store) return []
    return [...store.sections]
      .filter((section) => section.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((section) => ({
        id: section.id,
        title: section.title,
        tagline: section.tagline,
      }))
  }, [store])

  const browseHubBooks = useMemo<BrowseHubBook[]>(() => {
    if (!store) return []

    const uniqueBooks = new Map<number, BrowseHubBook>()

    for (const section of store.sections) {
      for (const book of section.books) {
        if (uniqueBooks.has(book.id)) continue

        uniqueBooks.set(book.id, {
          id: book.id,
          title: book.title,
          author: book.author,
          genreTitle: section.title,
          gutenbergId: book.gutenbergId,
          coverUrl: book.coverUrl,
        })
      }
    }

    return Array.from(uniqueBooks.values())
  }, [store])

  const booksWithCovers = useMemo(
    () => browseHubBooks.filter((book) => Boolean(book.coverUrl?.trim())),
    [browseHubBooks],
  )

  const monthlyPick = useMemo(() => {
    const pride = booksWithCovers.find((book) =>
      book.title.toLowerCase().includes('pride and prejudice'),
    )
    return pride ?? booksWithCovers[0] ?? null
  }, [booksWithCovers])

  const shelfBooks = useMemo(() => booksWithCovers.slice(0, 6), [booksWithCovers])

  const recentBooks = useMemo(() => {
    return [...booksWithCovers].sort((a, b) => b.id - a.id).slice(0, 6)
  }, [booksWithCovers])

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = searchQuery.trim()

    if (!term) {
      setActiveSearch('')
      setSearchResults([])
      setSearchError(null)
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    try {
      const params = new URLSearchParams({
        search: term,
        limit: '8',
      })
      const response = await fetch(`/api/books?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Search failed')
      }

      setActiveSearch(term)
      setSearchResults(
        (data.books ?? []).map(
          (book: {
            id: number
            title: string
            author: string | null
            gutenberg_id?: number | null
            cover_url?: string | null
          }) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            gutenberg_id: book.gutenberg_id ?? null,
            cover_url: book.cover_url ?? null,
          }),
        ),
      )
    } catch (error) {
      console.error('Search error:', error)
      setActiveSearch(term)
      setSearchResults([])
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
            <a href="#genres" className="hover:text-[#c9a96e]">
              Genres
            </a>
            <a href="#library" className="hover:text-[#c9a96e]">
              Library
            </a>
            <a href="#magazines" className="hover:text-[#c9a96e]">
              Magazine
            </a>
            <a href="#sources" className="hover:text-[#c9a96e]">
              Sources
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b border-white/10 px-5 py-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <label htmlFor="club-search" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
              Search the club
            </label>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                id="club-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Exact title or author words (e.g. Frozen River)"
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

          <ReadingModeTip className="mt-4" />

          {activeSearch || searchError ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              {searchError ? (
                <p className="text-sm text-[#f3d7a4]">{searchError}</p>
              ) : searchResults.length === 0 ? (
                <div className="text-sm text-[#e8e4df]/75">
                  <p>
                    No match in the club library for{' '}
                    <span className="text-[#f5f2ed]">&ldquo;{activeSearch}&rdquo;</span>.
                  </p>
                  <p className="mt-2 text-[#e8e4df]/65">
                    ReadAI search covers public-domain books already on the shelves. Modern titles like
                    recent bestsellers may not be ingested yet — try the Sources section for link-outs.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#e8e4df]/75">
                    Results for <span className="text-[#f5f2ed]">&ldquo;{activeSearch}&rdquo;</span>
                  </p>
                  <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                    {searchResults.map((book) => (
                      <li
                        key={book.id}
                        className="flex gap-4 py-3 sm:items-center sm:justify-between"
                      >
                        {hasRealCoverUrl(book.cover_url) ? (
                          <Link href={`/books/${book.id}`} className="shrink-0">
                            <div className={BOOK_COVER_THUMB_BOX_CLASS}>
                              <BookCoverImage
                                bookId={book.id}
                                gutenbergId={book.gutenberg_id ?? undefined}
                                title={book.title}
                                coverUrl={book.cover_url ?? undefined}
                                className={BOOK_COVER_THUMB_CLASS}
                              />
                            </div>
                          </Link>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/books/${book.id}/read`}
                            className="font-serif text-lg text-[#f5f2ed] transition hover:text-[#c9a96e]"
                          >
                            {book.title}
                          </Link>
                          <p className="text-sm text-[#e8e4df]/72">{book.author || 'Unknown author'}</p>
                        </div>
                        <Link
                          href={`/books/${book.id}/read`}
                          className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline"
                        >
                          Open book
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <HomeBrowseHub
        rooms={topRooms}
        books={shelfBooks}
        recentBooks={recentBooks}
        monthlyPick={monthlyPick}
        stats={{
          fullBooks: store?.fullBooks ?? 0,
          booksToday: store?.booksToday ?? 0,
          activeRooms: activeGenres,
        }}
        loading={loading}
      />

      <section id="genres" className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Reading rooms</p>
          <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Move between rooms</h2>
          <p className="mt-2 max-w-xl text-sm text-[#e8e4df]/70">
            Every room opens into full books. Drop into a genre, scan the shelf, and start.
          </p>

          {loading ? (
            <p className="mt-8 text-sm text-[#e8e4df]/70">Loading genres…</p>
          ) : featuredSections.length === 0 ? (
            <p className="mt-8 text-sm text-[#e8e4df]/70">
              Rooms are filling as books are added to the club library.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
              {featuredSections.map((section) => (
                <li key={section.id} id={`aisle-${section.id}`} className="py-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl text-[#e8e4df]">
                        <Link
                          href={`/genres/${section.id}`}
                          className="transition hover:text-[#c9a96e]"
                        >
                          {section.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm italic text-[#e8e4df]/70">{section.tagline}</p>
                    </div>
                    <Link
                      href={`/genres/${section.id}`}
                      className="text-xs uppercase tracking-wider text-[#e8e4df]/70 transition hover:text-[#c9a96e]"
                    >
                      on the shelf →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        id="library"
        className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-8 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Club library</p>
          <h2 className="font-serif text-2xl text-[#e8e4df]">Shelves across the club</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#e8e4df]/70">
            The library is organized by broad shelves so readers can move from fiction into history,
            biography, science, and beyond without losing the club feel.
          </p>
          {store && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {store.departments.map((d) => (
                <li
                  key={d.category}
                  className="border border-white/10 p-4 text-center transition hover:border-[#c9a96e]/50"
                >
                  <p className="font-serif text-base text-[#e8e4df]">{categoryLabel(d.category)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#e8e4df]/70">
                    books
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="magazines" className="border-t border-white/10 bg-white/[0.02] px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Magazine</p>
          <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Magazine picks for variety</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#e8e4df]/70">
            Add shorter reads and critical writing alongside books, so the club feels fresh even
            between long novels.
          </p>

          <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MAGAZINE_SOURCES.map((source) => (
              <li
                key={source.id}
                className="border border-white/10 bg-[#171311] p-5 transition hover:border-[#c9a96e]/40"
              >
                <a href={source.href} target="_blank" rel="noreferrer" className="block">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                    {magazineAccessLabel(source.access)}
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-[#f5f2ed]">{source.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#e8e4df]/75">{source.tagline}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="sources" className="border-t border-white/10 px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Sources</p>
          <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Connected legal sources</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#e8e4df]/70">
            ReadAI currently connects readers to legal reading, search, and borrow sources across
            the web. We surface the club edition first, then point readers to trusted outside
            sources where it makes sense.
          </p>

          <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CONNECTED_SOURCES.map((source) => (
              <li
                key={source.id}
                className="border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#c9a96e]/40"
              >
                <a href={source.href} target="_blank" rel="noreferrer" className="block">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                    {sourceAccessLabel(source.access)}
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-[#f5f2ed]">{source.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#e8e4df]/75">{source.tagline}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-6 text-center md:px-8">
        <p className="font-serif text-lg text-[#e8e4df]/70">ReadAI Book Club</p>
        <p className="mt-1 text-xs text-[#e8e4df]/70">
          Your private reading club
        </p>
      </footer>
    </div>
  )
}
