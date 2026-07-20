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

import { getDictionary } from '@/lib/i18n/dictionaries'

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
  movieBookLabel = 'Movie book',
}: {
  eyebrow: string
  title: string
  body: string
  href?: string
  cta: string
  thumbTitle?: string
  movieBookLabel?: string
}) {
  const content = (
    <>
      <div className={thumbTitle ? 'flex items-start gap-4' : undefined}>
        {thumbTitle ? (
          <FilmCoverThumb
            filmTitle={thumbTitle}
            placeholderLabel={movieBookLabel}
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
  const t = getDictionary()
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
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#d8b67c]">{t.home.heroEyebrow}</p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-[#f6efe7] md:text-5xl">
                {t.home.heroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#f5eee6]">
                {t.home.heroBody}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
                {t.home.heroTrial}{' '}
                <Link href="/sign-up" className="font-medium text-[#d8b67c] hover:underline">
                  {t.nav.startTrial}
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
                    {t.nav.movies}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genres"
                    className="inline-block px-3 py-1 text-[11px] uppercase tracking-wider text-[#d8b67c] hover:underline"
                  >
                    {t.home.allRooms}
                  </Link>
                </li>
              </ul>
            </div>

            <aside
              ref={heroAsideRef}
              className="mt-8 border border-white/10 bg-[#140f0c] p-5 xl:absolute xl:right-0 xl:top-0 xl:mt-0 xl:w-[300px]"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">{t.home.filmRoom}</p>
              <Link href="/movies" className="mt-4 flex items-start gap-4 transition hover:opacity-90">
                <FilmCoverThumb
                  filmTitle={SPOTLIGHT_FILM.title}
                  eager
                  placeholderLabel={t.home.movieBookLabel}
                  className="h-28 w-20 shrink-0 border border-white/15 bg-[#18120e] object-cover"
                />
                <div className="min-w-0">
                  <p className="font-serif text-xl text-[#f5eee6]">
                    {FEATURED_FILM_COUNT} {t.home.movieBooks}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#d8b67c]">
                    {t.home.enterMovies}
                  </p>
                </div>
              </Link>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <PathCard
            eyebrow={t.home.continueReading}
            title={lastRead ? lastRead.title : t.home.returnPlace}
            body={
              lastRead
                ? `${lastRead.author} · ${lastRead.progressLabel}`
                : t.home.returnPlaceBody
            }
            href={lastRead?.href}
            cta={lastRead ? t.home.resumeReading : t.home.waitingSession}
          />
          <PathCard
            eyebrow={t.home.savedBooks}
            title={
              savedCount > 0
                ? t.home.savedCountTitle.replace('{count}', String(savedCount))
                : t.home.buildShelf
            }
            body={savedCount > 0 ? t.home.savedCountBody : t.home.saveWhileBrowsing}
            href="/saved"
            cta={t.home.openSavedShelf}
          />
          <PathCard
            eyebrow={t.home.browseByRoom}
            title={t.home.walkRooms}
            body={t.home.walkRoomsBody}
            href="/genres"
            cta={t.home.enterRooms}
          />
        </div>

        <div className="mt-4">
          <PathCard
            eyebrow={t.home.filmRoom}
            title={`${FEATURED_FILM_COUNT} ${t.home.movieBooks}`}
            body={t.home.movieBooksBody}
            href="/movies"
            cta={t.home.enterMovies}
            thumbTitle={SPOTLIGHT_FILM.title}
            movieBookLabel={t.home.movieBookLabel}
          />
        </div>

        <aside className="mt-8 border border-white/10 bg-[#16110d] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">{t.home.popularRooms}</p>
              <h2 className="mt-2 font-serif text-2xl text-[#f5eee6]">{t.home.browseByRoom}</h2>
            </div>
            <Link href="/genres" className="text-xs uppercase tracking-wider text-[#d8b67c] hover:underline">
              {t.home.allRoomsLink}
            </Link>
          </div>
          {genresLoading ? (
            <p className="mt-5 text-sm text-[#eadfce]/68">{t.home.loadingRooms}</p>
          ) : rooms.length === 0 ? (
            <p className="mt-5 text-sm text-[#eadfce]/68">{t.home.roomsEmpty}</p>
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
