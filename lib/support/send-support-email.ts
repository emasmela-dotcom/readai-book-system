import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { gmailSenderAddress, SUPPORT_INBOX, supportFromAddress } from '@/lib/support/config'

export type SupportEmailInput = {
  email: string
  message: string
}

export type SupportEmailResult =
  | { ok: true }
  | { ok: false; error: string }

function supportSubject(userEmail: string): string {
  return `ReadAI support — ${userEmail}`
}

function supportBody(userEmail: string, message: string): string {
  return `From: ${userEmail}\n\n${message}`
}

async function sendViaResend(input: SupportEmailInput): Promise<SupportEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return { ok: false, error: 'Resend not configured.' }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: supportFromAddress(),
    to: SUPPORT_INBOX,
    replyTo: input.email,
    subject: supportSubject(input.email),
    text: supportBody(input.email, input.message),
  })

  if (error) {
    console.error('[support] resend error:', error)
    return { ok: false, error: 'Resend failed.' }
  }

  return { ok: true }
}

async function sendViaGmail(input: SupportEmailInput): Promise<SupportEmailResult> {
  const user = gmailSenderAddress()
  const pass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '')
  if (!pass) return { ok: false, error: 'Gmail app password not configured.' }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  try {
    await transporter.sendMail({
      from: `ReadAI Support <${user}>`,
      to: SUPPORT_INBOX,
      replyTo: input.email,
      subject: supportSubject(input.email),
      text: supportBody(input.email, input.message),
    })
    return { ok: true }
  } catch (error) {
    console.error('[support] gmail error:', error)
    return { ok: false, error: 'Gmail failed.' }
  }
}

/** Server-side delivery to the support inbox — Gmail first, Resend fallback. */
export async function sendSupportEmail(input: SupportEmailInput): Promise<SupportEmailResult> {
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim()
  const resendKey = process.env.RESEND_API_KEY?.trim()

  if (gmailPass) {
    const gmailResult = await sendViaGmail(input)
    if (gmailResult.ok) return gmailResult
    if (!resendKey) return gmailResult
  }

  if (resendKey) {
    return sendViaResend(input)
  }

  return { ok: false, error: 'Support email is not configured on the server.' }
}
