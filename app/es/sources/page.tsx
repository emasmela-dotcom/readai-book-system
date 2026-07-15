import Link from 'next/link'
import type { Metadata } from 'next'
import { FullSourcesDirectory } from '@/components/full-sources-directory'
import { LanguageSwitcher } from '@/components/language-switcher'
import { CONNECTED_SOURCES } from '@/lib/book-sources'
import { COOKBOOK_SOURCES } from '@/lib/cookbook-sources'
import { MAGAZINE_SOURCES } from '@/lib/magazine-sources'
import { CONNECTED_MOVIE_SOURCES } from '@/lib/movie-sources'
import { getDictionary } from '@/lib/i18n/dictionaries'

const REFERENCE_SECTION_COUNT = 4
const REFERENCE_LINK_COUNT =
  CONNECTED_SOURCES.length + CONNECTED_MOVIE_SOURCES.length + COOKBOOK_SOURCES.length + MAGAZINE_SOURCES.length

export const metadata: Metadata = {
  title: getDictionary('es').sources.title,
  description: getDictionary('es').sources.description,
  alternates: {
    canonical: '/es/sources',
    languages: { en: '/sources', es: '/es/sources' },
  },
}

export default function SpanishSourcesPage() {
  const t = getDictionary('es')

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em]">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/es" className="text-[#c9a96e] hover:underline">
              {t.auth.clubHome}
            </Link>
            <span className="text-[#d4cdc4]">/</span>
            <span className="text-[#f5f2ed]">{t.nav.sources}</span>
          </div>
          <LanguageSwitcher />
        </nav>

        <header className="border-b border-white/10 pb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">{t.nav.sources}</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed] md:text-4xl">{t.sources.heading}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
            {t.sources.description} {REFERENCE_SECTION_COUNT} secciones · {REFERENCE_LINK_COUNT} enlaces.
          </p>
        </header>

        <div className="mt-10">
          <FullSourcesDirectory />
        </div>
      </div>
    </main>
  )
}
