import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { BookList, type ClubBookListItem } from '@/components/book-list'
import { getAisleById } from '@/lib/bookstore-sections'

const PAGE_SIZE = 48

export const dynamic = 'force-dynamic'

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: { genre: string } | Promise<{ genre: string }>
  searchParams: { page?: string | string[] } | Promise<{ page?: string | string[] }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams)

  const aisle = getAisleById(resolvedParams.genre)
  if (!aisle) notFound()

  const requestedPage = parsePage(getSingleParam(resolvedSearchParams.page))

  const countResult = aisle.subcategory
    ? await sql`
        SELECT COUNT(*)::int as count
        FROM books
        WHERE category = ${aisle.category}
          AND subcategory = ${aisle.subcategory}
          AND gutenberg_id IS NOT NULL
      `
    : await sql`
        SELECT COUNT(*)::int as count
        FROM books
        WHERE category = ${aisle.category}
          AND gutenberg_id IS NOT NULL
      `

  const totalBooks = countResult[0]?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalBooks / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const offset = (page - 1) * PAGE_SIZE

  const books = aisle.subcategory
    ? await sql`
        SELECT id, title, author, rating, pages, gutenberg_id, cover_url
        FROM books
        WHERE category = ${aisle.category}
          AND subcategory = ${aisle.subcategory}
          AND gutenberg_id IS NOT NULL
        ORDER BY id DESC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `
    : await sql`
        SELECT id, title, author, rating, pages, gutenberg_id
        FROM books
        WHERE category = ${aisle.category}
          AND gutenberg_id IS NOT NULL
        ORDER BY id DESC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `

  const prevPageHref =
    page <= 1 ? null : page - 1 === 1 ? `/genres/${aisle.id}` : `/genres/${aisle.id}?page=${page - 1}`
  const nextPageHref = page >= totalPages ? null : `/genres/${aisle.id}?page=${page + 1}`

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#e8e4df] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <Link href="/#genres" className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline">
            Back to the club shelves
          </Link>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">{aisle.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#e8e4df]/70 md:text-base">{aisle.tagline}</p>
          <p className="mt-5 text-sm text-[#e8e4df]/70">
            <span className="font-serif text-2xl text-[#c9a96e] tabular-nums">
              {totalBooks.toLocaleString()}
            </span>{' '}
            full books in this genre
          </p>
        </div>

        {totalBooks === 0 ? (
          <p className="text-sm text-[#e8e4df]/80">
            Full books for this shelf are being added to the club library. Check back soon, or browse
            another genre from the homepage.
          </p>
        ) : books.length === 0 ? (
          <p className="text-sm text-[#e8e4df]/80">No books on this page.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-[#e8e4df]/80">
              Showing{' '}
              <span className="font-medium text-[#f5f2ed]">
                {(offset + 1).toLocaleString()}–{Math.min(offset + books.length, totalBooks).toLocaleString()}
              </span>{' '}
              of <span className="font-medium text-[#f5f2ed]">{totalBooks.toLocaleString()}</span> titles
            </p>
            <BookList
              books={books.map((b) => ({
                id: b.id,
                title: b.title,
                author: b.author,
                rating: b.rating != null ? Number(b.rating) : null,
                pages: b.pages,
                gutenbergId: b.gutenberg_id as number,
                coverUrl: (b.cover_url as string | null) ?? undefined,
              }))}
              startIndex={offset + 1}
            />
          </>
        )}

        {totalBooks > 0 && (
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#e8e4df]/55">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-3">
              {prevPageHref ? (
                <Link
                  href={prevPageHref}
                  className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-[#e8e4df]/70 transition hover:border-[#c9a96e] hover:text-[#c9a96e]"
                >
                  Previous
                </Link>
              ) : (
                <span className="border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-[#e8e4df]/35">
                  Previous
                </span>
              )}
              {nextPageHref ? (
                <Link
                  href={nextPageHref}
                  className="border border-[#c9a96e] px-4 py-2 text-xs uppercase tracking-wider text-[#c9a96e] transition hover:bg-[#c9a96e]/10"
                >
                  Next
                </Link>
              ) : (
                <span className="border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-[#e8e4df]/35">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
