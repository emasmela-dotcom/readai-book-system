import { sql } from '../lib/db'
import { getGmailAppPassword } from '../lib/support/gmail-credentials'

async function main() {
  const pass = await getGmailAppPassword()
  console.log('gmail_configured:', Boolean(pass))

  try {
    const rows = await sql`SELECT COUNT(*)::int AS n FROM support_messages`
    console.log('support_messages_count:', rows[0]?.n ?? 0)
    const latest = await sql`
      SELECT email, left(message, 50) AS preview, created_at
      FROM support_messages
      ORDER BY created_at DESC
      LIMIT 5
    `
    console.log('recent_messages:', latest)
  } catch (error) {
    console.log('support_messages table:', error instanceof Error ? error.message : error)
  }
}

main().catch(console.error)
