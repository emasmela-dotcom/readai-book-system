import Link from 'next/link'
import { headers } from 'next/headers'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocaleFromPathname, localizedPath, type Locale } from '@/lib/i18n/config'

function resolveLocale(): Locale {
  const headerLocale = headers().get('x-locale')
  if (headerLocale === 'es' || headerLocale === 'en') return headerLocale
  return 'en'
}

export function SiteFooter() {
  const locale = resolveLocale()
  const t = getDictionary(locale)

  return (
    <footer className="border-t border-white/10 px-5 py-8 text-center md:px-8">
      <p className="text-xs tracking-wide text-[#e8e4df]/70">{t.footer.copyright}</p>
      <p className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-[#eadfce]">
        <Link
          href={localizedPath(locale, '/support')}
          className="text-[#c9a96e] hover:text-[#d8be84] hover:underline"
        >
          {t.footer.support}
        </Link>
        <LanguageSwitcher />
      </p>
    </footer>
  )
}
