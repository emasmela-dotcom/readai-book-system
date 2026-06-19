/** Gmail account ReadAI uses to send (SMTP login — base address, not +alias). */
export const GMAIL_SENDER = 'apputilitybuilder@gmail.com'

/** Inbox where support messages are delivered (Resend free tier: account owner email only). */
export const SUPPORT_INBOX = 'apputilitybuilder@gmail.com'

/** Gmail account ReadAI uses to send support mail (server-side only). */
export function gmailSenderAddress(): string {
  return process.env.GMAIL_USER?.trim() || GMAIL_SENDER
}

/** Resend "from" address — free tier uses onboarding@resend.dev until you verify a domain. */
export function supportFromAddress(): string {
  return process.env.SUPPORT_FROM_EMAIL?.trim() || 'ReadAI Support <onboarding@resend.dev>'
}
