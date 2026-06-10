import type { SessionUser } from '@/lib/auth/session'
import { PAID_SUBSCRIPTION_TIERS } from '@/lib/stripe/config'

const TRIAL_DAYS = 14

export function trialEndsAt(trialStart: Date): Date {
  const end = new Date(trialStart)
  end.setDate(end.getDate() + TRIAL_DAYS)
  return end
}

export function hasClubAccess(user: SessionUser): boolean {
  if (user.subscriptionTier && PAID_SUBSCRIPTION_TIERS.has(user.subscriptionTier)) {
    return true
  }

  return new Date() < trialEndsAt(user.trialStart)
}

export function trialDaysLeft(user: SessionUser): number {
  const msLeft = trialEndsAt(user.trialStart).getTime() - Date.now()
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
}
