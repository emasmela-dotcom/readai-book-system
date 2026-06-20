import { BOOKSTORE_AISLES } from '@/lib/bookstore-sections'
import { CURATED_CLASSICS } from '@/lib/curated-classics'
import { sql } from '@/lib/db'
import { fetchGenreSourceShelf, genreAisleHasSourceShelf } from '@/lib/genre-source-shelves'
import {
  fetchGutendexPage,
  fetchGutendexSearch,
  pickPlainTextUrl,
  type GutendexBook,
} from '@/lib/gutenberg'

const PICKS_PER_DAY = 8
const SOURCE_TIMEOUT_MS = 5_000
const UA = 'ReadAI-Book-Club/1.0'

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

const ARCHIVE_QUERIES = [
  'fiction',
  'literature',
  'novel',
  'poetry',
  'adventure',
  'history',
  'biography',
  'essays',
] as const

const SOURCE_AISLE_IDS = BOOKSTORE_AISLES.map((aisle) => aisle.id).filter((id) =>
  genreAisleHasSourceShelf(id),
)

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

/** Project Gutenberg via Gutendex — 70k+ public-domain titles. */
async function fetchGutendexPagePicks(day: number, count: number): Promise<DailyPick[]> {
  const page = (day * 13) % 2200 + 1
  const catalog = await withSourceTimeout(fetchGutendexPage(page))
  if (!catalog?.results?.length) return []

  return catalog.results
    .map(gutendexToPick)
    .filter((pick): pick is DailyPick => pick != null)
    .slice(0, count)
}

/** Gutendex subject search — rotates genre/topic daily. */
async function fetchGutendexSearchPicks(day: number, count: number): Promise<DailyPick[]> {
  const subject = GUTENDEX_SUBJECTS[day % GUTENDEX_SUBJECTS.length]
  const page = Math.floor(day / GUTENDEX_SUBJECTS.length) % 40 + 1
  const catalog = await withSourceTimeout(fetchGutendexSearch(subject, page))
  if (!catalog?.results?.length) return []

  return catalog.results
    .map(gutendexToPick)
    .filter((pick): pick is DailyPick => pick != null)
    .slice(0, count)
}

/** Open Library — millions of works by subject/room. */
async function fetchOpenLibraryPicks(day: number, count: number): Promise<DailyPick[]> {
  if (SOURCE_AISLE_IDS.length === 0) return []

  const aisleId = SOURCE_AISLE_IDS[day % SOURCE_AISLE_IDS.length]
  const offset = Math.floor(day / SOURCE_AISLE_IDS.length) * count

  const shelf = await withSourceTimeout(fetchGenreSourceShelf(aisleId, count * 2, offset))
  if (!shelf?.books.length) return []

  return shelf.books
    .map((book) => ({
      title: book.title.trim(),
      author: book.author?.trim() || 'Unknown author',
    }))
    .filter((book) => book.title.length > 0)
    .slice(0, count)
}

/** Internet Archive texts — broad digitized library. */
async function fetchArchivePicks(day: number, count: number): Promise<DailyPick[]> {
  const topic = ARCHIVE_QUERIES[day % ARCHIVE_QUERIES.length]
  const page = Math.floor(day / ARCHIVE_QUERIES.length) + 1
  const params = new URLSearchParams({
    q: `${topic} AND mediatype:texts AND language:English`,
    fl: 'identifier,title,creator',
    rows: String(count * 2),
    page: String(page),
    output: 'json',
  })

  const res = await withSourceTimeout(
    fetch(`https://archive.org/advancedsearch.php?${params.toString()}`, {
      cache: 'no-store',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
    }),
  )
  if (!res?.ok) return []

  const data = (await res.json()) as {
    response?: { docs?: { title?: string; creator?: string | string[] }[] }
  }

  return (data.response?.docs ?? [])
    .map((doc) => {
      const title = doc.title?.trim()
      if (!title || title.length < 2) return null
      const creator = doc.creator
      const author = Array.isArray(creator)
        ? creator[0]?.trim()
        : typeof creator === 'string'
          ? creator.trim()
          : ''
      return { title: shortenTitle(title), author: author || 'Unknown author' }
    })
    .filter((pick): pick is DailyPick => pick != null)
    .slice(0, count)
}

/** Open Library search — broad catalog beyond subject shelves. */
async function fetchOpenLibrarySearchPicks(day: number, count: number): Promise<DailyPick[]> {
  const topics = [
    'classic literature',
    'adventure stories',
    'mystery fiction',
    'romance fiction',
    'science fiction',
    'historical fiction',
    'biography',
    'poetry',
    'philosophy',
    'travel writing',
  ] as const
  const q = topics[day % topics.length]
  const offset = Math.floor(day / topics.length) * count
  const params = new URLSearchParams({
    q,
    limit: String(count * 2),
    offset: String(offset),
    fields: 'key,title,author_name',
  })

  const res = await withSourceTimeout(
    fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
      cache: 'no-store',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
    }),
  )
  if (!res?.ok) return []

  const data = (await res.json()) as {
    docs?: { title?: string; author_name?: string[] }[]
  }

  return (data.docs ?? [])
    .map((doc) => {
      const title = doc.title?.trim()
      if (!title) return null
      return {
        title,
        author: doc.author_name?.[0]?.trim() || 'Unknown author',
      }
    })
    .filter((pick): pick is DailyPick => pick != null)
    .slice(0, count)
}

/** Local Neon shelf — club library when already imported. */
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
 * Eight book-club picks from connected sources — new set each UTC day.
 * Pulls from Project Gutenberg, Open Library, Internet Archive, and the club catalog.
 */
export async function getDailyClubPicks(count = PICKS_PER_DAY): Promise<DailyPick[]> {
  const day = epochDay()
  const perSource = Math.max(3, Math.ceil(count / 2))

  const [gutenbergPage, gutenbergSearch, openLibrary, openLibrarySearch, archive, catalog] =
    await Promise.allSettled([
      fetchGutendexPagePicks(day, perSource),
      fetchGutendexSearchPicks(day, perSource),
      fetchOpenLibraryPicks(day, perSource),
      fetchOpenLibrarySearchPicks(day, perSource),
      fetchArchivePicks(day, perSource),
      fetchCatalogPicks(day, perSource).catch(() => [] as DailyPick[]),
    ])

  const pools: DailyPick[][] = [
    gutenbergPage.status === 'fulfilled' ? gutenbergPage.value : [],
    gutenbergSearch.status === 'fulfilled' ? gutenbergSearch.value : [],
    openLibrary.status === 'fulfilled' ? openLibrary.value : [],
    openLibrarySearch.status === 'fulfilled' ? openLibrarySearch.value : [],
    archive.status === 'fulfilled' ? archive.value : [],
    catalog.status === 'fulfilled' ? catalog.value : [],
  ]

  let picks = mergeUniquePicks(pools, day, count)

  if (picks.length < count) {
    const fallback = curatedDailyPicks(count * 2, day)
    picks = mergeUniquePicks([picks, fallback], day, count)
  }

  return picks
}
