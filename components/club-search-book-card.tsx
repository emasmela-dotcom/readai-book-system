'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SaveBookButton } from '@/components/save-book-button'
import {
  gutenbergScannedCoverUrl,
  openLibraryGutenbergCoverUrl,
} from '@/lib/book-covers'

export type ClubSearchBook = {
  title: string
  author: string | null
  coverUrl: string | null
  gutenbergId: number
  readHref: string
  sourceLabel: string
  bookId: number | null
}

const CARD_CLASS =
  'flex h-full items-start gap-4 border border-white/15 bg-[#171311] p-4 transition hover:border-[#c9a96e]/45'

function coverFallbacks(gutenbergId: number, primary: string | null): string[] {
  const urls = [primary, gutenbergScannedCoverUrl(gutenbergId), openLibraryGutenbergCoverUrl(gutenbergId)]
  return [...new Set(urls.filter((url): url is string => Boolean(url?.trim())))]
}

export function ClubSearchBookCard({ book }: { book: ClubSearchBook }) {
  const isInAppRead = book.readHref.startsWith('/books/')
  const [coverIndex, setCoverIndex] = useState(0)
  const covers = coverFallbacks(book.gutenbergId, book.coverUrl)

  const cardInner = (
    <>
      {covers.length > 0 ? (
        <img
          src={covers[coverIndex]}
          alt=""
          className="h-32 w-24 shrink-0 border border-white/15 bg-[#18120e] object-cover"
          onError={() => {
            setCoverIndex((current) => (current + 1 < covers.length ? current + 1 : current))
          }}
        />
      ) : (
        <div
          className="flex h-32 w-24 shrink-0 items-center justify-center border border-white/15 bg-[#18120e] px-2 text-center text-[10px] uppercase tracking-wider text-[#c9a96e]"
          aria-hidden="true"
        >
          Read
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">{book.sourceLabel}</p>
        <p className="mt-2 font-serif text-lg leading-snug text-[#f5f2ed]">{book.title}</p>
        {book.author ? <p className="mt-1 text-sm text-[#eadfce]">{book.author}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider text-[#c9a96e]">Read full book →</span>
          {book.bookId ? <SaveBookButton bookId={book.bookId} size="compact" /> : null}
        </div>
      </div>
    </>
  )

  if (isInAppRead) {
    return (
      <Link href={book.readHref} className={CARD_CLASS}>
        {cardInner}
      </Link>
    )
  }

  return (
    <a href={book.readHref} target="_blank" rel="noopener noreferrer" className={CARD_CLASS}>
      {cardInner}
    </a>
  )
}
