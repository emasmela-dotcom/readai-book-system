export const SESSION_COOKIE = 'readai_session'
export const SESSION_DAYS = 30

export function createSessionToken(): string {
  return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '')
}

export async function hashSessionToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
