import { sql } from '@/lib/db'

let cachedApiKey: string | null | undefined

function normalizeResendKey(raw: string | undefined): string | null {
  const value = raw?.trim().replace(/^["']|["']$/g, '')
  if (!value || !value.startsWith('re_')) return null
  return value
}

async function ensureSettingsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

async function loadNeonResendKey(): Promise<string | null> {
  if (cachedApiKey !== undefined) return cachedApiKey

  try {
    await ensureSettingsTable()
    const rows = await sql`
      SELECT value FROM app_settings WHERE key = 'resend_api_key' LIMIT 1
    `
    const value = normalizeResendKey((rows[0] as { value: string } | undefined)?.value)
    cachedApiKey = value
  } catch (error) {
    console.error('[support] could not load resend_api_key from Neon:', error)
    cachedApiKey = null
  }

  return cachedApiKey
}

/** All Resend keys to try (env first, then Neon). Skips invalid env values. */
export async function getResendApiKeys(): Promise<string[]> {
  const keys: string[] = []
  const fromEnv = normalizeResendKey(process.env.RESEND_API_KEY)
  if (fromEnv) keys.push(fromEnv)

  const fromNeon = await loadNeonResendKey()
  if (fromNeon && !keys.includes(fromNeon)) keys.push(fromNeon)

  return keys
}

/** Resend API key from env or Neon app_settings. */
export async function getResendApiKey(): Promise<string | null> {
  const keys = await getResendApiKeys()
  return keys[0] ?? null
}

/** Persist env Resend key into Neon so production works with DATABASE_URL only. */
export async function ensureResendKeyInNeon(): Promise<void> {
  const fromEnv = normalizeResendKey(process.env.RESEND_API_KEY)
  if (!fromEnv) return

  const fromNeon = await loadNeonResendKey()
  if (fromNeon === fromEnv) return

  await saveResendApiKey(fromEnv)
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
