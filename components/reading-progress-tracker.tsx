'use client'

import { useEffect } from 'react'
import type { ReaderMode } from '@/components/reader-mode-select'

const LAST_READ_KEY = 'readai_last_read'

export function ReadingProgressTracker({
  bookId,
  title,
  author,
  page,
  totalPages,
  mode,
}: {
  bookId: number
  title: string
  author: string
  page: number
  totalPages: number
  mode: ReaderMode
}) {
  useEffect(() => {
    const params = new URLSearchParams()

    if (mode === 'scroll') {
      params.set('mode', 'scroll')
    } else if (page > 1) {
      params.set('page', String(page))
    }

    const query = params.toString()

    localStorage.setItem(
      LAST_READ_KEY,
      JSON.stringify({
        href: query ? `/books/${bookId}/read?${query}` : `/books/${bookId}/read`,
        title,
        author,
        progressLabel: mode === 'pages' ? `Page ${page} of ${totalPages}` : 'Continuous scroll',
      }),
    )
  }, [author, bookId, mode, page, title, totalPages])

  return null
}
