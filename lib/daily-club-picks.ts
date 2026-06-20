import { CURATED_CLASSICS } from '@/lib/curated-classics'
import { sql } from '@/lib/db'
import {
  fetchGutendexPage,
  fetchGutendexSearch,
  pickPlainTextUrl,
  type GutendexBook,
} from '@/lib/gutenberg'

const PICKS_PER_DAY = 8
const SOURCE_TIMEOUT_MS = 6_000

export type DailyPick = { title: string; author: string }

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

/** English Gutendex hit with a plain-text full read available. */
function gutendexToPick(book: GutendexBook): DailyPick | null {
  if (!book.languages?.includes('en')) return null
  if (!pickPlainTextUrl(book.formats)) return null
  const title = shortenTitle(book.title?.trim() ?? '')
  if (!title) return null
  return {
    title,
    author: book.authors?.[0]?.name?.trim() || 'Unknown author',
  }
}

async function withSourceTimeout<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), SOURCE_TIMEOUT_MS)
      }),
    ])
  } catch {
    return null
  }
}

function collectReadableGutendex(
  books: GutendexBook[] | undefined,
  seen: Set<string>,
  picks: DailyPick[],
  count: number,
): void {
  for (const book of books ?? []) {
    if (picks.length >= count) return
    const pick = gutendexToPick(book)
    if (!pick) continue
    const key = normaliseTitleKey(pick.title)
    if (!key || seen.has(key)) continue
    seen.add(key)
    picks.push(pick)
  }
}

/** Project Gutenberg via Gutendex — only titles with plain-text full reads. */
async function fetchGutendexReadablePicks(day: number, count: number): Promise<DailyPick[]> {
  const page = (day * 13) % 2200 + 1
  const subject = GUTENDEX_SUBJECTS[day % GUTENDEX_SUBJECTS.length]
  const searchPage = Math.floor(day / GUTENDEX_SUBJECTS.length) % 40 + 1
  const extraPage = (page + 37) % 2200 + 1

  const [pageCatalog, searchCatalog, extraCatalog] = await Promise.all([
    withSourceTimeout(fetchGutendexPage(page)),
    withSourceTimeout(fetchGutendexSearch(subject, searchPage)),
    withSourceTimeout(fetchGutendexPage(extraPage)),
  ])

  const seen = new Set<string>()
  const picks: DailyPick[] = []
  collectReadableGutendex(pageCatalog?.results, seen, picks, count)
  collectReadableGutendex(searchCatalog?.results, seen, picks, count)
  collectReadableGutendex(extraCatalog?.results, seen, picks, count)

  return picks
}

/** Imported club library — rows tied to Gutenberg full reads. */
async function fetchCatalogPicks(day: number, count: number): Promise<DailyPick[]> {
  const seed = String(day)
  const rows = await sql`
    SELECT title, author FROM (
      SELECT DISTINCT ON (LOWER(TRIM(title)))
        id,
        title,
        author
      FROM books
      WHERE gutenberg_id IS NOT NULL
        AND title IS NOT NULL
        AND TRIM(title) <> ''
      ORDER BY LOWER(TRIM(title)), id
    ) AS deduped
    ORDER BY md5(concat(id::text, ${seed}))
    LIMIT ${count}
  `

  return rows
    .map((row) => ({
      title: String(row.title ?? '').trim(),
      author: String(row.author ?? '').trim() || 'Unknown author',
    }))
    .filter((row) => row.title.length > 0)
}

function curatedDailyPicks(count: number, day: number): DailyPick[] {
  const pool = CURATED_CLASSICS.map((e) => ({
    title: shortenTitle(e.title),
    author: e.author,
  }))
  const week = Math.floor(day / 7)
  return shufflePool(pool, `readai-curated-w${week}-d${day}`).slice(0, count)
}

function mergeUniquePicks(pools: DailyPick[][], day: number, count: number): DailyPick[] {
  const seen = new Set<string>()
  const merged: DailyPick[] = []

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

/**
 * Eight full-read book-club picks — new set each UTC day.
 * Only Project Gutenberg titles with plain-text editions, plus imported club library rows.
 */
export async function getDailyClubPicks(count = PICKS_PER_DAY): Promise<DailyPick[]> {
  const day = epochDay()

  const [gutenberg, catalog] = await Promise.allSettled([
    fetchGutendexReadablePicks(day, count * 2),
    fetchCatalogPicks(day, count).catch(() => [] as DailyPick[]),
  ])

  const pools: DailyPick[][] = [
    gutenberg.status === 'fulfilled' ? gutenberg.value : [],
    catalog.status === 'fulfilled' ? catalog.value : [],
  ]

  let picks = mergeUniquePicks(pools, day, count)

  if (picks.length < count) {
    picks = mergeUniquePicks([picks, curatedDailyPicks(count * 2, day)], day, count)
  }

  return picks
}
