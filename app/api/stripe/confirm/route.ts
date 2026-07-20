import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { getStripe, isStripeConfigured } from '@/lib/stripe/client'
import { planFromPriceId, type SubscriptionPlan } from '@/lib/stripe/config'
import { setUserSubscription } from '@/lib/stripe/subscription'

export const dynamic = 'force-dynamic'

function planFromSession(session: {
  metadata?: Record<string, string> | null
  line_items?: { data?: Array<{ price?: { id?: string | null } | null }> }
}): SubscriptionPlan | null {
  const fromMeta = session.metadata?.plan
  if (fromMeta === 'monthly' || fromMeta === 'yearly') return fromMeta

  const priceId = session.line_items?.data?.[0]?.price?.id
  return planFromPriceId(priceId)
}

/** Unlock membership after Stripe Checkout redirect (works even if webhooks are not set). */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
    }

    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Sign in to confirm payment.' }, { status: 401 })
    }

    const body = (await request.json()) as { sessionId?: string }
    const sessionId = body.sessionId?.trim()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing checkout session.' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    if (session.mode !== 'subscription') {
      return NextResponse.json({ error: 'Not a subscription checkout.' }, { status: 400 })
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Payment is not complete yet.' }, { status: 402 })
    }

    const metaUserId = session.metadata?.userId ?? session.client_reference_id
    if (metaUserId && metaUserId !== user.id) {
      return NextResponse.json({ error: 'This checkout belongs to another account.' }, { status: 403 })
    }

    const plan = planFromSession(session)
    if (!plan) {
      return NextResponse.json({ error: 'Could not determine plan.' }, { status: 400 })
    }

    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null

    await setUserSubscription(user.id, plan, customerId)

    return NextResponse.json({ ok: true, plan })
  } catch (error) {
    console.error('stripe confirm error:', error)
    return NextResponse.json({ error: 'Could not confirm payment.' }, { status: 500 })
  }
}
