import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SourceShelfBookList } from '@/components/source-shelf-book-list'
import {
  fetchGenreSourceShelf,
  genreAisleHasSourceShelf,
  genreSourceBrowseLinks,
} from '@/lib/genre-source-shelves'
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

  if (aisle.id === 'movie-books') {
    return (
      <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#e8e4df] md:px-8 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Link href="/genres" className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline">
            Back to all rooms
          </Link>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">{aisle.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#e8e4df]/70 md:text-base">{aisle.tagline}</p>
          <p className="mt-6 text-sm text-[#e8e4df]/80">
            Film tie-in books live in the{' '}
            <Link href="/movies" className="text-[#c9a96e] hover:underline">
              Movies &amp; movie books
            </Link>{' '}
            room.
          </p>
        </div>
      </main>
    )
  }

  if (!genreAisleHasSourceShelf(aisle.id)) {
    return (
      <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#e8e4df] md:px-8 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Link href="/genres" className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline">
            Back to all rooms
          </Link>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">{aisle.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#e8e4df]/70 md:text-base">{aisle.tagline}</p>
          <p className="mt-6 text-sm text-[#e8e4df]/80">
            Browse titles via{' '}
            <Link href="/sources" className="text-[#c9a96e] hover:underline">
              connected sources
            </Link>
            .
          </p>
        </div>
      </main>
    )
  }

  const requestedPage = parsePage(getSingleParam(resolvedSearchParams.page))
  const sourceShelf = await fetchGenreSourceShelf(aisle.id, PAGE_SIZE, (requestedPage - 1) * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(Math.max(sourceShelf.total, 1) / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const offset = (page - 1) * PAGE_SIZE
  const browseLinks = genreSourceBrowseLinks(aisle)
  const prevPageHref =
    page <= 1 ? null : page - 1 === 1 ? `/genres/${aisle.id}` : `/genres/${aisle.id}?page=${page - 1}`
  const nextPageHref =
    page >= totalPages || sourceShelf.total === 0
      ? null
      : `/genres/${aisle.id}?page=${page + 1}`

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#e8e4df] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <Link href="/genres" className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline">
            Back to all rooms
          </Link>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">{aisle.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#e8e4df]/70 md:text-base">{aisle.tagline}</p>
          <p className="mt-5 text-sm text-[#e8e4df]/70">
            <span className="font-serif text-2xl text-[#c9a96e] tabular-nums">
              {sourceShelf.total > 0 ? sourceShelf.total.toLocaleString() : '—'}
            </span>{' '}
            titles via connected sources
          </p>
          <p className="mt-2 text-xs text-[#eadfce]/80">
            Each title links to legal source searches — Gutenberg, Open Library, and more. ReadAI does not
            host a private book catalog.
          </p>
          {browseLinks.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-3">
              {browseLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-wider text-[#c9a96e] hover:underline"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {sourceShelf.books.length === 0 ? (
          <p className="text-sm text-[#e8e4df]/80">
            No titles loaded for this room right now. Try{' '}
            <Link href="/sources" className="text-[#c9a96e] hover:underline">
              connected sources
            </Link>{' '}
            or another{' '}
            <Link href="/genres" className="text-[#c9a96e] hover:underline">
              reading room
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-[#e8e4df]/80">
              Showing{' '}
              <span className="font-medium text-[#f5f2ed]">
                {(offset + 1).toLocaleString()}–
                {Math.min(offset + sourceShelf.books.length, sourceShelf.total).toLocaleString()}
              </span>{' '}
              of <span className="font-medium text-[#f5f2ed]">{sourceShelf.total.toLocaleString()}</span>{' '}
              titles
            </p>
            <SourceShelfBookList books={sourceShelf.books} startIndex={offset + 1} />
          </>
        )}

        {sourceShelf.total > 0 && (
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
                  className="border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-[#c9a96e] transition hover:border-[#c9a96e] hover:text-[#c9a96e]"
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
