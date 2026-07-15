'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getLocaleFromPathname, switchLocalePath, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const pathname = usePathname() || '/'
  const locale = getLocaleFromPathname(pathname)
  const t = getDictionary(locale)

  const options: { locale: Locale; label: string }[] = [
    { locale: 'en', label: t.language.en },
    { locale: 'es', label: t.language.es },
  ]

  return (
    <nav
      className={`flex items-center gap-2 text-xs uppercase tracking-[0.15em] ${className}`}
      aria-label={t.language.label}
    >
      <span className="text-[#eadfce]/70">{t.language.label}:</span>
      {options.map((option) => {
        const active = option.locale === locale
        return (
          <Link
            key={option.locale}
            href={switchLocalePath(pathname, option.locale)}
            hrefLang={option.locale}
            className={
              active
                ? 'text-[#c9a96e] underline decoration-[#c9a96e]/60 underline-offset-2'
                : 'text-[#eadfce] hover:text-[#c9a96e]'
            }
            aria-current={active ? 'page' : undefined}
          >
            {option.label}
          </Link>
        )
      })}
    </nav>
  )
}
