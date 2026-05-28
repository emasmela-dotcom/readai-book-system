import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReaderModeSelect, type ReaderMode } from '@/components/reader-mode-select'
import { ReadingProgressTracker } from '@/components/reading-progress-tracker'
import { sql } from '@/lib/db'
import { authorHref } from '@/lib/author-slug'
import { buildBookSourceLinks, sourceAccessLabel } from '@/lib/book-sources'
import { formatPageText, paginateBookText, resolveBookBody } from '@/lib/book-body'

export const dynamic = 'force-dynamic'

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return 1
  return n
}

function parseMode(value: string | string[] | undefined): ReaderMode {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === 'scroll' ? 'scroll' : 'pages'
}

export default async function BookReadPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>
  searchParams:
    | { page?: string | string[]; mode?: string | string[] }
    | Promise<{ page?: string | string[]; mode?: string | string[] }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const bookId = Number(resolvedParams.id)
  if (!Number.isInteger(bookId) || bookId < 1) notFound()

  const rows = await sql`
    SELECT id, title, author, pages, gutenberg_id
    FROM books
    WHERE id = ${bookId}
    LIMIT 1
  `
  const book = rows[0] as
    | { id: number; title: string; author: string; pages: number | null; gutenberg_id: number | null }
    | undefined
  if (!book) notFound()

  const body = await resolveBookBody(book)
  if (!body) notFound()

  const mode = parseMode(resolvedSearchParams.mode)
  const requestedPage = parsePage(resolvedSearchParams.page)
  const { pageText, page, totalPages, wordCount } = paginateBookText(body.text, requestedPage)
  const pageParagraphs = formatPageText(pageText)
  const scrollParagraphs = formatPageText(body.text)
  const authorLink = authorHref(book.author)
  const sources = buildBookSourceLinks({
    title: book.title,
    author: book.author,
    gutenbergId: book.gutenberg_id,
  })

  const pageHref = (p: number) =>
    p <= 1
      ? `/books/${book.id}/read`
      : `/books/${book.id}/read?page=${p}`

  return (
    <main className="min-h-screen bg-[#0e0c0a] text-[#e8e4df]">
      <header className="sticky top-0 z-10 border-b border-white/15 bg-[#0e0c0a]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link
            href={`/books/${book.id}`}
            className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline"
          >
            ← Book details
          </Link>
          <p className="truncate text-sm text-[#f5f2ed] md:text-base">{book.title}</p>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-12">
        <ReadingProgressTracker
          bookId={book.id}
          title={book.title}
          author={book.author}
          page={page}
          totalPages={totalPages}
          mode={mode}
        />
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">
          Full book · ReadAI club library
        </p>
        <h1 className="mt-2 font-serif text-2xl leading-tight text-[#ffffff] md:text-3xl">{book.title}</h1>
        <div className="mt-4 flex flex-col gap-4 border-b border-white/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-[#e8e4df]/80">
            by{' '}
            {authorLink ? (
              <Link href={authorLink} className="text-[#c9a96e] hover:underline">
                {book.author}
              </Link>
            ) : (
              book.author
            )}
            <span className="text-[#e8e4df]/55">
              {' '}
              · {mode === 'pages' ? `Page ${page} of ${totalPages}` : 'Continuous scroll'} ·{' '}
              {wordCount.toLocaleString()} words
            </span>
          </p>
          <ReaderModeSelect mode={mode} />
        </div>

        <div className="club-reading-body mt-8 space-y-5">
          {(mode === 'pages' ? pageParagraphs : scrollParagraphs).map((paragraph, index) => (
            <p key={`${mode}-${page}-${index}`}>{paragraph}</p>
          ))}
        </div>

        {mode === 'pages' ? (
          <nav
            className="mt-10 flex items-center justify-between gap-4 border-t border-white/15 pt-6"
            aria-label="Page navigation"
          >
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="border border-white/25 px-4 py-2 text-xs uppercase tracking-wider text-[#f5f2ed] hover:border-[#c9a96e] hover:text-[#c9a96e]"
              >
                ← Previous
              </Link>
            ) : (
              <span className="border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-[#e8e4df]/35">
                ← Previous
              </span>
            )}
            <span className="text-xs uppercase tracking-[0.2em] text-[#e8e4df]/70">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="border border-[#c9a96e] px-4 py-2 text-xs uppercase tracking-wider text-[#c9a96e] hover:bg-[#c9a96e]/10"
              >
                Next →
              </Link>
            ) : (
              <span className="border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-[#e8e4df]/35">
                Next →
              </span>
            )}
          </nav>
        ) : (
          <div className="mt-10 border-t border-white/15 pt-6">
            <p className="text-sm text-[#e8e4df]/75">
              Scroll mode is on. Move naturally through the full text without manual page turns.
            </p>
          </div>
        )}

        <section className="mt-10 border-t border-white/15 pt-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">Other legal sources</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {sources.map((source) => (
              <a
                key={source.id}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#f5f2ed] transition hover:border-[#c9a96e] hover:text-[#c9a96e]"
              >
                {sourceAccessLabel(source.access)} {source.label}
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
