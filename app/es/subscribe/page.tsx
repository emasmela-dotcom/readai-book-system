import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SubscribeCheckout } from '@/components/subscribe-checkout'
import { LanguageSwitcher } from '@/components/language-switcher'
import { trialDaysLeft } from '@/lib/auth/access'
import { getSessionUser } from '@/lib/auth/session'
import { isStripeConfigured } from '@/lib/stripe/client'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: getDictionary('es').subscribe.title,
  description: getDictionary('es').subscribe.description,
  alternates: {
    canonical: '/es/subscribe',
    languages: { en: '/subscribe', es: '/es/subscribe' },
  },
}

export default async function SpanishSubscribePage() {
  const t = getDictionary('es')
  const user = await getSessionUser()
  const stripeReady = isStripeConfigured()

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-lg">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em]">
          <Link href="/es" className="text-[#c9a96e] hover:underline">
            {t.auth.clubHome}
          </Link>
          <LanguageSwitcher />
        </nav>

        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Membresía</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">Suscríbete para seguir leyendo</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
            Tu prueba de 14 días terminó. Elige membresía mensual o anual para seguir explorando
            libros, estantes y salas de lectura.
          </p>
        </header>

        <div className="mt-8 space-y-4 border border-white/10 bg-[#171311] p-6">
          <p className="text-sm text-[#eadfce]">
            <span className="font-serif text-xl text-[#f5f2ed]">$9</span> / mes
          </p>
          <p className="text-sm text-[#eadfce]">
            <span className="font-serif text-xl text-[#f5f2ed]">$79</span> / año{' '}
            <span className="text-[#c9a96e]">(ahorro vs mensual)</span>
          </p>
          {user ? (
            <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96e]">
              Sesión: {user.email}
              {trialDaysLeft(user) > 0 ? ` · ${trialDaysLeft(user)} días de prueba` : ''}
            </p>
          ) : null}

          <Suspense fallback={<p className="text-sm text-[#eadfce]">Cargando pago…</p>}>
            <SubscribeCheckout
              signedIn={Boolean(user)}
              stripeReady={stripeReady}
              onProduction={Boolean(process.env.VERCEL)}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
