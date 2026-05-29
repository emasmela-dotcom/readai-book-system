import { hasRealCoverUrl } from '@/lib/book-covers'
import { sql } from '@/lib/db'

export { hasRealCoverUrl } from '@/lib/book-covers'

/**
 * Featured shelves vs user lookup:
 * - **Featured** (homepage tiles, genre/author browse, rotating covers): use `realCoverAnd` so we
 *   never promote a title with a fake/placeholder jacket.
 * - **User lookup** (search, direct /books/[id], read): all full-text books stay findable; show a
 *   real cover image only when `hasRealCoverUrl` — never a decorative title tile.
 */

/**
 * SQL AND-clause: only rows whose cover_url is a real jacket (PG scan or Open Library edition art).
 * Compose: `WHERE gutenberg_id IS NOT NULL ${realCoverAnd}`
 */
export const realCoverAnd = sql`AND cover_url IS NOT NULL
  AND cover_url NOT LIKE '%/cache/epub/%'
  AND (
    cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
    OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
  )`
