import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/session'

export async function POST() {
  try {
    await clearSessionCookie()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('sign-out error:', error)
    return NextResponse.json({ error: 'Sign out failed.' }, { status: 500 })
  }
}
