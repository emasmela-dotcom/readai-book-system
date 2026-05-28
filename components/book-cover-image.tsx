'use client'

import { useCallback, useLayoutEffect, useState } from 'react'
import { coverUrlCandidates, isRealCoverUrl } from '@/lib/book-covers'
import { bookCoverThumbUrl } from '@/lib/book-cover-thumb'

interface BookCoverImageProps {
  bookId?: number
  gutenbergId?: number
  title: string
  className?: string
  coverUrl?: string
  onExhausted?: () => void
  onLoaded?: () => void
}

export function BookCoverImage({
  bookId,
  gutenbergId,
  title,
  className = 'h-full w-full object-cover',
  coverUrl,
  onExhausted,
  onLoaded,
}: BookCoverImageProps) {
  const fallbackCandidates: string[] = []

  if (coverUrl?.trim() && isRealCoverUrl(coverUrl)) {
    fallbackCandidates.push(coverUrl.trim())
  }
  if (bookId != null && bookId > 0) {
    const proxy = bookCoverThumbUrl(bookId)
    if (!fallbackCandidates.includes(proxy)) fallbackCandidates.push(proxy)
  }
  if (gutenbergId) {
    for (const url of coverUrlCandidates(gutenbergId)) {
      if (!fallbackCandidates.includes(url)) fallbackCandidates.push(url)
    }
  }

  const [fallbackIndex, setFallbackIndex] = useState(0)
  const exhausted = fallbackCandidates.length === 0 || fallbackIndex >= fallbackCandidates.length

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

  const src = fallbackCandidates[fallbackIndex]
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
