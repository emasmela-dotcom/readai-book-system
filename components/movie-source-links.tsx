import Link from 'next/link'
import { matchKnownFilm } from '@/lib/movie-sources'

interface MovieSourceLinksProps {
  query: string
  compact?: boolean
}

/** Shown when a film search needs the Movies section. */
export function MovieSourceLinks({ query, compact = false }: MovieSourceLinksProps) {
  const trimmed = query.trim()
  if (!trimmed) return null

  const known = matchKnownFilm(trimmed)

  return (
    <p className={compact ? 'mt-3 text-sm text-[#eadfce]' : 'mt-2 text-sm text-[#eadfce]'}>
      {known ? (
        <>
          <span className="text-[#f5f2ed]">{known.title}</span>
          {known.year ? ` (${known.year})` : ''} is a film — open its movie book in the{' '}
        </>
      ) : (
        <>Open the film&apos;s movie book in the </>
      )}
      <Link href={`/movies?q=${encodeURIComponent(trimmed)}`} className="text-[#c9a96e] hover:underline">
        Movies section
      </Link>
      {known ? ' (connected sources).' : '.'}
    </p>
  )
}
