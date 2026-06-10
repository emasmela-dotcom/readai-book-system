type ArchiveMetadata = {
  title?: string
  isBorrowRestricted: boolean
}

type ArchiveSearchHit = {
  identifier: string
  title: string
}

const UA = 'ReadAI-Book-Club/1.0'
const METADATA_CACHE = new Map<string, ArchiveMetadata | null>()
const METADATA_CACHE_MAX = 200

/** Screenplays and shooting scripts are not book-club reads. */
export function isScreenplayOrScriptTitle(title: string): boolean {
  return /\bscreenplay\b|\bshooting script\b|\bscreen play\b/i.test(title)
}

export function isPublicReadSourceLabel(sourceLabel: string): boolean {
  return /\bread\b/i.test(sourceLabel) && !/\bsearch\b/i.test(sourceLabel)
}

function normaliseArchiveTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Archive hits must clearly match the film title — not dental pulp, candy, NASA docs, etc. */
export function scoreFilmArchiveTitle(
  filmTitle: string,
  hitTitle: string,
  bookSearchQuery?: string,
): number {
  const film = normaliseArchiveTitle(filmTitle)
  const hit = normaliseArchiveTitle(hitTitle)
  if (!film || !hit) return -1

  if (hit === film) return 100
  if (hit.startsWith(`${film} `)) return 90
  if (hit.startsWith(`the ${film}`)) return 88

  const filmWords = film.split(' ').filter(Boolean)
  if (filmWords.length >= 2) {
    if (!hit.includes(film)) return -1
  } else {
    const solo = filmWords[0]
    if (!(hit === solo || hit.startsWith(`${solo} `) || hit.startsWith(`the ${solo} `) || hit.startsWith(`the ${solo}`))) {
      return -1
    }
  }

  const queryWords = normaliseArchiveTitle(bookSearchQuery ?? '')
    .split(' ')
    .filter((word) => word.length >= 4 && !filmWords.includes(word))
  if (queryWords.length > 0 && !queryWords.some((word) => hit.includes(word))) {
    return -1
  }

  if (/\bv\b|\binc\b|\bcourt\b|\bergic\b|\bgov\b|\bnasa\b|\bnstr\b|\bcandy\b|\bchewy\b|\bdreams\b|\bv-\d/i.test(hitTitle)) {
    return -1
  }
  if (/\bcollector\b|\bspecial edition\b|\bclassification\b/i.test(hitTitle)) return -1
  if (film === 'pulp fiction' && /\bclassroom\b|\bchess\b|\bmedieval\b|\bvitality\b|\bdental\b|\b18\d{2}\b/i.test(hit)) {
    return -1
  }

  return 75
}

/** Public Archive texts that actually match a film's book title. */
export async function searchFilmArchiveBook(
  filmTitle: string,
  bookSearchQuery?: string,
): Promise<ArchiveSearchHit | null> {
  const attempts = [`title:"${filmTitle}"`, bookSearchQuery?.trim(), `${filmTitle} novel`, `${filmTitle} book`].filter(
    (value): value is string => Boolean(value),
  )

  for (const attempt of [...new Set(attempts)]) {
    const hit = await searchPublicArchiveTexts(attempt)
    if (!hit) continue
    if (isScreenplayOrScriptTitle(hit.title)) continue
    if (scoreFilmArchiveTitle(filmTitle, hit.title, bookSearchQuery) < 70) continue
    return hit
  }

  return null
}

/** Opens Internet Archive BookReader when the item is publicly readable. */
export function archivePublicReadHref(identifier: string): string {
  const id = identifier.trim().replace(/^\/details\//, '').replace(/^\/stream\//, '')
  return `https://archive.org/details/${encodeURIComponent(id)}/mode/2up`
}

export function archiveDetailsHref(identifier: string): string {
  const id = identifier.trim().replace(/^\/details\//, '')
  return `https://archive.org/details/${encodeURIComponent(id)}`
}

export function isArchiveBorrowRestricted(metadata: Record<string, unknown> | undefined): boolean {
  const flag = metadata?.['access-restricted-item']
  return flag === true || flag === 'true'
}

export async function fetchArchiveMetadata(archiveId: string): Promise<ArchiveMetadata | null> {
  const id = archiveId.trim()
  if (!id) return null

  if (METADATA_CACHE.has(id)) {
    return METADATA_CACHE.get(id) ?? null
  }

  try {
    const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': UA },
    })
    if (!res.ok) {
      METADATA_CACHE.set(id, null)
      return null
    }
    const data = (await res.json()) as { metadata?: Record<string, unknown> }
    const metadata = data.metadata
    if (!metadata) {
      METADATA_CACHE.set(id, null)
      return null
    }
    const parsed: ArchiveMetadata = {
      title: typeof metadata.title === 'string' ? metadata.title : undefined,
      isBorrowRestricted: isArchiveBorrowRestricted(metadata),
    }
    if (METADATA_CACHE.size >= METADATA_CACHE_MAX) {
      const firstKey = METADATA_CACHE.keys().next().value
      if (firstKey) METADATA_CACHE.delete(firstKey)
    }
    METADATA_CACHE.set(id, parsed)
    return parsed
  } catch {
    METADATA_CACHE.set(id, null)
    return null
  }
}

