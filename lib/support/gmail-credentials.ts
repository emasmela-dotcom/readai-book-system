import { sql } from '@/lib/db'

let cachedPassword: string | null | undefined

async function ensureSettingsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

/** Gmail app password from env or Neon app_settings (works on Vercel with DATABASE_URL only). */
export async function getGmailAppPassword(): Promise<string | null> {
  const fromEnv = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '')
  if (fromEnv) return fromEnv

  if (cachedPassword !== undefined) return cachedPassword

  try {
    await ensureSettingsTable()
    const rows = await sql`
      SELECT value FROM app_settings WHERE key = 'gmail_app_password' LIMIT 1
    `
    const value = (rows[0] as { value: string } | undefined)?.value?.trim().replace(/\s+/g, '')
    cachedPassword = value || null
  } catch (error) {
    console.error('[support] could not load gmail_app_password from Neon:', error)
    cachedPassword = null
  }

  return cachedPassword
}

export async function saveGmailAppPassword(password: string): Promise<void> {
  const normalized = password.trim().replace(/\s+/g, '')
  if (!normalized) throw new Error('App password is empty.')

  await ensureSettingsTable()
  await sql`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES ('gmail_app_password', ${normalized}, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `
  cachedPassword = normalized
}
