/**
 * Import full books in batches for a fixed duration.
 * Usage: npx tsx scripts/import-batches-hour.ts [startPage] [minutes]
 */
import 'dotenv/config'
import { importGutenbergBooks } from '../lib/gutenberg-ingest'
import { sql } from '../lib/db'
const BATCH = 20
const startPage = Math.max(1, Number(process.argv[2] || 13))
const minutes = Math.min(120, Math.max(1, Number(process.argv[3] || 60)))
const durationMs = minutes * 60 * 1000

async function fullBookCount(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM books
    WHERE gutenberg_id IS NOT NULL
  `
  return rows[0]?.count ?? 0
}

async function main() {
  const started = Date.now()
  let page = startPage
  let sessionImported = 0
  let batches = 0

  const initial = await fullBookCount()
  console.log(`Starting hour import: ${minutes} min, page ${page}, batch size ${BATCH}`)
  console.log(`Full books in library now: ${initial}`)

  while (Date.now() - started < durationMs) {
    const elapsedMin = Math.floor((Date.now() - started) / 60000)
    console.log(`\n--- Batch ${++batches} · Gutendex page ${page} · ${elapsedMin}m elapsed ---`)

    try {
      const result = await importGutenbergBooks(BATCH, page)
      sessionImported += result.imported
      console.log(
        `Imported ${result.imported}, skipped ${result.skipped}, session total +${sessionImported}`,
      )
      if (result.titles.length > 0) {
        for (const t of result.titles.slice(0, 5)) {
          console.log(`  · ${t.title} — ${t.author}`)
        }
        if (result.titles.length > 5) console.log(`  · …and ${result.titles.length - 5} more`)
      }
      if (result.errors.length > 0) {
        console.log(`Errors (first 3): ${result.errors.slice(0, 3).join('; ')}`)
      }
    } catch (err) {
      console.error('Batch failed, retrying next page in 15s:', err)
      await new Promise((r) => setTimeout(r, 15000))
    }

    page++
    await new Promise((r) => setTimeout(r, 4000))
  }

  const final = await fullBookCount()
  console.log(`\nDone. Full books: ${initial} → ${final} (+${final - initial} this run)`)
  console.log(`Session imported: ${sessionImported} titles across ${batches} batches`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
