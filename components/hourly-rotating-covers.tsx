'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { BookCoverImage } from '@/components/book-cover-image'
import { BOOK_COVER_THUMB_BOX_CLASS, BOOK_COVER_THUMB_CLASS } from '@/lib/book-cover-size'

interface CoverBook {
  id: number
  title: string
  author: string
  gutenbergId: number
  coverUrl: string
  genreTitle?: string
}

const BATCH_SIZE = 8
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

function hourlyBatch(allBooks: CoverBook[], batchSize: number, hour: number): CoverBook[] {
  if (allBooks.length === 0) return []
  const sorted = [...allBooks].sort((a, b) => a.id - b.id)
  const start = (hour * batchSize) % sorted.length
  const batch: CoverBook[] = []
  for (let i = 0; i < batchSize; i++) {
    batch.push(sorted[(start + i) % sorted.length])
  }
  return batch
}

function CoverCard({ book }: { book: CoverBook }) {
  return (
    <Link
      href={`/books/${book.id}/read`}
      className="group flex min-w-0 flex-col gap-2 transition hover:opacity-90"
    >
      <div
        className={`relative mx-auto ${BOOK_COVER_THUMB_BOX_CLASS} bg-gradient-to-b ${toneForBook(book.id)}`}
      >
        <BookCoverImage
          bookId={book.id}
          gutenbergId={book.gutenbergId}
          coverUrl={book.coverUrl}
          title={book.title}
          className={`relative z-10 ${BOOK_COVER_THUMB_CLASS}`}
        />
      </div>
      <div className="min-w-0">
        <p className="font-serif text-sm font-medium leading-snug text-[#f5f2ed] line-clamp-3 group-hover:text-[#d8b67c]">
          {book.title}
        </p>
        <p className="mt-1 text-xs leading-snug text-[#eadfce] line-clamp-2">{book.author}</p>
      </div>
    </Link>
  )
}

export function HourlyRotatingCovers() {
  const [pool, setPool] = useState<CoverBook[]>([])
  const [hourKey, setHourKey] = useState(() => Math.floor(Date.now() / (60 * 60 * 1000)))
  const [hourLabel, setHourLabel] = useState('')

  useEffect(() => {
    fetch('/api/home-covers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.books)) {
          setPool(data.books)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      setHourKey(Math.floor(now / (60 * 60 * 1000)))
      const d = new Date(now)
      setHourLabel(
        d.toLocaleString(undefined, {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
        }),
      )
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const batch = useMemo(() => hourlyBatch(pool, BATCH_SIZE, hourKey), [pool, hourKey])

  if (pool.length === 0) return null

  return (
    <section className="mt-8 border border-white/10 bg-[#16110d] p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b67c]">
            Cover gallery
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#f5eee6]">On the shelf this hour</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#e8ddcd]/74">
            Real edition covers from the club library. Refreshes about every hour.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#d8b67c]/80">{hourLabel}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {batch.map((book) => (
          <CoverCard key={`${book.id}-${book.gutenbergId}`} book={book} />
        ))}
      </div>
    </section>
  )
}
