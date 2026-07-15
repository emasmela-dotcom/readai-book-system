import Link from 'next/link'
import type { Metadata } from 'next'
import { SupportForm } from '@/components/support-form'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const metadata: Metadata = {
  title: getDictionary('es').support.title,
  description: getDictionary('es').support.description,
  alternates: {
    canonical: '/es/support',
    languages: { en: '/support', es: '/es/support' },
  },
}

export default function SpanishSupportPage() {
  const t = getDictionary('es')

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-md">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em]">
          <Link href="/es" className="text-[#c9a96e] hover:underline">
            {t.auth.clubHome}
          </Link>
          <LanguageSwitcher />
        </nav>

        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">{t.support.title}</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">Contáctanos</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
            Envía un mensaje desde aquí — no se abrirá tu correo. Recibirás una confirmación en
            el email que indiques, y te responderemos allí también.
          </p>
        </header>

        <SupportForm />
      </div>
    </main>
  )
}
