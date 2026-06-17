/** Gmail account ReadAI uses to send (SMTP login — base address, not +alias). */
export const GMAIL_SENDER = 'apputilitybuilder@gmail.com'

/** Inbox where support messages are delivered (+readai lands in your ReadAI Gmail label). */
export const SUPPORT_INBOX = 'apputilitybuilder+readai@gmail.com'

/** Gmail account ReadAI uses to send support mail (server-side only). */
export function gmailSenderAddress(): string {
  return process.env.GMAIL_USER?.trim() || GMAIL_SENDER
}

/** Resend "from" address — fallback when Gmail is not configured. */
export function supportFromAddress(): string {
  return process.env.SUPPORT_FROM_EMAIL?.trim() || 'ReadAI Support <onboarding@resend.dev>'
}
