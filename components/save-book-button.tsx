'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'readai_saved_books'

function getSaved(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function setSaved(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function SaveBookButton({ bookId }: { bookId: number }) {
  const [saved, setSavedState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSavedState(getSaved().includes(bookId))
  }, [bookId])

  function toggle() {
    const current = getSaved()
    const next = current.includes(bookId)
      ? current.filter((id) => id !== bookId)
      : [...current, bookId]

    setSaved(next)
    setSavedState(next.includes(bookId))
  }

  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center gap-2 border px-6 py-4 text-sm uppercase tracking-[0.2em] transition ${
        saved
          ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]'
          : 'border-white/30 text-[#f5f2ed] hover:border-[#c9a96e] hover:text-[#c9a96e]'
      }`}
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
      {saved ? 'Saved' : 'Save book'}
    </button>
  )
}
