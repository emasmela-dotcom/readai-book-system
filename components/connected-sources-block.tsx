import { CONNECTED_SOURCES, sourceAccessLabel } from '@/lib/book-sources'
import { SourcesGridSection } from '@/components/sources-grid-section'

/** Connected book sources only — full reference is on /sources. */
export function ConnectedSourcesBlock() {
  return (
    <SourcesGridSection
      title="Connected sources"
      description="Legal book sites linked from ReadAI — Gutenberg, Open Library, Internet Archive, Libby, WorldCat, and more."
      sources={CONNECTED_SOURCES.map((source) => ({
        id: source.id,
        label: source.label,
        tagline: source.tagline,
        href: source.href,
        accessLabel: sourceAccessLabel(source.access),
      }))}
    />
  )
}
