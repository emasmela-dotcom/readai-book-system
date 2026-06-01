import Link from 'next/link'
import { CLIFF_NOTES_OFFICIAL } from '@/lib/cliff-notes-sources'

export function CliffNotesSourcesBlock() {
  return (
    <>
      <header className="border-b border-white/10 pb-6">
        <h2 className="font-serif text-2xl text-[#e8e4df] md:text-3xl">Cliff Notes</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
          Study guides and summaries live on CliffsNotes. ReadAI sends you to the official site — not
          a random shelf of unrelated public-domain books.
        </p>
      </header>

      <div className="mt-8 border border-white/10 bg-white/[0.02] p-6 md:p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e]">Official site</p>
        <h3 className="mt-2 font-serif text-2xl text-[#f5f2ed]">{CLIFF_NOTES_OFFICIAL.label}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#eadfce]">
          {CLIFF_NOTES_OFFICIAL.tagline}
        </p>
        <a
          href={CLIFF_NOTES_OFFICIAL.href}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block border-2 border-[#c9a96e] bg-[#c9a96e] px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84]"
        >
          Open CliffsNotes.com →
        </a>
        <p className="mt-3 text-xs text-[#eadfce]/80">Opens https://www.cliffsnotes.com in a new tab</p>
      </div>

      <p className="mt-8 text-sm text-[#eadfce]">
        Full classics to read here on the club:{' '}
        <Link href="/genres/literary" className="text-[#c9a96e] hover:underline">
          Literary room →
        </Link>
      </p>
    </>
  )
}
