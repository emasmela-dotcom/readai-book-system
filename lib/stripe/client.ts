import Stripe from 'stripe'

function createStripeClient(secretKey: string) {
  return new Stripe(secretKey)
}

type StripeClient = ReturnType<typeof createStripeClient>

let stripeClient: StripeClient | null = null

export function getStripe(): StripeClient {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeClient = createStripeClient(secretKey)
  }
  return stripeClient
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_MONTHLY?.trim() &&
      process.env.STRIPE_PRICE_YEARLY?.trim(),
  )
}
