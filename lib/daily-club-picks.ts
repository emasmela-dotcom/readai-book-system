import { CURATED_CLASSICS } from '@/lib/curated-classics'
import {
  gutenbergScannedCoverUrl,
  isRealCoverUrl,
  resolveBestCoverUrl,
} from '@/lib/book-covers'
import { sql } from '@/lib/db'
import { clubOpenHref } from '@/lib/club-open-href'
import {
  fetchGutendexPage,
  fetchGutendexSearch,
  pickPlainTextUrl,
  type GutendexBook,
} from '@/lib/gutenberg'

const PICKS_PER_DAY = 8
const SOURCE_TIMEOUT_MS = 6_000
const COVER_TIMEOUT_MS = 3_500

export type DailyPickSeed = {
  title: string
  author: string
  gutenbergId: number
  dbId?: number
  coverUrl?: string | null
}

export type DailyReadablePick = {
  title: string
  author: string | null
  coverUrl: string | null
  gutenbergId: number
  readHref: string
  sourceLabel: string
  bookId: number | null
}

const GUTENDEX_SUBJECTS = [
  'fiction',
  'adventure',
  'mystery',
  'romance',
  'science fiction',
  'biography',
  'history',
  'poetry',
  'fantasy',
  'drama',
  'philosophy',
  'travel',
] as const

function epochDay(): number {
  return Math.floor(Date.now() / 86400000)
}

function seededIndex(seed: string, max: number, salt: number): number {
  let h = 0
  const s = seed + String(salt)
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) % max
}

function shortenTitle(title: string): string {
  return title.replace(/; Or,.*/i, '').trim()
}

function normaliseTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function shufflePool<T extends { title: string }>(pool: T[], seed: string): T[] {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = seededIndex(seed, i + 1, i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function gutendexToSeed(book: GutendexBook): DailyPickSeed | null {
  if (!book.languages?.includes('en')) return null
  if (!pickPlainTextUrl(book.formats)) return null
  const title = shortenTitle(book.title?.trim() ?? '')
  if (!title) return null
  return {
    title,
    author: book.authors?.[0]?.name?.trim() || 'Unknown author',
    gutenbergId: book.id,
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), ms)
      }),
    ])
  } catch {
    return null
  }
}

function collectReadableGutendex(
  books: GutendexBook[] | undefined,
  seen: Set<string>,
  picks: DailyPickSeed[],
  count: number,
): void {
  for (const book of books ?? []) {
    if (picks.length >= count) return
    const seed = gutendexToSeed(book)
    if (!seed) continue
    const key = normaliseTitleKey(seed.title)
    if (!key || seen.has(key)) continue
    seen.add(key)
    picks.push(seed)
  }
}

async function fetchGutendexReadableSeeds(day: number, count: number): Promise<DailyPickSeed[]> {
  const page = (day * 13) % 2200 + 1
  const subject = GUTENDEX_SUBJECTS[day % GUTENDEX_SUBJECTS.length]
  const searchPage = Math.floor(day / GUTENDEX_SUBJECTS.length) % 40 + 1
  const extraPage = (page + 37) % 2200 + 1

  const [pageCatalog, searchCatalog, extraCatalog] = await Promise.all([
    withTimeout(fetchGutendexPage(page), SOURCE_TIMEOUT_MS),
    withTimeout(fetchGutendexSearch(subject, searchPage), SOURCE_TIMEOUT_MS),
    withTimeout(fetchGutendexPage(extraPage), SOURCE_TIMEOUT_MS),
  ])

  const seen = new Set<string>()
  const picks: DailyPickSeed[] = []
  collectReadableGutendex(pageCatalog?.results, seen, picks, count)
  collectReadableGutendex(searchCatalog?.results, seen, picks, count)
  collectReadableGutendex(extraCatalog?.results, seen, picks, count)

  return picks
}

/** Club catalog rows — in-app full reads with real cover art. */
async function fetchCatalogSeeds(day: number, count: number): Promise<DailyPickSeed[]> {
  const seed = String(day)
  const rows = await sql`
    SELECT id, title, author, cover_url, gutenberg_id FROM (
      SELECT DISTINCT ON (LOWER(TRIM(title)))
        id,
        title,
        author,
        cover_url,
        gutenberg_id
      FROM books
      WHERE gutenberg_id IS NOT NULL
        AND title IS NOT NULL
        AND TRIM(title) <> ''
        AND cover_url IS NOT NULL
        AND cover_url NOT LIKE '%/cache/epub/%'
        AND (
          cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
          OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
        )
      ORDER BY LOWER(TRIM(title)), id
    ) AS deduped
    ORDER BY md5(concat(id::text, ${seed}))
    LIMIT ${count}
  `

  const picks: DailyPickSeed[] = []
  for (const row of rows) {
    const gutenbergId = row.gutenberg_id
    const title = String(row.title ?? '').trim()
    if (typeof gutenbergId !== 'number' || !title) continue
    picks.push({
      title,
      author: String(row.author ?? '').trim() || 'Unknown author',
      gutenbergId,
      dbId: Number(row.id),
      coverUrl: typeof row.cover_url === 'string' ? row.cover_url : null,
    })
  }
  return picks
}

