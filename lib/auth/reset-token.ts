import { hashSessionToken, createSessionToken } from '@/lib/auth/session-token'

export const RESET_HOURS = 1

export function createResetToken(): string {
  return createSessionToken()
}

export async function hashResetToken(token: string): Promise<string> {
  return hashSessionToken(token)
}
