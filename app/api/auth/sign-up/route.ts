import { NextResponse } from 'next/server'
import { createSession } from '@/lib/auth/session'
import { hashPassword, isValidEmail, isValidPassword } from '@/lib/auth/password'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase() ?? ''
    const password = body.password ?? ''

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    if (!isValidPassword(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${email} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const inserted = await sql`
      INSERT INTO users (email, password_hash, trial_started_at)
      VALUES (${email}, ${passwordHash}, NOW())
      RETURNING id
    `
    const userId = (inserted[0] as { id: string }).id

    await createSession(userId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('sign-up error:', error)
    return NextResponse.json({ error: 'Sign up failed. Please try again.' }, { status: 500 })
  }
}
