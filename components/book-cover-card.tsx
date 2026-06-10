'use client'

import Link from 'next/link'
import { BookCoverImage } from '@/components/book-cover-image'
import { BOOK_COVER_THUMB_BOX_CLASS, BOOK_COVER_THUMB_CLASS } from '@/lib/book-cover-size'

interface BookCoverCardProps {
  bookId: number
  gutenbergId?: number
  coverUrl?: string
  title: string
  author: string
  genreTitle?: string
  toneClass: string
}

export function BookCoverCard({
  bookId,
  gutenbergId,
  coverUrl,
  title,
  author,
  genreTitle,
  toneClass,
}: BookCoverCardProps) {
  return (
    <Link
      href={`/books/${bookId}/read`}
      className="group flex w-[9.5rem] min-w-0 shrink-0 flex-col gap-2 transition hover:opacity-90 sm:w-[10.5rem]"
    >
      <div className={`relative mx-auto ${BOOK_COVER_THUMB_BOX_CLASS} bg-gradient-to-b ${toneClass}`}>
        <BookCoverImage
          bookId={bookId}
          gutenbergId={gutenbergId}
          coverUrl={coverUrl}
          title={title}
          className={`relative z-10 ${BOOK_COVER_THUMB_CLASS}`}
        />
      </div>
      <div className="min-w-0">
        {genreTitle ? (
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#d8b67c] line-clamp-1">{genreTitle}</p>
        ) : null}
        <h3 className="mt-0.5 font-serif text-sm font-medium leading-snug text-[#f5f2ed] line-clamp-3 group-hover:text-[#d8b67c]">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-snug text-[#eadfce] line-clamp-2">{author}</p>
      </div>
    </Link>
  )
}
