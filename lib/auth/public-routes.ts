const PUBLIC_PATHS = new Set([
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/sources',
  '/subscribe',
  '/support',
  '/genres/cooking',
  '/books/open',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
])

const PUBLIC_API_PREFIXES = [
  '/api/auth',
  '/api/stripe/webhook',
  '/api/club-search',
  '/api/support',
  '/api/movie-book-cover',
  '/api/storefront',
  '/api/genre-listings',
  '/api/book-cover-map',
  '/api/home-covers',
  '/api/book-count',
  '/api/book-cover/',
  '/api/stripe/config-check',
]

/** Book detail + reader routes are public at the edge; pages enforce club vs free cookbook. */
const PUBLIC_BOOK_PATH = /^\/books\/\d+(\/read)?$/

/** IndexNow ownership keys live at /{key}.txt in public/. */
const INDEXNOW_KEY_FILE = /^\/[a-zA-Z0-9-]{8,128}\.txt$/

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (PUBLIC_BOOK_PATH.test(pathname)) return true
  if (INDEXNOW_KEY_FILE.test(pathname)) return true
  if (pathname.startsWith('/api/auth')) return true
  return PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  )
}
