import { NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '@/lib/auth/send-password-reset-email'
import { createResetToken, hashResetToken, RESET_HOURS } from '@/lib/auth/reset-token'
import { isValidEmail } from '@/lib/auth/password'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string }
    const email = body.email?.trim().toLowerCase() ?? ''

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const users = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${email} LIMIT 1
    `
    const user = users[0] as { id: string } | undefined

    if (user) {
      const token = createResetToken()
      const tokenHash = await hashResetToken(token)
      const expiresAt = new Date(Date.now() + RESET_HOURS * 60 * 60 * 1000)

      await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`

      await sql`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (${user.id}, ${tokenHash}, ${expiresAt.toISOString()})
      `

      const origin = new URL(request.url).origin
      const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`

      const isLocal =
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        process.env.PASSWORD_RESET_DEV_LINKS === 'true'

      if (isLocal) {
        return NextResponse.json({
          ok: true,
          message: 'Use the link below to set a new password.',
          resetUrl,
        })
      }

      const sent = await sendPasswordResetEmail(email, resetUrl)
      if (!sent.ok) {
        console.error('[forgot-password] could not email reset link:', sent.error)
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        'If an account exists for that email, password reset instructions have been sent.',
    })
  } catch (error) {
    console.error('forgot-password error:', error)
    return NextResponse.json({ error: 'Could not process request. Please try again.' }, { status: 500 })
  }
}
