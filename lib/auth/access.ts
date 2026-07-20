import type { SessionUser } from '@/lib/auth/session'
import { PAID_SUBSCRIPTION_TIERS } from '@/lib/stripe/config'

const TRIAL_DAYS = 14

/** Full club access without payment (family / comped accounts). */
const COMPED_FULL_ACCESS_EMAILS = new Set([
  'ruthmasmela41@gmail.com',
  'emasmela1976@gmail.com',
])

export function isCompedFullAccessEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return COMPED_FULL_ACCESS_EMAILS.has(email.trim().toLowerCase())
}

export function trialEndsAt(trialStart: Date): Date {
  const end = new Date(trialStart)
  end.setDate(end.getDate() + TRIAL_DAYS)
  return end
}

export function hasClubAccess(user: SessionUser): boolean {
  if (isCompedFullAccessEmail(user.email)) return true

  if (user.subscriptionTier && PAID_SUBSCRIPTION_TIERS.has(user.subscriptionTier)) {
    return true
  }

  return new Date() < trialEndsAt(user.trialStart)
}

export function trialDaysLeft(user: SessionUser): number {
  if (isCompedFullAccessEmail(user.email)) return 9999

  const msLeft = trialEndsAt(user.trialStart).getTime() - Date.now()
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
}
