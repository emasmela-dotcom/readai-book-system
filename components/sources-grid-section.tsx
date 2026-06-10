export interface SourceCardItem {
  id: string
  label: string
  tagline: string
  href: string
  accessLabel: string
}

export function SourcesGridSection({
  title,
  description,
  sources,
  hideAccessLabel = false,
}: {
  title: string
  description?: string
  sources: SourceCardItem[]
  hideAccessLabel?: boolean
}) {
  return (
    <section>
      <header className="border-b border-white/10 pb-6">
        <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#eadfce]">{description}</p>
        ) : null}
      </header>

      <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <li
            key={source.id}
            className="border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#c9a96e]/40"
          >
            <a href={source.href} target="_blank" rel="noreferrer" className="block">
              {hideAccessLabel ? null : (
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">{source.accessLabel}</p>
              )}
              <h3 className={`font-serif text-xl text-[#f5f2ed]${hideAccessLabel ? '' : ' mt-2'}`}>{source.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#eadfce]">{source.tagline}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
