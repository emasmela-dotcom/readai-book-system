import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireClubOrCookbookAccess } from '@/lib/auth/require-club-or-cookbook'
import { sql } from '@/lib/db'
import { authorHref } from '@/lib/author-slug'
import { bookHasFullText } from '@/lib/book-body'
import { buildCoverProviderLinks, COVER_SOURCE_STEPS } from '@/lib/book-cover-sources'
import { buildBookSourceLinks, sourceAccessLabel } from '@/lib/book-sources'
import { BookCoverImage } from '@/components/book-cover-image'
import { findAisleForBook } from '@/lib/bookstore-sections'
import { SaveBookButton } from '@/components/save-book-button'
import { BOOK_COVER_THUMB_BOX_CLASS, BOOK_COVER_THUMB_CLASS } from '@/lib/book-cover-size'
import { categoryLabel, subcategoryLabel } from '@/lib/inventory-labels'
import { hasRealCoverUrl } from '@/lib/real-cover-filter'

export const dynamic = 'force-dynamic'

interface BookRow {
  id: number
  title: string
  author: string
  gutenberg_id: number | null
  cover_url: string | null
  year: number | null
  rating: string | number | null
  description: string | null
  tags: string[] | null
  pages: number | null
  difficulty: string | null
  recommended_for: string | null
  category: string | null
  subcategory: string | null
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>
  searchParams?: { guest?: string | string[] } | Promise<{ guest?: string | string[] }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const bookId = Number(resolvedParams.id)
  if (!Number.isInteger(bookId) || bookId < 1) notFound()

  const rows = await sql`
    SELECT id, title, author, gutenberg_id, cover_url, year, rating, description, tags, pages, difficulty,
           recommended_for, category, subcategory
    FROM books
    WHERE id = ${bookId}
    LIMIT 1
  `
  const book = rows[0] as BookRow | undefined
  if (!book) notFound()

  const guestCookbook =
    (Array.isArray(resolvedSearchParams.guest)
      ? resolvedSearchParams.guest[0]
      : resolvedSearchParams.guest
    )?.trim() === 'cookbook'

  if (!guestCookbook) {
    await requireClubOrCookbookAccess(
      { title: book.title, subcategory: book.subcategory },
      `/books/${book.id}`,
    )
  }

  const coverUrl = book.cover_url?.trim() || null

  const canRead = await bookHasFullText(bookId)
  if (!canRead) notFound()

  const aisle = book.category
    ? findAisleForBook(book.category, book.subcategory)
    : undefined
  const authorLink = authorHref(book.author)
  const preview = book.description?.trim() ?? ''
  const sources = buildBookSourceLinks({
    title: book.title,
    author: book.author,
    gutenbergId: book.gutenberg_id,
  })
  const coverSources = buildCoverProviderLinks({
    title: book.title,
    author: book.author,
    gutenbergId: book.gutenberg_id,
    coverUrl,
  })

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#e8e4df] md:px-8 md:py-14">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em]">
          <Link href="/genres" className="text-[#c9a96e] hover:underline">
            Club shelves
          </Link>
          {aisle && (
            <>
              <span className="text-[#e8e4df]/50">/</span>
              <Link href={`/genres/${aisle.id}`} className="text-[#c9a96e] hover:underline">
                {aisle.title}
              </Link>
            </>
          )}
        </nav>

        <article>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Member library · Full book</p>
          <div className="mt-6 flex flex-wrap items-start gap-4">
            {hasRealCoverUrl(coverUrl) ? (
              <div className={BOOK_COVER_THUMB_BOX_CLASS}>
                <BookCoverImage
                  bookId={book.id}
                  gutenbergId={book.gutenberg_id ?? undefined}
                  title={book.title}
                  author={book.author}
                  coverUrl={coverUrl ?? undefined}
                  className={BOOK_COVER_THUMB_CLASS}
                />
              </div>
            ) : null}
            <h1 className="min-w-0 flex-1 font-serif text-4xl leading-tight text-[#ffffff] md:text-5xl">
              {book.title}
            </h1>
          </div>

