'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MovieBookCoverImage } from '@/components/movie-book-cover-image'

type PreviewState = {
  coverUrl: string | null
  href: string | null
  bookTitle: string
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
        <p className="mt-2 text-sm text-[#eadfce]">
          {loading
            ? 'Looking on the club shelves…'
            : href
              ? 'On the club shelves — click to open the full book.'
              : 'Not on the club shelves — search the library above for a public-domain title.'}
        </p>
        {href && !loading ? (
          <p className="mt-3 text-[10px] uppercase tracking-wider text-[#c9a96e]">Open book →</p>
        ) : null}
      </div>
    </div>
  )

  if (!href || loading) {
    return <div className="mb-6">{body}</div>
  }

  return (
    <div className="mb-6">
      <Link href={href} className="block">
        {body}
      </Link>
    </div>
  )
}
