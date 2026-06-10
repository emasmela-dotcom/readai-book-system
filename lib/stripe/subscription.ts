import { sql } from '@/lib/db'
import type { SubscriptionPlan } from '@/lib/stripe/config'
import { PAID_SUBSCRIPTION_TIERS } from '@/lib/stripe/config'

export async function setUserSubscription(
  userId: string,
  plan: SubscriptionPlan | null,
  stripeCustomerId?: string | null,
): Promise<void> {
  await sql`
    UPDATE users
    SET
      subscription_tier = ${plan},
      stripe_customer_id = COALESCE(${stripeCustomerId ?? null}, stripe_customer_id),
      updated_at = NOW()
    WHERE id = ${userId}
  `
}

export async function setUserSubscriptionByCustomerId(
  stripeCustomerId: string,
  plan: SubscriptionPlan | null,
): Promise<void> {
  await sql`
    UPDATE users
    SET subscription_tier = ${plan}, updated_at = NOW()
    WHERE stripe_customer_id = ${stripeCustomerId}
  `
}

export function isPaidSubscriptionTier(tier: string | null | undefined): boolean {
  return Boolean(tier && PAID_SUBSCRIPTION_TIERS.has(tier))
}
