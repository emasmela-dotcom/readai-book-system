'use client'

import { type FormEvent, useState } from 'react'
import { MovieBookCoverPreview } from '@/components/movie-book-cover-preview'

export function MovieSearchPanel({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery.trim())
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)
    setActiveQuery(trimmed)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="movie-search" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
            Film title
          </label>
          <input
            id="movie-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. The Godfather"
            className="mt-2 w-full border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] outline-none placeholder:text-[#b8aea3] focus:border-[#c9a96e]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84] disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Search sources'}
        </button>
      </form>

      {activeQuery ? (
        <div className="mt-6 border-t border-white/10 pt-6">
          <MovieBookCoverPreview query={activeQuery} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#eadfce]">
          Enter a film title to see connected source links for its movie book.
        </p>
      )}
    </div>
  )
}