async function runArchiveSearch(query: string): Promise<ArchiveSearchHit | null> {
  const params = new URLSearchParams({
    q: `mediatype:texts AND NOT access-restricted-item:true AND (${query})`,
    fl: 'identifier,title',
    rows: '5',
    output: 'json',
  })
  const res = await fetch(`https://archive.org/advancedsearch.php?${params}`, {
    cache: 'no-store',
    headers: { 'User-Agent': UA },
  })
  if (!res.ok) return null
  const data = (await res.json()) as {
    response?: { docs?: Array<{ identifier?: string; title?: string }> }
  }
  const doc = data.response?.docs?.find((row) => {
    if (!row.identifier?.trim()) return false
    const title = row.title?.trim() ?? ''
    return title && !isScreenplayOrScriptTitle(title)
  })
  if (!doc?.identifier) return null
  return {
    identifier: doc.identifier.trim(),
    title: doc.title?.trim() || doc.identifier.trim(),
  }
}

export async function searchPublicArchiveTexts(query: string): Promise<ArchiveSearchHit | null> {
  const q = query.trim()
  if (!q) return null

  const words = q.replace(/[:"]/g, ' ').split(/\s+/).filter(Boolean)
  const attempts = [
    `title:(${q})`,
    words.length >= 2 ? `title:(${words[0]}) AND title:(${words[words.length - 1]})` : q,
    words.slice(0, 3).join(' '),
    q,
  ]

  try {
    const uniqueAttempts = [...new Set(attempts)]
    const hits = await Promise.all(uniqueAttempts.map((attempt) => runArchiveSearch(attempt)))
    return hits.find((hit) => hit != null) ?? null
  } catch {
    return null
  }
}

/**
 * Prefer a publicly readable Archive item. Falls back to borrow-only details when nothing else exists.
 */
export async function resolveArchiveReadLink(
  archiveId: string,
  fallbackSearchQuery?: string,
): Promise<{ href: string; sourceLabel: string; archiveId: string; title?: string }> {
  const curatedMeta = await fetchArchiveMetadata(archiveId)

  if (curatedMeta && !curatedMeta.isBorrowRestricted) {
    return {
      href: archivePublicReadHref(archiveId),
      sourceLabel: 'Internet Archive · read',
      archiveId,
      title: curatedMeta.title,
    }
  }

  const searchTerms = [
    fallbackSearchQuery?.trim(),
    curatedMeta?.title?.trim(),
    archiveId.trim(),
  ].filter((value): value is string => Boolean(value))

  for (const term of searchTerms) {
    const hit = await searchPublicArchiveTexts(term)
    if (hit && !isScreenplayOrScriptTitle(hit.title)) {
      return {
        href: archivePublicReadHref(hit.identifier),
        sourceLabel: 'Internet Archive · read',
        archiveId: hit.identifier,
        title: hit.title,
      }
    }
  }

  return {
    href: archiveDetailsHref(archiveId),
    sourceLabel: 'Internet Archive · borrow',
    archiveId,
    title: curatedMeta?.title,
  }
}

/** Public BookReader only — never borrow-only or screenplay pages. */
export async function resolvePublicArchiveReadLink(
  archiveId: string,
  fallbackSearchQuery?: string,
  filmTitle?: string,
): Promise<{ href: string; sourceLabel: string; archiveId: string; title?: string } | null> {
  const curatedMeta = await fetchArchiveMetadata(archiveId)

  if (
    curatedMeta &&
    !curatedMeta.isBorrowRestricted &&
    !isScreenplayOrScriptTitle(curatedMeta.title ?? '')
  ) {
    return {
      href: archivePublicReadHref(archiveId),
      sourceLabel: 'Internet Archive · read',
      archiveId,
      title: curatedMeta.title,
    }
  }

  const titleHint = filmTitle?.trim() || fallbackSearchQuery?.trim() || curatedMeta?.title?.trim()
  if (!titleHint) return null

  const hit = await searchFilmArchiveBook(titleHint, fallbackSearchQuery)
  if (!hit) return null

  return {
    href: archivePublicReadHref(hit.identifier),
    sourceLabel: 'Internet Archive · read',
    archiveId: hit.identifier,
    title: hit.title,
  }
}

const MAX_IA_METADATA_CHECKS = 4

/** Pick the first Internet Archive identifier that is publicly readable. */
export async function firstPublicArchiveId(ids: string[]): Promise<string | null> {
  const candidates = ids
    .map((raw) => raw.trim())
    .filter((id) => id && !id.startsWith('isbn_'))
    .slice(0, MAX_IA_METADATA_CHECKS)

  if (candidates.length === 0) return null

  const checks = await Promise.all(
    candidates.map(async (id) => {
      const meta = await fetchArchiveMetadata(id)
      return meta && !meta.isBorrowRestricted ? id : null
    }),
  )

  return checks.find((id) => id != null) ?? null
}
