const PUBLIC_PATHS = new Set([
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/sources',
  '/subscribe',
  '/support',
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
]

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith('/api/auth')) return true
  return PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  )
}
