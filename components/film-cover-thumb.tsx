'use client'

import { useEffect, useRef, useState } from 'react'
import { MovieBookCoverImage } from '@/components/movie-book-cover-image'

export function FilmCoverThumb({
  filmTitle,
  className = 'h-24 w-16 shrink-0 border border-white/15 bg-[#18120e] object-cover',
  eager = false,
  placeholderLabel = 'Movie book',
}: {
  filmTitle: string
  className?: string
  /** When true, fetch immediately (for above-the-fold cards). */
  eager?: boolean
  placeholderLabel?: string
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    const node = ref.current
    const title = filmTitle.trim()
    if (!title) return

    fetchedRef.current = false
    setCoverUrl(null)

    let cancelled = false

    const load = () => {
      if (fetchedRef.current || cancelled) return
      fetchedRef.current = true

      fetch(`/api/movie-book-cover?q=${encodeURIComponent(title)}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setCoverUrl(data?.coverUrl ?? null)
        })
        .catch(() => {
          if (!cancelled) setCoverUrl(null)
        })
    }

    if (eager) {
      load()
      return () => {
        cancelled = true
      }
    }

    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      load()
      return () => {
        cancelled = true
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          load()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(node)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [eager, filmTitle])

  return (
    <div ref={ref}>
      <MovieBookCoverImage
        coverUrl={coverUrl}
        title={filmTitle}
        className={className}
        placeholderLabel={placeholderLabel}
      />
    </div>
  )
}
