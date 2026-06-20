import { CURATED_CLASSICS } from '@/lib/curated-classics'
import { sql } from '@/lib/db'

const PICKS_PER_DAY = 8

export type DailyPick = { title: string; author: string }

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

function shufflePool<T extends { title: string }>(pool: T[], seed: string): T[] {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = seededIndex(seed, i + 1, i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Fallback when DB is empty or unavailable — still rotates daily. */
function curatedDailyPicks(count: number, day: number): DailyPick[] {
  const pool = CURATED_CLASSICS.map((e) => ({
    title: shortenTitle(e.title),
    author: e.author,
  }))
  const week = Math.floor(day / 7)
  return shufflePool(pool, `readai-curated-w${week}-d${day}`).slice(0, count)
}

/** Eight readable titles from the full club library — new set each UTC day. */
export async function getDailyClubPicks(count = PICKS_PER_DAY): Promise<DailyPick[]> {
  const day = epochDay()
  const seed = String(day)

  try {
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

    const picks = rows
      .map((row) => ({
        title: String(row.title ?? '').trim(),
        author: String(row.author ?? '').trim() || 'Unknown author',
      }))
      .filter((row) => row.title.length > 0)

    if (picks.length >= Math.min(count, 1)) {
      return picks.slice(0, count)
    }
  } catch (error) {
    console.error('[daily-club-picks] DB lookup failed:', error)
  }

  return curatedDailyPicks(count, day)
}
