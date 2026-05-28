/**
 * Keep only Gutenberg-backed metadata in Neon.
 *
 * Usage: npx tsx scripts/cleanup-placeholders.ts
 *        npx tsx scripts/cleanup-placeholders.ts --dry-run
 */
import 'dotenv/config'
import { sql } from '../lib/db'

const dryRun = process.argv.includes('--dry-run')
const BATCH = 2000

async function count(label: string, query: ReturnType<typeof sql>) {
  const rows = await query
  const n = (rows[0] as { n: number }).n
  console.log(`${label}: ${n.toLocaleString()}`)
  return n
}

async function main() {
  const total = await count(
    'Total rows',
    sql`SELECT COUNT(*)::int AS n FROM books`,
  )
  const full = await count(
    'Readable books (keeping)',
    sql`
      SELECT COUNT(*)::int AS n FROM books
      WHERE gutenberg_id IS NOT NULL
    `,
  )
  const removable = await count(
    'Rows to remove',
    sql`
      SELECT COUNT(*)::int AS n FROM books
      WHERE gutenberg_id IS NULL
    `,
  )
  const bodyTextColumn = await sql`
    SELECT COUNT(*)::int AS n
    FROM information_schema.columns
    WHERE table_name = 'books'
      AND column_name = 'body_text'
  `
  const hasBodyTextColumn = (bodyTextColumn[0] as { n: number }).n > 0

  if (removable === 0 && !hasBodyTextColumn) {
    console.log('Nothing to clean.')
    return
  }

  if (dryRun) {
    console.log('\nDry run only — no rows deleted.')
    return
  }

  if (hasBodyTextColumn) {
    console.log('\nDropping stored book text column…')
    await sql`ALTER TABLE books DROP COLUMN body_text`
    console.log('  dropped body_text')
  }

  console.log(`\nDeleting in batches of ${BATCH}…`)
  let deleted = 0
  while (true) {
    const batch = await sql`
      DELETE FROM books
      WHERE id IN (
        SELECT id FROM books
        WHERE gutenberg_id IS NULL
        LIMIT ${BATCH}
      )
      RETURNING id
    `
    const n = batch.length
    if (n === 0) break
    deleted += n
    console.log(`  deleted ${deleted.toLocaleString()} / ${removable.toLocaleString()}`)
  }

  const remaining = await count(
    'Rows after cleanup',
    sql`SELECT COUNT(*)::int AS n FROM books`,
  )

  console.log(`\nRemoved ${(total - remaining).toLocaleString()} rows without a readable source.`)
  console.log(`Readable books kept: ${full.toLocaleString()}`)

  try {
    await sql`VACUUM FULL ANALYZE books`
    console.log('Ran VACUUM FULL ANALYZE on books.')
  } catch (err) {
    console.warn('VACUUM FULL skipped:', err instanceof Error ? err.message : err)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
