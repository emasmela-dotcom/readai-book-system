import { ensureClubReadableBookWithStatus } from '@/lib/ensure-club-readable'
import { buildReadableSourceLinks } from '@/lib/book-sources'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function OpenBookPage({
  searchParams,
}: {
  searchParams: { title?: string | string[]; author?: string | string[] } | Promise<{
    title?: string | string[]
    author?: string | string[]
  }>
}) {
  const resolved = await Promise.resolve(searchParams)
  const title = getSingleParam(resolved.title)?.trim() ?? ''
  const author = getSingleParam(resolved.author)?.trim() || null

  if (!title) notFound()

  const result = await ensureClubReadableBookWithStatus(title, author)
  if (result.status === 'ready') redirect(`/books/${result.bookId}/read`)

  const sourceLinks = buildReadableSourceLinks({ title, author: author ?? '' })
  const retryHref = `/books/open?${new URLSearchParams({
    title,
    ...(author ? { author } : {}),
  }).toString()}`

  if (result.status === 'adding') {
    return (
      <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
        <div className="mx-auto max-w-lg">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Adding to the club</p>
          <h1 className="mt-2 font-serif text-2xl text-[#f5f2ed]">{title}</h1>
          {author ? <p className="mt-2 text-sm text-[#eadfce]">by {author}</p> : null}
          <p className="mt-4 text-sm leading-relaxed text-[#eadfce]">
            This is a public-domain title. ReadAI is loading it into the club now — refresh in a few
            seconds and it should open here.
          </p>
          <p className="mt-6">
            <Link href={retryHref} className="text-sm text-[#c9a96e] hover:underline">
              Try again now →
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Not in club</p>
        <h1 className="mt-2 font-serif text-2xl text-[#f5f2ed]">{title}</h1>
        {author ? <p className="mt-2 text-sm text-[#eadfce]">by {author}</p> : null}
        <p className="mt-4 text-sm leading-relaxed text-[#eadfce]">
          This title is not available for a full read in ReadAI while it is under copyright. Use a
          connected source below. Public-domain books are added to the club automatically when we can
          load them.
        </p>
        <ul className="mt-6 space-y-3">
          {sourceLinks.map((source) => (
            <li key={source.id}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] transition hover:border-[#c9a96e]/50"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                  {source.access}
                </span>
                <span className="mt-1 block font-medium">{source.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link href="/sources" className="text-sm text-[#c9a96e] hover:underline">
            All connected sources →
          </Link>
        </p>
      </div>
    </main>
  )
}