function curatedDailySeeds(count: number, day: number): DailyPickSeed[] {
  const pool = CURATED_CLASSICS.map((e) => ({
    title: shortenTitle(e.title),
    author: e.author,
    gutenbergId: e.id,
  }))
  const week = Math.floor(day / 7)
  return shufflePool(pool, `readai-curated-w${week}-d${day}`).slice(0, count)
}

function mergeUniqueSeeds(pools: DailyPickSeed[][], day: number, count: number): DailyPickSeed[] {
  const seen = new Set<string>()
  const merged: DailyPickSeed[] = []

  for (const pool of pools) {
    for (const pick of pool) {
      const key = normaliseTitleKey(pick.title)
      if (!key || seen.has(key)) continue
      seen.add(key)
      merged.push(pick)
    }
  }

  return shufflePool(merged, String(day)).slice(0, count)
}

async function getDailyPickSeeds(count = PICKS_PER_DAY): Promise<DailyPickSeed[]> {
  const day = epochDay()

  const catalog = await fetchCatalogSeeds(day, count * 3).catch(() => [] as DailyPickSeed[])
  let picks = mergeUniqueSeeds([catalog], day, count)

  if (picks.length < count) {
    const gutenberg = await fetchGutendexReadableSeeds(day, (count - picks.length) * 4)
    picks = mergeUniqueSeeds([picks, gutenberg], day, count)
  }

  if (picks.length < count) {
    picks = mergeUniqueSeeds([picks, curatedDailySeeds(count * 2, day)], day, count)
  }

  return picks
}

async function resolveReadableMatches(seeds: DailyPickSeed[]): Promise<DailyReadablePick[]> {
  const gutenbergIds = [...new Set(seeds.map((s) => s.gutenbergId))]

  const dbRows =
    gutenbergIds.length > 0
      ? await sql`
          SELECT id, title, author, cover_url, gutenberg_id
          FROM books
          WHERE gutenberg_id = ANY(${gutenbergIds})
        `
      : []

  const byGutenberg = new Map<number, (typeof dbRows)[number]>()
  for (const row of dbRows) {
    if (typeof row.gutenberg_id === 'number') {
      byGutenberg.set(row.gutenberg_id, row)
    }
  }

  return seeds.map((seed) => {
    const row = byGutenberg.get(seed.gutenbergId)
    const dbId = seed.dbId ?? (typeof row?.id === 'number' ? Number(row.id) : null)
    const title = String(row?.title ?? seed.title).trim()
    const author =
      (typeof row?.author === 'string' ? row.author.trim() : null) ||
      seed.author ||
      null
    let coverUrl =
      (typeof row?.cover_url === 'string' && row.cover_url.trim()) ||
      seed.coverUrl ||
      gutenbergScannedCoverUrl(seed.gutenbergId)

    if (coverUrl && !isRealCoverUrl(coverUrl)) {
      coverUrl = gutenbergScannedCoverUrl(seed.gutenbergId)
    }

    if (dbId) {
      return {
        title,
        author,
        coverUrl,
        gutenbergId: seed.gutenbergId,
        readHref: `/books/${dbId}/read`,
        sourceLabel: 'ReadAI · full read',
        bookId: dbId,
      }
    }

    return {
      title,
      author,
      coverUrl,
      gutenbergId: seed.gutenbergId,
      readHref: clubOpenHref(title, author),
      sourceLabel: 'ReadAI · full read',
      bookId: null,
    }
  })
}

async function enrichPickCovers(picks: DailyReadablePick[]): Promise<DailyReadablePick[]> {
  return Promise.all(
    picks.map(async (pick) => {
      if (pick.coverUrl && isRealCoverUrl(pick.coverUrl)) return pick

      const resolved = await withTimeout(
        resolveBestCoverUrl(pick.gutenbergId, { title: pick.title, author: pick.author }),
        COVER_TIMEOUT_MS,
      )

      return {
        ...pick,
        coverUrl: resolved ?? pick.coverUrl ?? gutenbergScannedCoverUrl(pick.gutenbergId),
      }
    }),
  )
}

/** Eight full-read book club picks — cover cards, in-app when imported. */
export async function getDailyClubReadableMatches(count = PICKS_PER_DAY): Promise<DailyReadablePick[]> {
  const seeds = await getDailyPickSeeds(count)
  const matches = await resolveReadableMatches(seeds)
  const withCovers = await enrichPickCovers(matches)
  return withCovers.slice(0, count)
}
