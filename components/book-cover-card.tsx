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
      href={`/books/${bookId}`}
      className="group flex max-w-[11rem] shrink-0 gap-2 transition hover:opacity-90"
    >
      <div className={`relative ${BOOK_COVER_THUMB_BOX_CLASS} bg-gradient-to-b ${toneClass}`}>
        <div className="absolute inset-0 z-0 flex items-end p-1">
          <p className="font-serif text-[9px] leading-tight text-[#fff7ee] line-clamp-4">{title}</p>
        </div>
        <BookCoverImage
          bookId={bookId}
          gutenbergId={gutenbergId}
          coverUrl={coverUrl}
          title={title}
          className={`relative z-10 ${BOOK_COVER_THUMB_CLASS}`}
        />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        {genreTitle ? (
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#d8b67c]/80 line-clamp-1">{genreTitle}</p>
        ) : null}
        <h3 className="mt-0.5 font-serif text-xs leading-snug text-[#fff7ee] line-clamp-3 group-hover:text-[#d8b67c]">
          {title}
        </h3>
        <p className="mt-1 text-[10px] text-[#e8ddcd]/72 line-clamp-2">{author}</p>
      </div>
    </Link>
  )
}
