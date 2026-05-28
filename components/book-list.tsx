import Link from 'next/link'
import { authorHref } from '@/lib/author-slug'
import { BookCoverImage } from '@/components/book-cover-image'
import { BOOK_COVER_THUMB_BOX_CLASS, BOOK_COVER_THUMB_CLASS } from '@/lib/book-cover-size'

export interface ClubBookListItem {
  id: number
  title: string
  author: string | null
  rating: number | null
  pages?: number | null
  gutenbergId?: number | null
  coverUrl?: string | null
}

interface BookListProps {
  books: ClubBookListItem[]
  /** 1-based index of first book on this page (for numbered shelves). */
  startIndex?: number
}

export function BookList({ books, startIndex = 1 }: BookListProps) {
  return (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {books.map((book, i) => {
        const authorLink = authorHref(book.author)
        const title = book.title?.trim() || 'Untitled'
        const number = startIndex + i
        const hasCover =
          (book.coverUrl != null && book.coverUrl.length > 0) ||
          (book.gutenbergId != null && book.gutenbergId > 0)

        return (
          <li
            key={book.id}
            className="flex gap-3 py-3 sm:items-center sm:gap-4"
          >
            <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-[#c9a96e]">{number}.</span>

            <Link href={`/books/${book.id}`} className="shrink-0">
              {hasCover ? (
                <div className={BOOK_COVER_THUMB_BOX_CLASS}>
                  <BookCoverImage
                    bookId={book.id}
                    gutenbergId={book.gutenbergId ?? undefined}
                    coverUrl={book.coverUrl ?? undefined}
                    title={title}
                    className={BOOK_COVER_THUMB_CLASS}
                  />
                </div>
              ) : (
                <div
                  className={`${BOOK_COVER_THUMB_BOX_CLASS} flex items-end bg-gradient-to-b from-[#3d3428] to-[#1a1510] p-1`}
                >
                  <p className="font-serif text-[9px] leading-tight text-[#f5f2ed] line-clamp-4">{title}</p>
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={`/books/${book.id}`}
                className="font-serif text-base text-[#f5f2ed] transition hover:text-[#c9a96e] hover:underline"
              >
                {title}
              </Link>
              <p className="mt-1 text-sm text-[#e8e4df]/72">
                by{' '}
                {authorLink ? (
                  <Link href={authorLink} className="text-[#c9a96e] hover:underline">
                    {book.author}
                  </Link>
                ) : (
                  book.author || 'Unknown author'
                )}
              </p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#e8e4df]/70">
                {book.rating != null && (
                  <span className="text-[#c9a96e]">{Number(book.rating).toFixed(1)} ★</span>
                )}
                {book.pages != null && <span>{book.pages} pp</span>}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
