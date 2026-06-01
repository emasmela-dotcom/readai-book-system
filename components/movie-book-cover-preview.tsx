'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MovieBookCoverImage } from '@/components/movie-book-cover-image'

type PreviewState = {
  coverUrl: string | null
  href: string | null
  bookTitle: string
  inClub: boolean
  sourceLabel: string | null
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
          href: data?.href ?? null,
          bookTitle: data?.bookTitle ?? trimmed,
          inClub: Boolean(data?.inClub),
          sourceLabel: data?.sourceLabel ?? null,
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
  const href = state?.href

  const statusLine = loading
    ? 'Loading movie book…'
    : href
      ? state?.inClub
        ? 'Full book on the club shelves — click to read here.'
        : `Opens via ${state?.sourceLabel ?? 'connected source'} (read or borrow on that site).`
      : 'No book link found for this film.'

  const body = (
    <div className="flex items-start gap-4 border border-white/10 bg-[#171311] p-4 transition hover:border-[#c9a96e]/40">
      <MovieBookCoverImage
        coverUrl={loading ? null : state?.coverUrl}
        title={label}
        className="h-28 w-20 shrink-0 border border-white/15 bg-[#18120e] object-cover"
      />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Movie book</p>
        <p className="mt-2 font-serif text-lg text-[#f5f2ed]">{label}</p>
        <p className="mt-2 text-sm text-[#eadfce]">{statusLine}</p>
        {href && !loading ? (
          <p className="mt-3 text-[10px] uppercase tracking-wider text-[#c9a96e]">Open book →</p>
        ) : null}
      </div>
    </div>
  )

  if (!href || loading) {
    return <div className="mb-6">{body}</div>
  }

  if (state?.inClub) {
    return (
      <div className="mb-6">
        <Link href={href} className="block">
          {body}
        </Link>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <a href={href} target="_blank" rel="noreferrer" className="block">
        {body}
      </a>
    </div>
  )
}
