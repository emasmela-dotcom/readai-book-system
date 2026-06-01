'use client'

import { useEffect } from 'react'
import { getReadingPosition } from '@/lib/reading-position-store'
import { getSavedBookEntry } from '@/lib/saved-books-storage'

export function RestoreReadingScroll({
  bookId,
  mode,
  scrollYFromUrl,
}: {
  bookId: number
  mode: 'pages' | 'scroll'
  scrollYFromUrl?: number
}) {
  useEffect(() => {
    if (mode !== 'scroll') return

    const fromUrl = scrollYFromUrl
    const fromSaved = getSavedBookEntry(bookId)?.position.scrollY
    const fromLive = getReadingPosition(bookId)?.scrollY
    const scrollY = fromUrl ?? fromSaved ?? fromLive

    if (scrollY == null || scrollY <= 0) return

    const restore = () => {
      window.scrollTo({ top: scrollY, left: 0 })
    }

    restore()
    const raf = requestAnimationFrame(restore)
    const timer = window.setTimeout(restore, 150)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [bookId, mode, scrollYFromUrl])

  return null
}
