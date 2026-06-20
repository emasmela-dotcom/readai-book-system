import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json(
    { user: { email: user.email } },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
