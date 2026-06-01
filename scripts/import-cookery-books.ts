/**
 * Import public-domain cookery books from Project Gutenberg (Gutendex search).
 * Usage: npx tsx scripts/import-cookery-books.ts [maxCount]
 */
import 'dotenv/config'
import { importGutenbergCookeryBooks } from '../lib/gutenberg-ingest'
import { fetchCookingShelfBooks } from '../lib/aisle-shelf-books'

const maxCount = Math.min(80, Math.max(1, Number(process.argv[2] || 60)))

async function main() {
  console.log(`Importing up to ${maxCount} cookery books from Project Gutenberg...`)

  const result = await importGutenbergCookeryBooks(maxCount)

  console.log(`Imported: ${result.imported}`)
  console.log(`Skipped: ${result.skipped}`)
  for (const book of result.titles) {
    console.log(`  · ${book.title} — ${book.author} (${book.words.toLocaleString()} words)`)
  }
  if (result.errors.length > 0) {
    console.log('Errors:')
    for (const err of result.errors) console.log(`  · ${err}`)
  }

  const shelf = await fetchCookingShelfBooks(1, 0)
  console.log(`Cooking shelf (readable covers): ${shelf.total} books`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
