'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { BookCoverCard } from '@/components/book-cover-card'
import { SaveBookButton } from '@/components/save-book-button'
import {
  readSavedBookEntries,
  savedBookProgressLabel,
  savedBookReadHref,
  SAVED_BOOKS_STORAGE_KEY,
} from '@/lib/saved-books-storage'

interface SavedBook {
  id: number
  title: string
  author: string
  coverUrl?: string
  gutenbergId?: number
}

const COVER_TONES = [
  'from-[#6d432f] to-[#2a1711]',
  'from-[#374730] to-[#141b11]',
  'from-[#5a3040] to-[#211017]',
  'from-[#5d4728] to-[#20160d]',
  'from-[#284350] to-[#101920]',
  'from-[#5c3526] to-[#24130f]',
] as const

function toneForBook(bookId: number) {
  return COVER_TONES[bookId % COVER_TONES.length]
}

export function SavedBooksShelf() {
  const [books, setBooks] = useState<SavedBook[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const entries = readSavedBookEntries()
    const ids = entries.map((entry) => entry.bookId)
    if (ids.length === 0) {
      setBooks([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/saved-books?ids=${ids.join(',')}`, { cache: 'no-store' })
      const data = await res.json()
      setBooks(Array.isArray(data?.books) ? data.books : [])
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()

    function onStorage(event: StorageEvent) {
      if (event.key === SAVED_BOOKS_STORAGE_KEY || event.key === null) reload()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('readai-saved-books-changed', reload)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('readai-saved-books-changed', reload)
    }
  }, [reload])

  if (loading) {
    return <p className="text-sm text-[#eadfce]">Loading your saved shelf…</p>
  }

  if (books.length === 0) {
    return (
      <div className="border border-white/10 bg-[#171311] p-8 text-center">
        <p className="text-sm text-[#eadfce]">No saved places on this device yet.</p>
        <p className="mt-2 text-sm text-[#e8e4df]/75">
          While reading, tap <span className="text-[#f5f2ed]">Save place</span> to keep the book and
          where you stopped.
        </p>
        <Link
          href="/#library"
          className="mt-6 inline-block border border-[#c9a96e] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:bg-[#c9a96e]/10"
        >
          Browse the club
        </Link>
      </div>
    )
  }

  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => {
        const resumeHref = savedBookReadHref(book.id)
        const progress = savedBookProgressLabel(book.id)

        return (
          <li key={book.id} className="border border-white/10 bg-[#171311] p-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <BookCoverCard
                bookId={book.id}
                gutenbergId={book.gutenbergId}
                coverUrl={book.coverUrl}
                title={book.title}
                author={book.author}
                toneClass={toneForBook(book.id)}
              />
              <div className="min-w-0 flex-1">
                <Link href={`/books/${book.id}`} className="font-serif text-xl text-[#f5f2ed] hover:text-[#c9a96e]">
                  {book.title}
                </Link>
                <p className="mt-1 text-sm text-[#eadfce]">{book.author}</p>
                {progress ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#c9a96e]/90">{progress}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={resumeHref}
                    className="border border-[#c9a96e] bg-[#c9a96e] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#0e0c0a] hover:bg-[#d8be84]"
                  >
                    Resume
                  </Link>
                  <SaveBookButton bookId={book.id} />
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
