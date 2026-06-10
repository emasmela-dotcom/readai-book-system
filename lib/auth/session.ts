import { cookies } from 'next/headers'
import { authSql } from '@/lib/auth/neon'
import {
  createSessionToken,
  hashSessionToken,
  SESSION_COOKIE,
  SESSION_DAYS,
} from '@/lib/auth/session-token'

export interface SessionUser {
  id: string
  email: string
  trialStart: Date
  subscriptionTier: string | null
}

function sessionExpiryDate(): Date {
  const expires = new Date()
  expires.setDate(expires.getDate() + SESSION_DAYS)
  return expires
}

export async function createSession(userId: string): Promise<string> {
  const token = createSessionToken()
  const tokenHash = await hashSessionToken(token)
  const expiresAt = sessionExpiryDate()

  await authSql`
    INSERT INTO sessions (user_id, session_token, expires)
    VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })

  return token
}

export async function clearSessionCookie(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (token) {
    const tokenHash = await hashSessionToken(token)
    await authSql`DELETE FROM sessions WHERE session_token = ${tokenHash}`
  }

  cookies().set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

async function loadSessionUser(tokenHash: string): Promise<SessionUser | null> {
  const rows = await authSql`
    SELECT
      u.id,
      u.email,
      COALESCE(u.trial_started_at, u.created_at) AS trial_start,
      u.subscription_tier
    FROM sessions sess
    INNER JOIN users u ON u.id = sess.user_id
    WHERE sess.session_token = ${tokenHash}
      AND sess.expires > NOW()
    LIMIT 1
  `

  const row = rows[0] as
    | {
        id: string
        email: string
        trial_start: string | Date
        subscription_tier: string | null
      }
    | undefined

  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    trialStart: new Date(row.trial_start),
    subscriptionTier: row.subscription_tier,
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null

  const tokenHash = await hashSessionToken(token)
  return loadSessionUser(tokenHash)
}

export async function getSessionUserFromToken(token: string): Promise<SessionUser | null> {
  const tokenHash = await hashSessionToken(token)
  return loadSessionUser(tokenHash)
}
