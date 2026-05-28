/**
 * Fill books.cover_url for rows that have gutenberg_id but no cover yet.
 * Usage: npx tsx scripts/backfill-cover-urls.ts [batchSize] [maxBatches]
 */
import 'dotenv/config'
import { sql } from '../lib/db'
import { resolveBestCoverUrl } from '../lib/book-covers'

const batchSize = Math.min(50, Math.max(5, Number(process.argv[2] || 20)))
const maxBatches = Math.max(1, Number(process.argv[3] || 9999))
const concurrency = 5

async function processBook(row: {
  id: number
  gutenberg_id: number
  title: string
  author: string | null
}) {
  const coverUrl = await resolveBestCoverUrl(row.gutenberg_id, {
    title: row.title,
    author: row.author,
  })
  if (!coverUrl) return { id: row.id, updated: false }

  await sql`
    UPDATE books
    SET cover_url = ${coverUrl}
    WHERE id = ${row.id}
  `
  return { id: row.id, updated: true }
}

async function main() {
  try {
    await sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT`
  } catch {
    // column may already exist
  }

  let batches = 0
  let updated = 0
  let missing = 0

  while (batches < maxBatches) {
    const rows = await sql`
      SELECT id, gutenberg_id, title, author
      FROM books
      WHERE gutenberg_id IS NOT NULL
        AND cover_url IS NULL
      ORDER BY id ASC
      LIMIT ${batchSize}
    `

    if (rows.length === 0) {
      console.log('No more books need cover_url.')
      break
    }

    for (let i = 0; i < rows.length; i += concurrency) {
      const chunk = rows.slice(i, i + concurrency) as {
        id: number
        gutenberg_id: number
        title: string
        author: string | null
      }[]
      const results = await Promise.all(chunk.map(processBook))
      for (const r of results) {
        if (r.updated) updated++
        else missing++
      }
    }

    batches++
    console.log(`Batch ${batches}: processed ${rows.length} (total updated ${updated}, no cover ${missing})`)
  }

  const remaining = await sql`
    SELECT COUNT(*)::int AS count
    FROM books
    WHERE gutenberg_id IS NOT NULL AND cover_url IS NULL
  `
  console.log(`Done. Updated ${updated}. Still without cover: ${remaining[0]?.count ?? '?'}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
