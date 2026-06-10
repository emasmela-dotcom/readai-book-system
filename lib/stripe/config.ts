export type SubscriptionPlan = 'monthly' | 'yearly'

export const STRIPE_PRICE_IDS: Record<SubscriptionPlan, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
}

export function getPriceIdForPlan(plan: SubscriptionPlan): string {
  const priceId = STRIPE_PRICE_IDS[plan]
  if (!priceId) {
    throw new Error(`Stripe price is not configured for plan: ${plan}`)
  }
  return priceId
}

export function planFromPriceId(priceId: string | null | undefined): SubscriptionPlan | null {
  if (!priceId) return null
  if (priceId === STRIPE_PRICE_IDS.monthly) return 'monthly'
  if (priceId === STRIPE_PRICE_IDS.yearly) return 'yearly'
  return null
}

export const PAID_SUBSCRIPTION_TIERS = new Set(['monthly', 'yearly', 'active'])
