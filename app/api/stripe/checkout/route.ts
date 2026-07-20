import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { getStripe, isStripeConfigured } from '@/lib/stripe/client'
import { getPriceIdForPlan, type SubscriptionPlan } from '@/lib/stripe/config'

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 503 })
    }

    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Sign in to subscribe.' }, { status: 401 })
    }

    const body = (await request.json()) as { plan?: SubscriptionPlan }
    const plan = body.plan
    if (plan !== 'monthly' && plan !== 'yearly') {
      return NextResponse.json({ error: 'Choose monthly or yearly.' }, { status: 400 })
    }

    const stripe = getStripe()
    const origin = new URL(request.url).origin

    let stripeCustomerId: string | null = null
    const rows = await sql`
      SELECT stripe_customer_id
      FROM users
      WHERE id = ${user.id}
      LIMIT 1
    `
    stripeCustomerId = (rows[0] as { stripe_customer_id: string | null } | undefined)?.stripe_customer_id ?? null

    if (!stripeCustomerId) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 })
      if (existing.data[0]) {
        stripeCustomerId = existing.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        })
        stripeCustomerId = customer.id
      }

      await sql`
        UPDATE users
        SET stripe_customer_id = ${stripeCustomerId}, updated_at = NOW()
        WHERE id = ${user.id}
      `
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: getPriceIdForPlan(plan), quantity: 1 }],
      success_url: `${origin}/subscribe?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe?canceled=1`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('stripe checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
  }
}
