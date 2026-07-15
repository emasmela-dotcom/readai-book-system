export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Strip /es prefix so auth and public-route checks stay the same. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/es') return '/'
  if (pathname.startsWith('/es/')) {
    const rest = pathname.slice(3)
    return rest.startsWith('/') ? rest : `/${rest}`
  }
  return pathname
}

export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname === '/es' || pathname.startsWith('/es/')) return 'es'
  return 'en'
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (locale === 'en') return normalized === '' ? '/' : normalized
  if (normalized === '/') return '/es'
  return `/es${normalized}`
}

/** Switch language while staying on the same page. */
export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const bare = stripLocalePrefix(pathname)
  return localizedPath(nextLocale, bare)
}
