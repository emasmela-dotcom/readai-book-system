'use client'

import { useEffect, useState } from 'react'
import type { ReaderMode } from '@/components/reader-mode-select'
import { readingPositionFromView } from '@/lib/reading-position'
import {
  ensureSavedBooksLoaded,
  isBookSaved,
  SAVED_BOOKS_CHANGED_EVENT,
  toggleSavedBookId,
} from '@/lib/saved-books-storage'

const SIZES = {
  default: 'px-6 py-4 text-sm',
  compact: 'shrink-0 px-3 py-2 text-[11px]',
} as const

export function SaveBookButton({
  bookId,
  size = 'default',
  mode,
  page = 1,
}: {
  bookId: number
  size?: keyof typeof SIZES
  mode?: ReaderMode
  page?: number
}) {
  const [saved, setSavedState] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    setMounted(true)

    ensureSavedBooksLoaded().then(() => {
      if (active) setSavedState(isBookSaved(bookId))
    })

    function onChanged() {
      setSavedState(isBookSaved(bookId))
    }

    window.addEventListener(SAVED_BOOKS_CHANGED_EVENT, onChanged)
    return () => {
      active = false
      window.removeEventListener(SAVED_BOOKS_CHANGED_EVENT, onChanged)
    }
  }, [bookId])

  async function toggle() {
    if (busy) return
    setBusy(true)
    try {
      const position = mode != null ? readingPositionFromView(mode, page) : undefined
      const isSaved = await toggleSavedBookId(bookId, position)
      setSavedState(isSaved)
    } catch {
      // keep prior state on failure
    } finally {
      setBusy(false)
    }
  }

  const sizeClass = SIZES[size]
  const stateClass = saved
    ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]'
    : 'border-white/30 text-[#f5f2ed] hover:border-[#c9a96e] hover:text-[#c9a96e]'

  const label = saved ? 'Place saved' : 'Save place'

  if (!mounted) {
    return (
      <span
        className={`inline-flex items-center justify-center gap-2 border border-white/20 bg-[#171311] uppercase tracking-[0.2em] text-[#e8e4df]/55 ${sizeClass}`}
        aria-hidden="true"
      >
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-busy={busy}
      aria-label={
        saved
          ? 'Remove saved place for this book'
          : 'Save this book and your current reading place'
      }
      className={`inline-flex items-center justify-center gap-2 border uppercase tracking-[0.2em] transition disabled:opacity-60 ${sizeClass} ${stateClass}`}
    >
      <svg
        width="14"
        height="17"
        viewBox="0 0 14 17"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1 1h12v14.5L7 12 1 15.5V1Z" />
      </svg>
      {label}
    </button>
  )
}
