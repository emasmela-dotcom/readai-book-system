'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookList, type ClubBookListItem } from '@/components/book-list'
import { HOME_SECTION_META, type HomeSectionId } from '@/lib/home-section-books'

export function ClubSectionBooksPanel({
  section,
  limit = 12,
}: {
  section: HomeSectionId
  limit?: number
}) {
  const meta = HOME_SECTION_META[section]
  const [books, setBooks] = useState<ClubBookListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ section, limit: String(limit), page: '1' })
        const res = await fetch(`/api/section-books?${params}`, { cache: 'no-store' })
        const data = await res.json()
        if (cancelled) return

        const rows = Array.isArray(data?.books) ? data.books : []
        const totalBooks = data?.pagination?.totalBooks
        setTotal(typeof totalBooks === 'number' ? totalBooks : rows.length)
        setBooks(
          rows.map((b: Record<string, unknown>) => ({
            id: b.id as number,
            title: (b.title as string) ?? 'Untitled',
            author: (b.author as string) ?? null,
            rating: b.rating != null ? Number(b.rating) : null,
            pages: (b.pages as number | null) ?? null,
            gutenbergId: (b.gutenberg_id as number | null) ?? null,
            coverUrl: (b.cover_url as string | null) ?? undefined,
          })),
        )
      } catch {
        if (!cancelled) {
          setBooks([])
          setTotal(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [section, limit])

  if (loading) {
    return <p className="text-sm text-[#eadfce]">Loading books from the club shelves…</p>
  }

  if (books.length === 0) {
    return <p className="text-sm text-[#eadfce]">{meta.emptyMessage}</p>
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[#eadfce]">
        <span className="font-medium text-[#f5f2ed]">{total.toLocaleString()}</span> on this shelf
        {total > books.length ? (
          <>
            {' '}
            · showing {books.length}
          </>
        ) : null}
      </p>
      <BookList books={books} />
      {total > books.length ? (
        <p className="mt-6">
          <Link
            href={meta.viewAllHref}
            className="text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline"
          >
            {meta.viewAllLabel} →
          </Link>
        </p>
      ) : null}
    </div>
  )
}

export function ClubSectionBooksBlock({
  section,
  limit = 12,
}: {
  section: HomeSectionId
  limit?: number
}) {
  const meta = HOME_SECTION_META[section]

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">{meta.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#eadfce]">{meta.description}</p>
        </div>
        <Link
          href={meta.viewAllHref}
          className="shrink-0 text-xs uppercase tracking-[0.2em] text-[#c9a96e] hover:underline"
        >
          {meta.viewAllLabel} →
        </Link>
      </div>
      <div className="mt-8">
        <ClubSectionBooksPanel section={section} limit={limit} />
      </div>
    </>
  )
}
