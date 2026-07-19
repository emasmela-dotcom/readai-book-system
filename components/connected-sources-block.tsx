import { CONNECTED_SOURCES, sourceAccessLabel } from '@/lib/book-sources'
import { SourcesGridSection } from '@/components/sources-grid-section'
import { getDictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'

/** Connected book sources only — full reference is on /sources. */
export function ConnectedSourcesBlock({ locale = 'en' }: { locale?: Locale }) {
  const t = getDictionary(locale)
  return (
    <SourcesGridSection
      title={t.home.connectedSourcesTitle}
      description={t.home.connectedSourcesBody}
      sources={CONNECTED_SOURCES.map((source) => ({
        id: source.id,
        label: source.label,
        tagline: source.tagline,
        href: source.href,
        accessLabel: sourceAccessLabel(source.access, locale),
      }))}
    />
  )
}
