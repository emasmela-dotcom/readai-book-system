import { NextResponse } from 'next/server'
import { hashPassword, isValidPassword } from '@/lib/auth/password'
import { hashResetToken } from '@/lib/auth/reset-token'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string }
    const token = body.token?.trim() ?? ''
    const password = body.password ?? ''

    if (!token) {
      return NextResponse.json({ error: 'Reset link is invalid or expired.' }, { status: 400 })
    }
    if (!isValidPassword(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const tokenHash = await hashResetToken(token)
    const rows = await sql`
      SELECT prt.user_id
      FROM password_reset_tokens prt
      WHERE prt.token_hash = ${tokenHash}
        AND prt.expires_at > NOW()
      LIMIT 1
    `
    const row = rows[0] as { user_id: string } | undefined

    if (!row) {
      return NextResponse.json({ error: 'Reset link is invalid or expired.' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${row.user_id}
    `
    await sql`
      UPDATE users
      SET trial_started_at = NOW(), updated_at = NOW()
      WHERE id = ${row.user_id} AND trial_started_at IS NULL
    `
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${row.user_id}`

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('reset-password error:', error)
    return NextResponse.json({ error: 'Could not reset password. Please try again.' }, { status: 500 })
  }
}
