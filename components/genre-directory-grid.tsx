import Link from 'next/link'
import { localizedPath, type Locale } from '@/lib/i18n/config'

export interface GenreDirectoryItem {
  id: string
  title: string
  tagline: string
  count: number
}

export function GenreDirectoryGrid({
  sections,
  locale = 'en',
}: {
  sections: GenreDirectoryItem[]
  locale?: Locale
}) {
  if (sections.length === 0) {
    return (
      <p className="mt-8 text-sm text-[#e8e4df]/70">
        {locale === 'es'
          ? 'Las salas de lectura se están cargando desde las fuentes conectadas.'
          : 'Reading rooms are loading from connected sources.'}
      </p>
    )
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <li key={section.id}>
          <Link
            href={localizedPath(locale, `/genres/${section.id}`)}
            className="group flex h-full flex-col border border-white/10 bg-[#16110d] p-5 transition hover:border-[#c9a96e]/50 hover:bg-[#1a1410]"
          >
            <h3 className="font-serif text-xl text-[#f5f2ed] transition group-hover:text-[#c9a96e]">
              {section.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[#e8e4df]/75">{section.tagline}</p>
            <p className="mt-4 text-xs uppercase tracking-wider text-[#c9a96e]">
              {section.count.toLocaleString()}{' '}
              {locale === 'es' ? 'títulos vía fuentes' : 'titles via sources'}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
