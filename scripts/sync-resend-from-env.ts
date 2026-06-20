/**
 * Copy RESEND_API_KEY from .env into Neon app_settings (no prompt).
 * Run: npm run support:sync-resend
 */
import { config } from 'dotenv'
import { saveResendApiKey } from '../lib/support/resend-credentials'

config()

async function main() {
  const apiKey = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, '')
  if (!apiKey?.startsWith('re_')) {
    console.error('RESEND_API_KEY missing or invalid in .env')
    process.exit(1)
  }

  await saveResendApiKey(apiKey)
  console.log('Resend API key synced to Neon app_settings.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
