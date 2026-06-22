import { NextResponse } from 'next/server'
import { isValidEmail } from '@/lib/auth/password'
import { deliverSupportMessage } from '@/lib/support/deliver-support-message'

const MAX_MESSAGE_LENGTH = 5000

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; message?: string }
    const email = body.email?.trim().toLowerCase() ?? ''
    const message = body.message?.trim() ?? ''

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    if (message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    }

    const result = await deliverSupportMessage({ email, message })
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 503 })
    }

    return NextResponse.json({ ok: true, confirmationSent: result.confirmationSent })
  } catch (error) {
    console.error('support route error:', error)
    return NextResponse.json({ error: 'Could not send your message.' }, { status: 500 })
  }
}
