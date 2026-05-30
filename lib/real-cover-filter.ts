import { hasRealCoverUrl } from '@/lib/book-covers'

export { hasRealCoverUrl } from '@/lib/book-covers'

/**
 * Featured shelves vs user lookup:
 * - **Featured** (homepage tiles, genre/author browse, rotating covers): use the real-cover
 *   AND lines below in every Neon query (search/read APIs omit them).
 * - **User lookup** (search, direct /books/[id], read): all full-text books stay findable; show a
 *   real cover image only when `hasRealCoverUrl` — never a decorative title tile.
 *
 * @neondatabase/serverless cannot nest sql`` fragments — paste these lines after other WHERE
 * conditions instead of interpolating a shared fragment.
 */
export const REAL_COVER_AND_SQL = `AND cover_url IS NOT NULL
  AND cover_url NOT LIKE '%/cache/epub/%'
  AND (
    cover_url LIKE 'https://www.gutenberg.org/files/%/images/cover.jpg'
    OR cover_url LIKE 'https://covers.openlibrary.org/b/id/%'
  )` as const
