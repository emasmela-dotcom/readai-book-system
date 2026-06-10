import Link from 'next/link'
import { SavedBooksShelf } from '@/components/saved-books-shelf'

export const metadata = {
  title: 'Saved Books | ReadAI',
  description: 'Your saved books on your ReadAI account.',
}

export default function SavedBooksPage() {
  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Club home
          </Link>
          <span className="text-[#d4cdc4]">/</span>
          <span className="text-[#f5f2ed]">Saved books</span>
        </nav>

        <header className="border-b border-white/10 pb-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Your shelf</p>
          <h1 className="mt-3 font-serif text-4xl text-[#f5f2ed] md:text-5xl">Saved books</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#eadfce]">
            Each saved entry keeps the book and where you stopped (page or scroll position) on your
            account. Tap <span className="text-[#f5f2ed]">Save place</span> while reading to update
            it.
          </p>
        </header>

        <section className="mt-10">
          <SavedBooksShelf />
        </section>
      </div>
    </main>
  )
}
