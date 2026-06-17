/**
 * One-time setup: store Gmail app password in Neon (app_settings table).
 * Run: npx tsx scripts/set-gmail-app-password.ts
 */
import { createInterface } from 'readline'
import { saveGmailAppPassword } from '../lib/support/gmail-credentials'

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
  console.log('ReadAI support — Gmail app password setup')
  console.log('Google Account → Security → 2-Step Verification → App passwords → Mail')
  console.log('')

  const password = await prompt('Paste 16-character app password (not shown): ')
  if (!password.trim()) {
    console.error('Nothing entered. Exiting.')
    process.exit(1)
  }

  await saveGmailAppPassword(password)
  console.log('Saved to Neon app_settings. Restart the server, then test /support.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
