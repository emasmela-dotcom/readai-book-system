'use client'

import { useCallback, useLayoutEffect, useState } from 'react'
import { buildDirectCoverImageUrls } from '@/lib/book-cover-sources'
import { bookCoverThumbUrl } from '@/lib/book-cover-thumb'

interface BookCoverImageProps {
  bookId?: number
  gutenbergId?: number
  title: string
  author?: string | null
  className?: string
  coverUrl?: string
  onExhausted?: () => void
  onLoaded?: () => void
}

/**
 * Tries each cover image source in order until one loads (see lib/book-cover-sources.ts).
 * Server-side sources (Open Library search) run inside /api/book-cover/[id], tried last.
 */
export function BookCoverImage({
  bookId,
  gutenbergId,
  title,
  author,
  className = 'h-full w-full object-cover',
  coverUrl,
  onExhausted,
  onLoaded,
}: BookCoverImageProps) {
  const candidates: string[] = []

  for (const url of buildDirectCoverImageUrls({
    title,
    author,
    gutenbergId,
    coverUrl,
  })) {
    if (!candidates.includes(url)) candidates.push(url)
  }

  if (bookId != null && bookId > 0) {
    const proxy = bookCoverThumbUrl(bookId)
    if (!candidates.includes(proxy)) candidates.push(proxy)
  }

  const [fallbackIndex, setFallbackIndex] = useState(0)
  const exhausted = candidates.length === 0 || fallbackIndex >= candidates.length

  const advance = useCallback(() => {
    setFallbackIndex((current) => current + 1)
  }, [])

  const rejectTinyImage = (img: HTMLImageElement) => {
    if (img.naturalWidth < 8 || img.naturalHeight < 8) advance()
  }

  useLayoutEffect(() => {
    if (exhausted) onExhausted?.()
  }, [exhausted, onExhausted])

  if (exhausted) return null

  const src = candidates[fallbackIndex]
  const isOpenLibrary = src.includes('openlibrary.org')

  return (
    <img
      key={src}
      src={src}
      alt={`Cover of ${title}`}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy={isOpenLibrary ? 'no-referrer' : undefined}
      onError={advance}
      onLoad={(e) => {
        rejectTinyImage(e.currentTarget)
        onLoaded?.()
      }}
    />
  )
}
