import { NextResponse } from 'next/server'
import { isStripeConfigured } from '@/lib/stripe/client'

export const dynamic = 'force-dynamic'

/** Safe runtime check — no secrets returned. */
export async function GET() {
  return NextResponse.json({
    stripeReady: isStripeConfigured(),
    hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    hasMonthlyPrice: Boolean(process.env.STRIPE_PRICE_MONTHLY?.trim()),
    hasYearlyPrice: Boolean(process.env.STRIPE_PRICE_YEARLY?.trim()),
    hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
  })
}
