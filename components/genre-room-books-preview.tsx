'use client'

import Link from 'next/link'
import { BookList, type ClubBookListItem } from '@/components/book-list'

export interface RoomPreviewSection {
  id: string
  title: string
  tagline: string
  count: number
  books: {
    id: number
    title: string
    author: string
    rating?: number | null
    pages?: number | null
    gutenbergId?: number
    coverUrl?: string
  }[]
}

export function GenreRoomBooksPreview({ sections }: { sections: RoomPreviewSection[] }) {
  if (sections.length === 0) {
    return (
      <p className="mt-8 text-sm text-[#e8e4df]/70">
        Rooms are filling as books are added to the club library.
      </p>
    )
  }

  return (
    <ul className="mt-8 space-y-12">
      {sections.map((section) => {
        const listBooks: ClubBookListItem[] = section.books.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          rating: b.rating ?? null,
          pages: b.pages ?? null,
          gutenbergId: b.gutenbergId ?? null,
          coverUrl: b.coverUrl,
        }))

        return (
          <li key={section.id} id={`aisle-${section.id}`} className="border-t border-white/10 pt-10 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl text-[#e8e4df]">
                  <Link href={`/genres/${section.id}`} className="transition hover:text-[#c9a96e]">
                    {section.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm italic text-[#e8e4df]/70">{section.tagline}</p>
                <p className="mt-2 text-xs text-[#eadfce]">
                  {section.count.toLocaleString()} books on this shelf
                </p>
              </div>
              <Link
                href={`/genres/${section.id}`}
                className="text-xs uppercase tracking-wider text-[#c9a96e] hover:underline"
              >
                Full shelf →
              </Link>
            </div>
            {listBooks.length > 0 ? (
              <div className="mt-6">
                <BookList books={listBooks} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#eadfce]">Books loading for this room.</p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
