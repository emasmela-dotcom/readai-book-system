import Link from 'next/link'
import { FOR_DUMMIES_OFFICIAL } from '@/lib/for-dummies-sources'

export function ForDummiesSourcesBlock() {
  return (
    <>
      <header className="border-b border-white/10 pb-6">
        <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">For Dummies</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
          The For Dummies series lives on the official Wiley site. ReadAI sends you there — not a
          pile of unrelated handbooks from the public-domain shelves.
        </p>
      </header>

      <div className="mt-8 border border-white/10 bg-white/[0.02] p-6 md:p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Official site</p>
        <h3 className="mt-2 font-serif text-2xl text-[#f5f2ed]">{FOR_DUMMIES_OFFICIAL.label}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
          {FOR_DUMMIES_OFFICIAL.tagline}
        </p>
        <a
          href={FOR_DUMMIES_OFFICIAL.href}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block border-2 border-[#c9a96e] bg-[#c9a96e] px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84]"
        >
          Open Dummies.com →
        </a>
        <p className="mt-3 text-xs text-[#eadfce]/80">Opens https://www.dummies.com in a new tab</p>
      </div>

      <p className="mt-8 text-sm text-[#eadfce]">
        Beginner-friendly public-domain how-to on the club:{' '}
        <Link href="/genres/textbooks" className="text-[#c9a96e] hover:underline">
          Learning shelf →
        </Link>
      </p>
    </>
  )
}
