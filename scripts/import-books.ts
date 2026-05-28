/**
 * Seed full public-domain books into Neon.
 * Usage: npx tsx scripts/import-books.ts [count] [gutendexPage]
 */
import 'dotenv/config'
import { importCuratedGutenbergBooks, importGutenbergBooks } from '../lib/gutenberg-ingest'

const args = process.argv.slice(2)
const useCurated = args.includes('--curated') || args.includes('-c')
const numericArgs = args.filter((a) => !a.startsWith('-'))
const count = Math.min(50, Math.max(1, Number(numericArgs[0] || 15)))
const page = Math.max(1, Number(numericArgs[1] || 1))

async function main() {
  let result

  if (useCurated) {
    console.log(`Importing up to ${count} curated full books from Project Gutenberg...`)
    result = await importCuratedGutenbergBooks(count)
  } else {
    console.log(`Importing ${count} full books from Gutendex page ${page}...`)
    try {
      result = await importGutenbergBooks(count, page)
    } catch (err) {
      console.warn('Gutendex failed, using curated Project Gutenberg list:', err)
      result = await importCuratedGutenbergBooks(count)
    }
  }
  console.log(`Imported: ${result.imported}`)
  console.log(`Skipped: ${result.skipped}`)
  for (const book of result.titles) {
    console.log(`  · ${book.title} — ${book.author} (${book.words.toLocaleString()} words)`)
  }
  if (result.errors.length > 0) {
    console.log('Errors:', result.errors.join('\n'))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
