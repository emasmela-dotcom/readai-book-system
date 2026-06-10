import Link from 'next/link'
import { Suspense } from 'react'
import { SubscribeCheckout } from '@/components/subscribe-checkout'
import { trialDaysLeft } from '@/lib/auth/access'
import { getSessionUser } from '@/lib/auth/session'
import { isStripeConfigured } from '@/lib/stripe/client'

export const metadata = {
  title: 'Subscribe | ReadAI',
  description: 'Subscribe to continue reading on ReadAI Book Club.',
}

export default async function SubscribePage() {
  const user = await getSessionUser()
  const stripeReady = isStripeConfigured()

  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-lg">
        <nav className="mb-8 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Club home
          </Link>
        </nav>

        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Membership</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">Subscribe to keep reading</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
            Your 14-day trial has ended. Choose monthly or yearly membership to continue browsing
            books, shelves, and reading rooms.
          </p>
        </header>

        <div className="mt-8 space-y-4 border border-white/10 bg-[#171311] p-6">
          <p className="text-sm text-[#eadfce]">
            <span className="font-serif text-xl text-[#f5f2ed]">$9</span> / month
          </p>
          <p className="text-sm text-[#eadfce]">
            <span className="font-serif text-xl text-[#f5f2ed]">$79</span> / year{' '}
            <span className="text-[#c9a96e]">(save vs monthly)</span>
          </p>
          {user ? (
            <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96e]">
              Signed in as {user.email}
              {trialDaysLeft(user) > 0 ? ` · ${trialDaysLeft(user)} trial days left` : ''}
            </p>
          ) : null}

          <Suspense fallback={<p className="text-sm text-[#eadfce]">Loading checkout…</p>}>
            <SubscribeCheckout signedIn={Boolean(user)} stripeReady={stripeReady} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
