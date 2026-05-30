import Link from 'next/link'
import { matchKnownFilm } from '@/lib/movie-sources'

interface MovieSourceLinksProps {
  query: string
  compact?: boolean
}

/** Shown when a film search has no club library hit on the homepage. */
export function MovieSourceLinks({ query, compact = false }: MovieSourceLinksProps) {
  const trimmed = query.trim()
  if (!trimmed) return null

  const known = matchKnownFilm(trimmed)

  return (
    <p className={compact ? 'mt-3 text-sm text-[#eadfce]' : 'mt-2 text-sm text-[#eadfce]'}>
      {known ? (
        <>
          <span className="text-[#f5f2ed]">{known.title}</span>
          {known.year ? ` (${known.year})` : ''} is a film — open its book in the{' '}
        </>
      ) : (
        <>Open the film&apos;s book in the </>
      )}
      <Link href={`/movies?q=${encodeURIComponent(trimmed)}`} className="text-[#c9a96e] hover:underline">
        Movies section
      </Link>
      {known ? ' when it is on the club shelves.' : '.'}
    </p>
  )
}
