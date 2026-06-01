import { CONNECTED_SOURCES, sourceAccessLabel } from '@/lib/book-sources'

export function ConnectedSourcesBlock() {
  return (
    <>
      <header className="border-b border-white/10 pb-6">
        <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Connected sources</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
          Read full public-domain books here on the club first. When you need another edition,
          preview, or library borrow, use these legal sites — not random shelf duplicates.
        </p>
      </header>

      <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CONNECTED_SOURCES.map((source) => (
          <li
            key={source.id}
            className="border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#c9a96e]/40"
          >
            <a href={source.href} target="_blank" rel="noreferrer" className="block">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">
                {sourceAccessLabel(source.access)}
              </p>
              <h3 className="mt-2 font-serif text-xl text-[#f5f2ed]">{source.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#eadfce]">{source.tagline}</p>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
