import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { BookList, type ClubBookListItem } from '@/components/book-list'

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

async function resolveAuthorName(slug: string): Promise<string | null> {
  const rows = await sql`
    SELECT author
    FROM books
    WHERE lower(regexp_replace(trim(author), '[^a-zA-Z0-9]+', '-', 'g')) = ${slug}
      AND gutenberg_id IS NOT NULL
    AND cover_url IS NOT NULL
    AND cover_url NOT LIKE '%/cache/epub/%'
    AND (
      cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
      OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
    )
    GROUP BY author
    ORDER BY COUNT(*)::int DESC
    LIMIT 1
  `
  return rows[0]?.author ?? null
}

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: { slug: string } | Promise<{ slug: string }>
  searchParams: { page?: string | string[] } | Promise<{ page?: string | string[] }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const slug = resolvedParams.slug?.trim()
  if (!slug) notFound()

  const authorName = await resolveAuthorName(slug)
  if (!authorName) notFound()

  const requestedPage = parsePage(getSingleParam(resolvedSearchParams.page))

  const countResult = await sql`
    SELECT COUNT(*)::int as count
    FROM books
    WHERE author = ${authorName}
      AND gutenberg_id IS NOT NULL
    AND cover_url IS NOT NULL
    AND cover_url NOT LIKE '%/cache/epub/%'
    AND (
      cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
      OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
    )
  `
  const totalBooks = countResult[0]?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalBooks / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const offset = (page - 1) * PAGE_SIZE

  const books = await sql`
    SELECT id, title, author, rating, pages, gutenberg_id, cover_url
    FROM books
    WHERE author = ${authorName}
      AND gutenberg_id IS NOT NULL
    AND cover_url IS NOT NULL
    AND cover_url NOT LIKE '%/cache/epub/%'
    AND (
      cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
      OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
    )
    ORDER BY id DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `

  const prevPageHref =
    page <= 1 ? null : page - 1 === 1 ? `/authors/${slug}` : `/authors/${slug}?page=${page - 1}`
  const nextPageHref = page >= totalPages ? null : `/authors/${slug}?page=${page + 1}`

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#e8e4df] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <Link href="/genres" className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline">
            Back to the club shelves
          </Link>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Author shelf</p>
          <h1 className="mt-2 font-serif text-4xl text-[#f5f2ed] md:text-5xl">{authorName}</h1>
          <p className="mt-5 text-sm text-[#e8e4df]/70">
            <span className="font-serif text-2xl text-[#c9a96e] tabular-nums">
              {totalBooks.toLocaleString()}
            </span>{' '}
            {totalBooks === 1 ? 'book in the club' : 'books in the club'}
          </p>
        </div>

        {books.length === 0 ? (
          <p className="text-sm text-[#e8e4df]/80">No titles listed for this author yet.</p>
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
            <p className="text-xs uppercase tracking-[0.2em] text-[#e8e4df]/70">
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
