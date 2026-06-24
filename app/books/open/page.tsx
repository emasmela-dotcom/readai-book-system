import { ensureClubReadableBookWithStatus } from '@/lib/ensure-club-readable'
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

  const retryHref = `/books/open?${new URLSearchParams({
    title,
    ...(author ? { author } : {}),
  }).toString()}`

  if (result.status === 'copyrighted') {
    return (
      <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
        <div className="mx-auto max-w-lg">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Still under copyright</p>
          <h1 className="mt-2 font-serif text-2xl text-[#f5f2ed]">{title}</h1>
          {author ? <p className="mt-2 text-sm text-[#eadfce]">by {author}</p> : null}
          <p className="mt-4 text-sm leading-relaxed text-[#eadfce]">
            ReadAI only hosts full-text public-domain books. This title is still protected by
            copyright, so it cannot be opened in the reader.
          </p>
          <p className="mt-8">
            <Link href="/genres" className="text-sm text-[#eadfce] hover:text-[#c9a96e] hover:underline">
              ← Back to reading rooms
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Opening book</p>
        <h1 className="mt-2 font-serif text-2xl text-[#f5f2ed]">{title}</h1>
        {author ? <p className="mt-2 text-sm text-[#eadfce]">by {author}</p> : null}
        <p className="mt-4 text-sm leading-relaxed text-[#eadfce]">
          ReadAI is loading this public-domain book now. Tap try again — it usually opens in a few
          seconds.
        </p>
        <p className="mt-6">
          <Link href={retryHref} className="text-sm text-[#c9a96e] hover:underline">
            Try again now →
          </Link>
        </p>
        <p className="mt-8">
          <Link href="/genres" className="text-sm text-[#eadfce] hover:text-[#c9a96e] hover:underline">
            ← Back to reading rooms
          </Link>
        </p>
      </div>
    </main>
  )
}
