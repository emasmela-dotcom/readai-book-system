/**
 * One-time setup: store Resend API key in Neon (app_settings table).
 * Run: npm run support:setup-resend
 */
import { createInterface } from 'readline'
import { saveResendApiKey } from '../lib/support/resend-credentials'

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  console.log('ReadAI support — Resend API key setup')
  console.log('Sign up at https://resend.com → API Keys → create key')
  console.log('')

  const apiKey = await prompt('Paste Resend API key (starts with re_): ')
  if (!apiKey.trim()) {
    console.error('Nothing entered. Exiting.')
    process.exit(1)
  }

  await saveResendApiKey(apiKey)
  console.log('Saved to Neon app_settings. Restart the server, then test /support.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
