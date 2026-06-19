import { sql } from '@/lib/db'

let cachedApiKey: string | null | undefined

async function ensureSettingsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

/** Resend API key from env or Neon app_settings. */
export async function getResendApiKey(): Promise<string | null> {
  const fromEnv = process.env.RESEND_API_KEY?.trim()
  if (fromEnv) return fromEnv

  if (cachedApiKey !== undefined) return cachedApiKey

  try {
    await ensureSettingsTable()
    const rows = await sql`
      SELECT value FROM app_settings WHERE key = 'resend_api_key' LIMIT 1
    `
    const value = (rows[0] as { value: string } | undefined)?.value?.trim()
    cachedApiKey = value || null
  } catch (error) {
    console.error('[support] could not load resend_api_key from Neon:', error)
    cachedApiKey = null
  }

  return cachedApiKey
}

export async function saveResendApiKey(apiKey: string): Promise<void> {
  const normalized = apiKey.trim()
  if (!normalized) throw new Error('API key is empty.')

  await ensureSettingsTable()
  await sql`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES ('resend_api_key', ${normalized}, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `
  cachedApiKey = normalized
}
