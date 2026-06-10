import { NextResponse } from 'next/server'
import { createSession } from '@/lib/auth/session'
import { isValidEmail, verifyPassword } from '@/lib/auth/password'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase() ?? ''
    const password = body.password ?? ''

    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 })
    }

    const rows = await sql`
      SELECT id, password_hash
      FROM users
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `
    const user = rows[0] as { id: string; password_hash: string } | undefined
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    await sql`
      UPDATE users
      SET trial_started_at = NOW(), updated_at = NOW()
      WHERE id = ${user.id} AND trial_started_at IS NULL
    `

    await createSession(user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('sign-in error:', error)
    return NextResponse.json({ error: 'Sign in failed. Please try again.' }, { status: 500 })
  }
}
