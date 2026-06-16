/** Inbox where support messages are delivered. */
export const SUPPORT_INBOX = 'apputilitybuilder@gmail.com'

/** Gmail account ReadAI uses to send support mail (server-side only). */
export function gmailSenderAddress(): string {
  return process.env.GMAIL_USER?.trim() || SUPPORT_INBOX
}

/** Resend "from" address — fallback when Gmail is not configured. */
export function supportFromAddress(): string {
  return process.env.SUPPORT_FROM_EMAIL?.trim() || 'ReadAI Support <onboarding@resend.dev>'
}
