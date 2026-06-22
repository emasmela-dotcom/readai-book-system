import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { getGmailAppPassword } from '@/lib/support/gmail-credentials'
import { getResendApiKeys } from '@/lib/support/resend-credentials'
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

function confirmationSubject(): string {
  return 'We received your ReadAI support message'
}

function confirmationBody(userEmail: string): string {
  return `Hi,

We got your message to ReadAI support. This email confirms it was received.

We will reply to ${userEmail} as soon as we can. You do not need to send it again.

— ReadAI Book Club`
}

function resendFromIsTestOnly(): boolean {
  return supportFromAddress().includes('@resend.dev')
}

/** Resend test sender can only deliver to the account owner inbox. */
function canResendReachRecipient(recipient: string): boolean {
  if (!resendFromIsTestOnly()) return true
  return recipient.trim().toLowerCase() === SUPPORT_INBOX.toLowerCase()
}

async function sendConfirmationViaGmail(input: SupportEmailInput): Promise<SupportEmailResult> {
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
      to: input.email,
      subject: confirmationSubject(),
      text: confirmationBody(input.email),
    })
    return { ok: true }
  } catch (error) {
    console.error('[support] gmail confirmation error:', error)
    return { ok: false, error: 'Confirmation email failed.' }
  }
}

async function sendViaResend(
  input: SupportEmailInput,
  apiKey: string,
): Promise<SupportEmailResult> {
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
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Resend failed.'
    return { ok: false, error: message }
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
  const resendKeys = await getResendApiKeys()
  const gmailPass = await getGmailAppPassword()
  let lastResendError = 'Resend not configured.'

  for (const apiKey of resendKeys) {
    const resendResult = await sendViaResend(input, apiKey)
    if (resendResult.ok) return resendResult
    lastResendError = resendResult.error
  }

  if (resendKeys.length > 0 && !gmailPass) {
    return { ok: false, error: lastResendError }
  }

  if (gmailPass) {
    return sendViaGmail(input)
  }

  return { ok: false, error: 'Support email is not configured on the server.' }
}

/** Auto-reply to the address the user entered on the support form. */
export async function sendSupportConfirmationEmail(
  input: SupportEmailInput,
): Promise<SupportEmailResult> {
  const gmailResult = await sendConfirmationViaGmail(input)
  if (gmailResult.ok) return gmailResult

  if (!canResendReachRecipient(input.email)) {
    return {
      ok: false,
      error:
        'Confirmation needs Gmail or a verified Resend domain (test sender only reaches the support inbox).',
    }
  }

  const resendKeys = await getResendApiKeys()
  for (const apiKey of resendKeys) {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: supportFromAddress(),
      to: input.email,
      subject: confirmationSubject(),
      text: confirmationBody(input.email),
    })
    if (!error) return { ok: true }
    console.error('[support] resend confirmation error:', error)
  }

  return { ok: false, error: gmailResult.error }
}
