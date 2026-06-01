'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HourlyRotatingCovers } from '@/components/hourly-rotating-covers'
import { BookCoverCard } from '@/components/book-cover-card'
import { BOOK_COVER_THUMB_BOX_CLASS } from '@/lib/book-cover-size'

const GENRE_ROOMS = ['horror', 'mystery', 'romance', 'fantasy', 'literary', 'sci-fi'] as const
import { SAVED_BOOKS_STORAGE_KEY } from '@/lib/saved-books-storage'
const LAST_READ_KEY = 'readai_last_read'
const COVER_TONES = [
  'from-[#6d432f] to-[#2a1711]',
  'from-[#374730] to-[#141b11]',
  'from-[#5a3040] to-[#211017]',
  'from-[#5d4728] to-[#20160d]',
  'from-[#284350] to-[#101920]',
  'from-[#5c3526] to-[#24130f]',
] as const

interface BrowseBook {
  id: number
  title: string
  author: string
  genreTitle?: string
  gutenbergId?: number
  coverUrl?: string
}

interface LastReadState {
  href: string
  title: string
  author: string
  progressLabel: string
}

interface HomeBrowseHubProps {
  rooms: {
    id: string
    title: string
    tagline: string
  }[]
  books: BrowseBook[]
  recentBooks: BrowseBook[]
  monthlyPick: BrowseBook | null
  loading?: boolean
}

function toneForBook(bookId: number) {
  return COVER_TONES[bookId % COVER_TONES.length]
}

function BookObject({ book }: { book: BrowseBook }) {
  if (!book.coverUrl?.trim()) return null

  return (
    <BookCoverCard
      bookId={book.id}
      gutenbergId={book.gutenbergId}
      coverUrl={book.coverUrl}
      title={book.title}
      author={book.author}
      genreTitle={book.genreTitle}
      toneClass={toneForBook(book.id)}
    />
  )
}

function PathCard({
  eyebrow,
  title,
  body,
  href,
  cta,
}: {
  eyebrow: string
  title: string
  body: string
  href?: string
  cta: string
}) {
  const content = (
    <>
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">{eyebrow}</p>
      <h3 className="mt-3 font-serif text-xl text-[#f5eee6]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#e8ddcd]/76">{body}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#d8b67c]">{cta}</p>
    </>
  )

  if (!href) {
    return <div className="border border-white/10 bg-[#17110d] p-5">{content}</div>
  }

  return (
    <Link
      href={href}
      className="block border border-white/10 bg-[#17110d] p-5 transition hover:border-[#d8b67c]/45 hover:bg-[#1d1611]"
    >
      {content}
    </Link>
  )
}

