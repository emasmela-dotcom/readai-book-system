import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { planFromPriceId, type SubscriptionPlan } from '@/lib/stripe/config'
import { setUserSubscription, setUserSubscriptionByCustomerId } from '@/lib/stripe/subscription'

export const runtime = 'nodejs'

type StripeMetadata = Record<string, string> | null | undefined

type CheckoutSession = {
  metadata?: StripeMetadata
  client_reference_id?: string | null
  customer?: string | { id?: string } | null
}

type SubscriptionItem = {
  metadata?: StripeMetadata
  status: string
  customer?: string | { id?: string } | null
  items?: {
    data?: Array<{
      price?: {
        id?: string
      }
    }>
  }
}

function planFromMetadata(metadata: StripeMetadata): SubscriptionPlan | null {
  const plan = metadata?.plan
  return plan === 'monthly' || plan === 'yearly' ? plan : null
}

function planFromSubscription(subscription: SubscriptionItem): SubscriptionPlan | null {
  const fromMetadata = planFromMetadata(subscription.metadata)
  if (fromMetadata) return fromMetadata

  const priceId = subscription.items?.data?.[0]?.price?.id
  return planFromPriceId(priceId)
}

function isActiveSubscription(status: string): boolean {
  return status === 'active' || status === 'trialing'
}

function customerIdFrom(value: CheckoutSession['customer']): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id ?? null
}

async function handleCheckoutCompleted(session: CheckoutSession): Promise<void> {
  const userId = session.metadata?.userId ?? session.client_reference_id
  const plan = planFromMetadata(session.metadata)
  const customerId = customerIdFrom(session.customer)

  if (!userId || !plan) return

  await setUserSubscription(userId, plan, customerId)
}

async function handleSubscriptionChange(subscription: SubscriptionItem): Promise<void> {
  const userId = subscription.metadata?.userId
  const customerId = customerIdFrom(subscription.customer)

  if (isActiveSubscription(subscription.status)) {
    const plan = planFromSubscription(subscription)
    if (!plan) return

    if (userId) {
      await setUserSubscription(userId, plan, customerId)
      return
    }

    if (customerId) {
      await setUserSubscriptionByCustomerId(customerId, plan)
    }
    return
  }

  if (userId) {
    await setUserSubscription(userId, null, customerId)
    return
  }

  if (customerId) {
    await setUserSubscriptionByCustomerId(customerId, null)
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret is not configured.' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 })
  }

  const body = await request.text()

  let event: { type: string; data: { object: unknown } }
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret) as {
      type: string
      data: { object: unknown }
    }
  } catch (error) {
    console.error('stripe webhook signature error:', error)
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as CheckoutSession)
        break
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as SubscriptionItem)
        break
      default:
        break
    }
  } catch (error) {
    console.error('stripe webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
