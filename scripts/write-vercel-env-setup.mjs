#!/usr/bin/env node
/**
 * Writes copy-paste values for Vercel → readai-book-system-c11p → Environment Variables.
 * Output: .vercel-env-setup.txt (gitignored)
 */
import { config } from 'dotenv'
import { writeFileSync } from 'node:fs'

config()

const lines = [
  'VERCEL PROJECT: readai-book-system-c11p',
  'URL: https://vercel.com/erics-projects-b395e20f/readai-book-system-c11p/settings/environment-variables',
  '',
  'Add each variable. Check Production + Preview + Development for each.',
  '',
  '--- MINIMUM FOR SUPPORT EMAIL (add this one first) ---',
  '',
  'Name: RESEND_API_KEY',
  `Value: ${process.env.RESEND_API_KEY || '(missing — run npm run support:setup-resend)'}`,
  '',
  '--- FULL APP (auth, saved books, support backup in Neon) ---',
  '',
  'Name: DATABASE_URL',
  `Value: ${process.env.DATABASE_URL || '(missing in .env)'}`,
  '',
  'Name: STRIPE_PRICE_MONTHLY',
  `Value: ${process.env.STRIPE_PRICE_MONTHLY || '(optional)'}`,
  '',
  'Name: STRIPE_PRICE_YEARLY',
  `Value: ${process.env.STRIPE_PRICE_YEARLY || '(optional)'}`,
  '',
  'After saving: Deployments → Redeploy latest.',
  'Test: https://readai-book-system-c11p.vercel.app/support',
]

writeFileSync('.vercel-env-setup.txt', lines.join('\n') + '\n')
console.log('Wrote .vercel-env-setup.txt — open it and copy values into Vercel.')
