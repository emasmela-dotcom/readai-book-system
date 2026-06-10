import { CONNECTED_SOURCES, sourceAccessLabel } from '@/lib/book-sources'
import { COOKBOOK_SOURCES, cookbookAccessLabel } from '@/lib/cookbook-sources'
import { MAGAZINE_SOURCES, magazineAccessLabel } from '@/lib/magazine-sources'
import { CONNECTED_MOVIE_SOURCES, movieAccessLabel } from '@/lib/movie-sources'
import { SourcesGridSection } from '@/components/sources-grid-section'

export function FullSourcesDirectory() {
  return (
    <div className="space-y-16">
      <SourcesGridSection
        title="Connected sources"
        description="Read full public-domain books here on the club first. When you need another edition, preview, or library borrow, use these legal sites — not random shelf duplicates."
        sources={CONNECTED_SOURCES.map((source) => ({
          id: source.id,
          label: source.label,
          tagline: source.tagline,
          href: source.href,
          accessLabel: sourceAccessLabel(source.access),
        }))}
      />

      <SourcesGridSection
        title="Film & adaptation"
        description="Novelizations, tie-ins, screenplays, and film-related books when a title is not on the club shelves."
        sources={CONNECTED_MOVIE_SOURCES.map((source) => ({
          id: `movie-${source.id}`,
          label: source.label,
          tagline: source.tagline,
          href: source.href,
          accessLabel: movieAccessLabel(source.access),
        }))}
      />

      <SourcesGridSection
        title="Cookbooks & food writing"
        description="Kitchen classics, culinary history, and recipe collections from open collections."
        sources={COOKBOOK_SOURCES.map((source) => ({
          id: `cookbook-${source.id}`,
          label: source.label,
          tagline: source.tagline,
          href: source.href,
          accessLabel: cookbookAccessLabel(source.access),
        }))}
      />

      <SourcesGridSection
        title="Magazines & literary journals"
        description="Essays, fiction, news, culture, and journalism from major magazines worldwide. External sites may require their own subscription."
        hideAccessLabel
        sources={MAGAZINE_SOURCES.map((source) => ({
          id: source.id,
          label: source.label,
          tagline: source.tagline,
          href: source.href,
          accessLabel: magazineAccessLabel(source.access),
        }))}
      />
    </div>
  )
}