          <p className="mt-4 text-lg text-[#f5f2ed]">
            by{' '}
            {authorLink ? (
              <Link
                href={authorLink}
                className="font-medium text-[#c9a96e] underline decoration-[#c9a96e]/50 underline-offset-2 hover:text-white"
              >
                {book.author}
              </Link>
            ) : (
              <span>{book.author}</span>
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={
                guestCookbook
                  ? `/books/${book.id}/read?guest=cookbook`
                  : `/books/${book.id}/read`
              }
              className="inline-block w-full border-2 border-[#c9a96e] bg-[#c9a96e] px-6 py-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d4b87a] sm:w-auto"
            >
              Read now
            </Link>
            <SaveBookButton bookId={book.id} />
          </div>

          <dl className="mt-8 grid gap-4 border-y border-white/15 py-6 sm:grid-cols-2">
            {book.rating != null && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Rating</dt>
                <dd className="mt-1 font-serif text-2xl text-[#ffffff]">
                  {Number(book.rating).toFixed(1)} ★
                </dd>
              </div>
            )}
            {book.year != null && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Year</dt>
                <dd className="mt-1 text-lg text-[#ffffff]">{book.year}</dd>
              </div>
            )}
            {book.pages != null && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Length</dt>
                <dd className="mt-1 text-lg text-[#ffffff]">{book.pages} pages</dd>
              </div>
            )}
            {book.category && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Shelf</dt>
                <dd className="mt-1 text-lg text-[#ffffff]">
                  {categoryLabel(book.category)}
                  {book.subcategory ? ` · ${subcategoryLabel(book.subcategory)}` : ''}
                </dd>
              </div>
            )}
          </dl>

          {preview && (
            <section className="mt-8">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">About this book</h2>
              <p className="mt-4 text-base leading-relaxed text-[#e8e4df]">{preview}</p>
            </section>
          )}

          {book.tags && book.tags.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Tags</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-white/25 px-3 py-1 text-xs uppercase tracking-wide text-[#f5f2ed]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Cover sources</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#e8e4df]/75">
              ReadAI loads the real jacket for this title by trying each source below in order until a
              usable image is found:{' '}
              {COVER_SOURCE_STEPS.map((s) => s.label).join(' → ')}. Auto-generated Gutenberg title
              cards are never used.
            </p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {coverSources.map((source) => (
                <li
                  key={`${source.sourceId}-${source.order}`}
                  className="border border-white/15 bg-white/[0.02] p-4 transition hover:border-[#c9a96e]/50"
                >
                  <a href={source.href} target="_blank" rel="noreferrer" className="block">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                      Source {source.order}
                    </p>
                    <p className="mt-2 font-serif text-lg text-[#ffffff]">{source.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#e8e4df]/80">{source.description}</p>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Legal sources</h2>
            <p className="mt-3 text-sm text-[#e8e4df]/75">
              ReadAI now connects this title to legal reading, search, and borrow sources beyond the
              club itself.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {sources.map((source) => (
                <li
                  key={source.id}
                  className="border border-white/15 bg-white/[0.02] p-4 transition hover:border-[#c9a96e]/50"
                >
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                      {sourceAccessLabel(source.access)}
                    </p>
                    <p className="mt-2 font-serif text-xl text-[#ffffff]">{source.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#e8e4df]/80">{source.tagline}</p>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap gap-4">
            {authorLink && (
              <Link
                href={authorLink}
                className="border border-[#c9a96e] px-5 py-2.5 text-xs uppercase tracking-wider text-[#c9a96e] transition hover:bg-[#c9a96e]/10"
              >
                More by {book.author}
              </Link>
            )}
            {aisle && (
              <Link
                href={`/genres/${aisle.id}`}
                className="border border-white/30 px-5 py-2.5 text-xs uppercase tracking-wider text-[#f5f2ed] transition hover:border-[#c9a96e] hover:text-[#c9a96e]"
              >
                Back to {aisle.title}
              </Link>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}
