import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { getGmailAppPassword } from '@/lib/support/gmail-credentials'
import { getResendApiKey } from '@/lib/support/resend-credentials'
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
  const apiKey = await getResendApiKey()
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
  const pass = await getGmailAppPassword()
  if (!pass) return { ok: false, error: 'Gmail app password not configured.' }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
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

/** Server-side delivery — Resend first (no Gmail 2-step), Gmail optional fallback. */
export async function sendSupportEmail(input: SupportEmailInput): Promise<SupportEmailResult> {
  const resendKey = await getResendApiKey()
  const gmailPass = await getGmailAppPassword()

  if (resendKey) {
    const resendResult = await sendViaResend(input)
    if (resendResult.ok) return resendResult
    if (!gmailPass) return resendResult
  }

  if (gmailPass) {
    return sendViaGmail(input)
  }

  return { ok: false, error: 'Support email is not configured on the server.' }
}