function ShelfRail({
  eyebrow,
  title,
  body,
  books,
}: {
  eyebrow: string
  title: string
  body: string
  books: BrowseBook[]
}) {
  return (
    <section className="border border-white/10 bg-[#16110d] p-5 md:p-6">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-2xl text-[#f5eee6]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#e8ddcd]/74">{body}</p>

      {books.length === 0 ? (
        <p className="mt-6 text-sm text-[#e8ddcd]/66">The shelves are filling as books arrive in the club.</p>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {books.map((book) => (
            <BookObject key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  )
}

export function HomeBrowseHub({
  rooms,
  books,
  recentBooks,
  monthlyPick,
  loading,
}: HomeBrowseHubProps) {
  const [savedCount, setSavedCount] = useState(0)
  const [lastRead, setLastRead] = useState<LastReadState | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_BOOKS_STORAGE_KEY) ?? '[]')
      setSavedCount(Array.isArray(saved) ? saved.length : 0)
    } catch {
      setSavedCount(0)
    }

    try {
      const stored = localStorage.getItem(LAST_READ_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored) as LastReadState
      if (parsed?.href && parsed?.title) {
        setLastRead(parsed)
      }
    } catch {
      setLastRead(null)
    }

    function refreshSavedCount() {
      try {
        const saved = JSON.parse(localStorage.getItem(SAVED_BOOKS_STORAGE_KEY) ?? '[]')
        setSavedCount(Array.isArray(saved) ? saved.length : 0)
      } catch {
        setSavedCount(0)
      }
    }

    window.addEventListener('readai-saved-books-changed', refreshSavedCount)
    return () => window.removeEventListener('readai-saved-books-changed', refreshSavedCount)
  }, [])

  return (
    <section id="browse" className="border-b border-white/10 bg-[#120d0b] px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden border border-white/10 bg-[#17110d] px-6 py-8 md:px-8 md:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(248,240,230,0.9) 0.8px, transparent 0.8px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_300px] xl:items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#d8b67c]">Private reading club</p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-[#f6efe7] md:text-5xl">
                Every book. Every reader. Every story.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#f5eee6]">
                Join a community of readers who live for their next great read.
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                {GENRE_ROOMS.map((id) => (
                  <li key={id}>
                    <Link
                      href={`/genres/${id}`}
                      className="inline-block border border-white/15 px-3 py-1 text-[11px] uppercase tracking-wider text-[#f0e7db] transition hover:border-[#d8b67c]/60 hover:text-[#d8b67c]"
                    >
                      {id.replace('-', ' ')}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/movies"
                    className="inline-block border border-white/15 px-3 py-1 text-[11px] uppercase tracking-wider text-[#f0e7db] transition hover:border-[#d8b67c]/60 hover:text-[#d8b67c]"
                  >
                    movies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#genres"
                    className="inline-block px-3 py-1 text-[11px] uppercase tracking-wider text-[#d8b67c] hover:underline"
                  >
                    All rooms →
                  </Link>
                </li>
              </ul>
            </div>

            <aside className="border border-white/10 bg-[#140f0c] p-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">This month&apos;s read</p>
              {monthlyPick ? (
                <div className="mt-5">
                  <BookObject book={monthlyPick} />
                  <p className="mt-4 text-sm leading-relaxed text-[#eadfce]/74">
                    Put one book at the center of the homepage and the whole site starts to feel
                    like a club again.
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#eadfce]/70">
                  The club pick appears here once the shelves load.
                </p>
              )}
            </aside>
          </div>
        </div>

        <HourlyRotatingCovers />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <PathCard
            eyebrow="Continue reading"
            title={lastRead ? lastRead.title : 'Return to your place'}
            body={
              lastRead
                ? `${lastRead.author} · ${lastRead.progressLabel}`
                : 'Open any full book and the homepage can bring you back to your last reading session.'
            }
            href={lastRead?.href}
            cta={lastRead ? 'Resume reading' : 'Waiting for your first open book'}
          />
          <PathCard
            eyebrow="Saved books"
            title={savedCount > 0 ? `${savedCount} saved on this device` : 'Build a personal shelf'}
            body={
              savedCount > 0
                ? 'Open your shelf to see every title you saved and jump back into reading.'
                : 'Save your place from any book while reading and your shelf remembers where you stopped.'
            }
            href="/saved"
            cta={savedCount > 0 ? 'Open saved shelf →' : 'View saved shelf →'}
          />
          <PathCard
            eyebrow="Browse by room"
            title="Walk the club"
            body="Move between horror, mystery, romance, fantasy, literary fiction, and every room beyond."
            href="#genres"
            cta="Enter the rooms"
          />
        </div>

        <div className="mt-4">
          <PathCard
            eyebrow="Film room"
            title="Movies & movie books"
            body="Open a film's movie book on the club shelves or via connected sources on the web."
            href="/movies"
            cta="Enter Movies section"
          />
        </div>

        <div className="mt-8">
          <ShelfRail
            eyebrow="Currently open in the club"
            title="Books you can feel as objects"
            body="A book club homepage should show books as things to pick up, not just text labels to scan."
            books={books}
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ShelfRail
            eyebrow="Fresh arrivals"
            title="Recently added to the club"
            body="New arrivals make the shelves feel alive and worth checking again."
            books={recentBooks}
          />

          <aside className="border border-white/10 bg-[#16110d] p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">Popular rooms</p>
                <h2 className="mt-2 font-serif text-2xl text-[#f5eee6]">Browse by room</h2>
              </div>
              <Link href="#genres" className="text-xs uppercase tracking-wider text-[#d8b67c] hover:underline">
                All rooms
              </Link>
            </div>
            {loading ? (
              <p className="mt-5 text-sm text-[#eadfce]/68">Loading the reading rooms…</p>
            ) : rooms.length === 0 ? (
              <p className="mt-5 text-sm text-[#eadfce]/68">Rooms are filling as new books land in the club.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {rooms.slice(0, 5).map((room) => (
                  <li key={room.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                    <Link
                      href={`/genres/${room.id}`}
                      className="font-serif text-lg text-[#f5eee6] transition hover:text-[#d8b67c]"
                    >
                      {room.title}
                    </Link>
                    <p className="mt-1 text-sm text-[#eadfce]/68">{room.tagline}</p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
