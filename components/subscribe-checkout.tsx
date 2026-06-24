'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function SubscribeCheckout({
  signedIn,
  stripeReady,
  onProduction = false,
}: {
  signedIn: boolean
  stripeReady: boolean
  onProduction?: boolean
}) {
  const searchParams = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const success = searchParams.get('success') === '1'
  const canceled = searchParams.get('canceled') === '1'

  async function startCheckout(plan: 'monthly' | 'yearly') {
    setError(null)
    setLoadingPlan(plan)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        setError(data.error ?? 'Could not start checkout.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  if (success) {
    return (
      <p className="text-sm text-[#f5f2ed]">
        Payment received. Your membership should unlock in a moment — refresh or return to{' '}
        <a href="/" className="text-[#c9a96e] hover:underline">
          club home
        </a>
        .
      </p>
    )
  }

  if (!signedIn) {
    return (
      <p className="text-sm text-[#eadfce]">
        <a href="/sign-in?next=/subscribe" className="text-[#c9a96e] hover:underline">
          Sign in
        </a>{' '}
        to subscribe.
      </p>
    )
  }

  if (!stripeReady) {
    return (
      <p className="text-sm text-[#eadfce]">
        {onProduction
          ? 'Checkout is not available yet. Stripe keys may need a redeploy in Vercel — contact support if this persists.'
          : (
              <>
                Add <span className="text-[#f5f2ed]">STRIPE_SECRET_KEY</span> to your local{' '}
                <span className="text-[#f5f2ed]">.env</span> to enable checkout.
              </>
            )}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {canceled ? (
        <p className="text-sm text-[#eadfce]">Checkout canceled. Pick a plan when you&apos;re ready.</p>
      ) : null}
      {error ? <p className="text-sm text-[#f3d7a4]">{error}</p> : null}

      <button
        type="button"
        disabled={loadingPlan !== null}
        onClick={() => startCheckout('monthly')}
        className="w-full border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84] disabled:opacity-60"
      >
        {loadingPlan === 'monthly' ? 'Redirecting…' : 'Subscribe — $9 / month'}
      </button>

      <button
        type="button"
        disabled={loadingPlan !== null}
        onClick={() => startCheckout('yearly')}
        className="w-full border border-white/20 bg-transparent px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#f5f2ed] transition hover:border-[#c9a96e] hover:text-[#c9a96e] disabled:opacity-60"
      >
        {loadingPlan === 'yearly' ? 'Redirecting…' : 'Subscribe — $79 / year'}
      </button>
    </div>
  )
}
