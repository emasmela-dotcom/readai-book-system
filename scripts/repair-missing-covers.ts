/**
 * Resolve cover_url only for books that do not have one yet.
 * Usage: npx tsx scripts/repair-missing-covers.ts
 */
import 'dotenv/config'
import { sql } from '../lib/db'
import { resolveBestCoverUrl } from '../lib/book-covers'

const concurrency = 3

async function main() {
  const rows = await sql`
    SELECT id, gutenberg_id, title, author
    FROM books
    WHERE gutenberg_id IS NOT NULL AND cover_url IS NULL
    ORDER BY id ASC
  `

  let found = 0
  for (let i = 0; i < rows.length; i += concurrency) {
    const chunk = rows.slice(i, i + concurrency) as {
      id: number
      gutenberg_id: number
      title: string
      author: string | null
    }[]
    await Promise.all(
      chunk.map(async (row) => {
        const coverUrl = await resolveBestCoverUrl(row.gutenberg_id, {
          title: row.title,
          author: row.author,
        })
        if (coverUrl) {
          found++
          await sql`UPDATE books SET cover_url = ${coverUrl} WHERE id = ${row.id}`
        }
      }),
    )
    if ((i + concurrency) % 30 === 0 || i + concurrency >= rows.length) {
      console.log(`Checked ${Math.min(i + concurrency, rows.length)} / ${rows.length}, found ${found}`)
    }
  }

  const left = await sql`
    SELECT COUNT(*)::int AS count FROM books
    WHERE gutenberg_id IS NOT NULL AND cover_url IS NULL
  `
  console.log(`Done. Added ${found} covers. Still missing: ${left[0]?.count ?? '?'}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
