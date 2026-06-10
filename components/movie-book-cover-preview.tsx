'use client'

import { useEffect, useState } from 'react'
import { MovieBookCoverImage } from '@/components/movie-book-cover-image'
import { sourceAccessLabel, type BookSourceLink } from '@/lib/book-sources'

type PreviewState = {
  coverUrl: string | null
  bookTitle: string
  sources: BookSourceLink[]
  searchHref: string
}

export function MovieBookCoverPreview({ query }: { query: string }) {
  const [state, setState] = useState<PreviewState | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setState(null)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/movie-book-cover?q=${encodeURIComponent(trimmed)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setState({
          coverUrl: data?.coverUrl ?? null,
          bookTitle: data?.bookTitle ?? trimmed,
          sources: Array.isArray(data?.sources) ? data.sources : [],
          searchHref: typeof data?.searchHref === 'string' ? data.searchHref : '',
        })
      })
      .catch(() => {
        if (!cancelled) setState(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query])

  if (!query.trim()) return null

  const label = state?.bookTitle ?? query.trim()

  return (
    <div className="mb-6 border border-white/10 bg-[#171311] p-4">
      <div className="flex items-start gap-4">
        <MovieBookCoverImage
          coverUrl={loading ? null : state?.coverUrl}
          title={label}
          className="h-28 w-20 shrink-0 border border-white/15 bg-[#18120e] object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Movie book</p>
          <p className="mt-2 font-serif text-lg text-[#f5f2ed]">{label}</p>
          <p className="mt-2 text-sm text-[#eadfce]">
            {loading
              ? 'Loading connected sources…'
              : 'Follow a connected source below — ReadAI does not host movie books.'}
          </p>
          {!loading && state?.sources.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {state.sources.map((source) => (
                <li key={source.id}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-white/10 p-3 transition hover:border-[#c9a96e]/45"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                      {sourceAccessLabel(source.access)}
                    </p>
                    <p className="mt-1 text-sm text-[#f5f2ed]">{source.label}</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}
