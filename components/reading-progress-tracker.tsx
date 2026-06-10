'use client'

import { useEffect } from 'react'
import type { ReaderMode } from '@/components/reader-mode-select'
import {
  buildReadHref,
  formatProgressLabel,
  readingPositionFromView,
  type ReadingPosition,
} from '@/lib/reading-position'
import { recordReadingPosition } from '@/lib/reading-position-store'
import {
  ensureSavedBooksLoaded,
  isBookSaved,
  updateSavedBookPosition,
} from '@/lib/saved-books-storage'

const LAST_READ_KEY = 'readai_last_read'

function persistProgress(
  bookId: number,
  title: string,
  author: string,
  totalPages: number,
  position: ReadingPosition,
) {
  recordReadingPosition(bookId, position)
  if (isBookSaved(bookId)) {
    void updateSavedBookPosition(bookId, position)
  }

  const href = buildReadHref(bookId, position)
  localStorage.setItem(
    LAST_READ_KEY,
    JSON.stringify({
      href,
      title,
      author,
      progressLabel: formatProgressLabel(position, totalPages),
    }),
  )
}

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
    void ensureSavedBooksLoaded()
  }, [])

  useEffect(() => {
    persistProgress(bookId, title, author, totalPages, readingPositionFromView(mode, page))
  }, [author, bookId, mode, page, title, totalPages])

  useEffect(() => {
    if (mode !== 'scroll') return

    let timeout: ReturnType<typeof setTimeout> | undefined

    function onScroll() {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        persistProgress(
          bookId,
          title,
          author,
          totalPages,
          readingPositionFromView('scroll', page),
        )
      }, 350)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (timeout) clearTimeout(timeout)
      window.removeEventListener('scroll', onScroll)
    }
  }, [author, bookId, mode, page, title, totalPages])

  return null
}
