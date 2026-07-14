import Link from 'next/link'
import { BookCoverImage } from '@/components/book-cover-image'
import { BOOK_COVER_THUMB_BOX_CLASS, BOOK_COVER_THUMB_CLASS } from '@/lib/book-cover-size'
import { hasRealCoverUrl } from '@/lib/book-covers'
import { clubOpenHref } from '@/lib/club-open-href'
import type { GenreSourceShelfBook } from '@/lib/genre-source-shelves'

export function SourceShelfBookList({
  books,
  startIndex = 1,
  guestCookbook = false,
}: {
  books: GenreSourceShelfBook[]
  startIndex?: number
  guestCookbook?: boolean
}) {
  return (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {books.map((book, i) => {
        const number = startIndex + i
        const hasCover = hasRealCoverUrl(book.coverUrl)
        const clubHref = clubOpenHref(book.title, book.author, { guestCookbook })

        return (
          <li key={book.key} className="flex gap-3 py-4">
            <span className="w-6 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-[#c9a96e]">
              {number}.
            </span>

            <div className="min-w-0 flex-1">
              <Link
                href={clubHref}
                className="block font-serif text-lg font-medium leading-snug text-[#f5f2ed] transition hover:text-[#c9a96e] hover:underline"
              >
                {book.title}
              </Link>
              <p className="mt-1 text-sm leading-snug text-[#eadfce]">
                {book.author ? <>by {book.author}</> : <>by Unknown author</>}
              </p>

              <div className="mt-3 flex flex-wrap items-start gap-3">
                {hasCover ? (
                  <Link href={clubHref} className="shrink-0">
                    <div className={BOOK_COVER_THUMB_BOX_CLASS}>
                      <BookCoverImage
                        coverUrl={book.coverUrl ?? undefined}
                        title={book.title}
                        className={BOOK_COVER_THUMB_CLASS}
                      />
                    </div>
                  </Link>
                ) : null}
                <div className="flex flex-wrap gap-3 text-xs text-[#eadfce]">
                  <Link
                    href={clubHref}
                    className="uppercase tracking-[0.15em] text-[#c9a96e] hover:underline"
                  >
                    Open in ReadAI
                  </Link>
                  <a
                    href={book.openLibraryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uppercase tracking-[0.15em] text-[#eadfce]/80 hover:text-[#c9a96e] hover:underline"
                  >
                    {book.openLibraryLabel}
                  </a>
                  <a
                    href={book.readHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uppercase tracking-[0.15em] text-[#eadfce]/80 hover:text-[#c9a96e] hover:underline"
                  >
                    {book.readLabel}
                  </a>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
