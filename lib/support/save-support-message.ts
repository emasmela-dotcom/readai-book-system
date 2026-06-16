import { sql } from '@/lib/db'

export async function saveSupportMessage(email: string, message: string): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS support_messages (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    INSERT INTO support_messages (email, message)
    VALUES (${email}, ${message})
  `
}
