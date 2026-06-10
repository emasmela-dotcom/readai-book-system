'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FilmCoverThumb } from '@/components/film-cover-thumb'
import {
  ensureSavedBooksLoaded,
  readSavedBookEntries,
  SAVED_BOOKS_CHANGED_EVENT,
} from '@/lib/saved-books-storage'
import { FEATURED_FILMS } from '@/lib/movie-sources'

const FEATURED_FILM_COUNT = FEATURED_FILMS.length
const SPOTLIGHT_FILM = FEATURED_FILMS[0]

const GENRE_ROOMS = ['horror', 'mystery', 'romance', 'fantasy', 'literary', 'sci-fi'] as const
const LAST_READ_KEY = 'readai_last_read'

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
  genresLoading?: boolean
}

function PathCard({
  eyebrow,
  title,
  body,
  href,
  cta,
  thumbTitle,
}: {
  eyebrow: string
  title: string
  body: string
  href?: string
  cta: string
  thumbTitle?: string
}) {
  const content = (
    <>
      <div className={thumbTitle ? 'flex items-start gap-4' : undefined}>
        {thumbTitle ? (
          <FilmCoverThumb
            filmTitle={thumbTitle}
            className="h-20 w-14 shrink-0 border border-white/15 bg-[#18120e] object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">{eyebrow}</p>
          <h3 className="mt-3 font-serif text-xl text-[#f5eee6]">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#e8ddcd]/76">{body}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#d8b67c]">{cta}</p>
        </div>
      </div>
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

export function HomeBrowseHub({ rooms, genresLoading }: HomeBrowseHubProps) {
  const [savedCount, setSavedCount] = useState(0)
  const [lastRead, setLastRead] = useState<LastReadState | null>(null)
  const heroLeftRef = useRef<HTMLDivElement>(null)
  const heroAsideRef = useRef<HTMLElement>(null)
  const [heroAsideOverflow, setHeroAsideOverflow] = useState(0)

  useEffect(() => {
    function measureHeroAside() {
      if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1280px)').matches) {
        setHeroAsideOverflow(0)
        return
      }

      const left = heroLeftRef.current
      const aside = heroAsideRef.current
      if (!left || !aside) {
        setHeroAsideOverflow(0)
        return
      }

      setHeroAsideOverflow(Math.max(0, aside.offsetHeight - left.offsetHeight))
    }

    const left = heroLeftRef.current
    const aside = heroAsideRef.current
    if (!left || !aside) {
      measureHeroAside()
      return
    }

    const observer = new ResizeObserver(measureHeroAside)
    observer.observe(left)
    observer.observe(aside)
    window.addEventListener('resize', measureHeroAside)
    measureHeroAside()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measureHeroAside)
    }
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAST_READ_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as LastReadState
        if (parsed?.href && parsed?.title) {
          setLastRead(parsed)
        }
      }
    } catch {
      setLastRead(null)
    }

    function refreshSavedCount() {
      setSavedCount(readSavedBookEntries().length)
    }

    ensureSavedBooksLoaded().then(refreshSavedCount)
    window.addEventListener(SAVED_BOOKS_CHANGED_EVENT, refreshSavedCount)
    return () => window.removeEventListener(SAVED_BOOKS_CHANGED_EVENT, refreshSavedCount)
  }, [])

  return (
    <section id="browse" className="border-b border-white/10 bg-[#120d0b] px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative border border-white/10 bg-[#17110d] px-6 py-8 md:px-8 md:py-8"
          style={
            heroAsideOverflow > 0
              ? { paddingBottom: `calc(2rem + ${heroAsideOverflow}px)` }
              : undefined
          }
        >
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(248,240,230,0.9) 0.8px, transparent 0.8px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div className="relative">
            <div ref={heroLeftRef} className="xl:pr-[332px]">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#d8b67c]">Private reading club</p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-[#f6efe7] md:text-5xl">
                Every book. Every reader. Every story.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#f5eee6]">
                Join a community of readers who live for their next great read.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
                14-day free trial · then $9/month or $79/year.{' '}
                <Link href="/sign-up" className="font-medium text-[#d8b67c] hover:underline">
                  Start free trial
                </Link>
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
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
                    href="/genres"
                    className="inline-block px-3 py-1 text-[11px] uppercase tracking-wider text-[#d8b67c] hover:underline"
                  >
                    All rooms →
                  </Link>
                </li>
              </ul>

              <p className="mt-8 text-sm text-[#eadfce]/80">
                Search any title above, then follow connected source links — Gutenberg, Open Library,
                Libby, and more.
              </p>
            </div>

            <aside
              ref={heroAsideRef}
              className="mt-8 border border-white/10 bg-[#140f0c] p-5 xl:absolute xl:right-0 xl:top-0 xl:mt-0 xl:w-[300px]"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">Start here</p>
              <p className="mt-4 font-serif text-xl text-[#f5eee6]">Search connected sources</p>
              <p className="mt-3 text-sm leading-relaxed text-[#eadfce]/74">
                ReadAI is your club — books come from legal sites you already trust, not a hosted
                catalog.
              </p>
              <p className="mt-4">
                <a
                  href="#search"
                  className="text-xs uppercase tracking-wider text-[#d8b67c] hover:underline"
                >
                  Search sources →
                </a>
              </p>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <PathCard
            eyebrow="Continue reading"
            title={lastRead ? lastRead.title : 'Return to your place'}
            body={
              lastRead
                ? `${lastRead.author} · ${lastRead.progressLabel}`
                : 'When you open a book from a connected source, your last session can appear here.'
            }
            href={lastRead?.href}
            cta={lastRead ? 'Resume reading' : 'Waiting for your first session'}
          />
          <PathCard
            eyebrow="Saved books"
            title={savedCount > 0 ? `${savedCount} saved on your account` : 'Build a personal shelf'}
            body={
              savedCount > 0
                ? 'Open your shelf to see every title saved to your account.'
                : 'Save titles while browsing connected sources.'
            }
            href="/saved"
            cta={savedCount > 0 ? 'Open saved shelf →' : 'View saved shelf →'}
          />
          <PathCard
            eyebrow="Browse by room"
            title="Walk the rooms"
            body="Move between horror, mystery, romance, fantasy, literary fiction, and every room beyond."
            href="/genres"
            cta="Enter the rooms"
          />
        </div>

        <div className="mt-4">
          <PathCard
            eyebrow="Film room"
            title={`${FEATURED_FILM_COUNT} movie books`}
            body="Search a film and follow connected source links for its book."
            href="/movies"
            cta="Enter Movies section"
            thumbTitle={SPOTLIGHT_FILM.title}
          />
        </div>

        <aside className="mt-8 border border-white/10 bg-[#16110d] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">Popular rooms</p>
              <h2 className="mt-2 font-serif text-2xl text-[#f5eee6]">Browse by room</h2>
            </div>
            <Link href="/genres" className="text-xs uppercase tracking-wider text-[#d8b67c] hover:underline">
              All rooms
            </Link>
          </div>
          {genresLoading ? (
            <p className="mt-5 text-sm text-[#eadfce]/68">Loading the reading rooms…</p>
          ) : rooms.length === 0 ? (
            <p className="mt-5 text-sm text-[#eadfce]/68">
              Rooms load from connected sources — try again in a moment.
            </p>
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
    </section>
  )
}
