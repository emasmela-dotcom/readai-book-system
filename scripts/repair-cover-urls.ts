/**
 * Re-resolve real cover_url (scanned PG or Open Library edition art only).
 * Usage: npx tsx scripts/repair-cover-urls.ts [batchSize]
 */
import 'dotenv/config'
import { rm } from 'fs/promises'
import { join } from 'path'
import { sql } from '../lib/db'
import { resolveBestCoverUrl } from '../lib/book-covers'

const batchSize = Math.min(30, Math.max(5, Number(process.argv[2] || 15)))
const concurrency = 3
const CACHE_DIR = join(process.cwd(), '.cache', 'book-covers')

async function processBook(row: {
  id: number
  gutenberg_id: number
  cover_url: string | null
  title: string
  author: string | null
}) {
  const coverUrl = await resolveBestCoverUrl(row.gutenberg_id, {
    title: row.title,
    author: row.author,
  })
  const changed = coverUrl !== row.cover_url
  await sql`
    UPDATE books
    SET cover_url = ${coverUrl}
    WHERE id = ${row.id}
  `
  if (changed) {
    try {
      await rm(join(CACHE_DIR, `${row.id}.jpg`), { force: true })
    } catch {
      // ignore
    }
  }
  return { id: row.id, changed, hasCover: Boolean(coverUrl) }
}

async function main() {
  const cleared = await sql`
    UPDATE books
    SET cover_url = NULL
    WHERE cover_url LIKE '%/cache/epub/%'
    RETURNING id
  `
  console.log(`Cleared ${cleared.length} auto-generated (fake) cover URLs.`)

  let offset = 0
  let changed = 0
  let withCover = 0
  let processed = 0

  while (true) {
    const rows = await sql`
      SELECT id, gutenberg_id, cover_url, title, author
      FROM books
      WHERE gutenberg_id IS NOT NULL
      ORDER BY id ASC
      LIMIT ${batchSize}
      OFFSET ${offset}
    `

    if (rows.length === 0) break

    for (let i = 0; i < rows.length; i += concurrency) {
      const chunk = rows.slice(i, i + concurrency) as {
        id: number
        gutenberg_id: number
        cover_url: string | null
        title: string
        author: string | null
      }[]
      const results = await Promise.all(chunk.map(processBook))
      for (const r of results) {
        processed++
        if (r.changed) changed++
        if (r.hasCover) withCover++
      }
    }

    offset += rows.length
    console.log(`Processed ${processed} (${withCover} real covers, ${changed} updated)`)
  }

  const fakeLeft = await sql`
    SELECT COUNT(*)::int AS count
    FROM books
    WHERE cover_url IS NOT NULL AND cover_url LIKE '%/cache/epub/%'
  `
  const missing = await sql`
    SELECT COUNT(*)::int AS count
    FROM books
    WHERE gutenberg_id IS NOT NULL AND cover_url IS NULL
  `
  console.log(
    `Done. ${processed} books, ${withCover} with real covers, ${changed} rows changed, ${fakeLeft[0]?.count ?? 0} fake URLs left, ${missing[0]?.count ?? '?'} without cover.`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
