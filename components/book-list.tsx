import Link from 'next/link'
import { authorHref } from '@/lib/author-slug'
import { BookCoverImage } from '@/components/book-cover-image'
import { BOOK_COVER_THUMB_BOX_CLASS, BOOK_COVER_THUMB_CLASS } from '@/lib/book-cover-size'
import { hasRealCoverUrl } from '@/lib/book-covers'

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
        const hasCover = hasRealCoverUrl(book.coverUrl)

        return (
          <li key={book.id} className="flex gap-3 py-4">
            <span className="w-6 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-[#c9a96e]">
              {number}.
            </span>

            <div className="min-w-0 flex-1">
              <Link
                href={`/books/${book.id}`}
                className="block font-serif text-lg font-medium leading-snug text-[#f5f2ed] transition hover:text-[#c9a96e] hover:underline"
              >
                {title}
              </Link>
              <p className="mt-1 text-sm leading-snug text-[#eadfce]">
                {authorLink ? (
                  <>
                    by{' '}
                    <Link href={authorLink} className="text-[#c9a96e] hover:underline">
                      {book.author}
                    </Link>
                  </>
                ) : (
                  <>by {book.author || 'Unknown author'}</>
                )}
              </p>

              <div className="mt-3 flex flex-wrap items-start gap-3">
                {hasCover ? (
                  <Link href={`/books/${book.id}`} className="shrink-0">
                    <div className={BOOK_COVER_THUMB_BOX_CLASS}>
                      <BookCoverImage
                        bookId={book.id}
                        gutenbergId={book.gutenbergId ?? undefined}
                        coverUrl={book.coverUrl ?? undefined}
                        title={title}
                        className={BOOK_COVER_THUMB_CLASS}
                      />
                    </div>
                  </Link>
                ) : null}
                <div className="flex flex-wrap gap-2 text-xs text-[#eadfce]">
                  {book.rating != null && (
                    <span className="text-[#c9a96e]">{Number(book.rating).toFixed(1)} ★</span>
                  )}
                  {book.pages != null && <span>{book.pages} pp</span>}
                  <Link
                    href={`/books/${book.id}/read`}
                    className="uppercase tracking-[0.15em] text-[#c9a96e] hover:underline"
                  >
                    Open book
                  </Link>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
