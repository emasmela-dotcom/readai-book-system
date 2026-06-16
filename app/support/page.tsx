import Link from 'next/link'
import { SupportForm } from '@/components/support-form'

export const metadata = {
  title: 'Support | ReadAI',
  description: 'Contact ReadAI support.',
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-md">
        <nav className="mb-8 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Club home
          </Link>
        </nav>

        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Support</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">Contact us</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
            Send a message from here — your email app will not open. We save it and reply to the
            address you enter.
          </p>
        </header>

        <SupportForm />
      </div>
    </main>
  )
}
