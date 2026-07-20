import { MAGAZINE_SOURCES } from '@/lib/magazine-sources'

export function MagazineSourcesBlock() {
  return (
    <>
      <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Magazine picks for variety</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
        Today&apos;s magazines and journals — open their sites for essays, fiction, news, and culture.
      </p>
      <p className="mt-2 text-xs text-[#eadfce]/85">
        External sites may require their own subscription.
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MAGAZINE_SOURCES.map((source) => (
          <li
            key={source.id}
            className="border border-white/10 bg-[#171311] p-5 transition hover:border-[#c9a96e]/40"
          >
            <a href={source.href} target="_blank" rel="noreferrer" className="block">
              <h3 className="font-serif text-xl text-[#f5f2ed]">{source.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#eadfce]">{source.tagline}</p>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
