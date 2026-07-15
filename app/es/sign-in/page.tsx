import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const metadata: Metadata = {
  title: getDictionary('es').auth.signInTitle,
  description: getDictionary('es').auth.signInBody,
  alternates: {
    canonical: '/es/sign-in',
    languages: { en: '/sign-in', es: '/es/sign-in' },
  },
}

export default function SpanishSignInPage() {
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">{t.auth.signInEyebrow}</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">{t.auth.signInTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">{t.auth.signInBody}</p>
        </header>

        <Suspense fallback={<p className="mt-8 text-sm text-[#eadfce]">{t.auth.loading}</p>}>
          <AuthForm mode="sign-in" />
        </Suspense>
      </div>
    </main>
  )
}
