import { saveSupportMessage } from '@/lib/support/save-support-message'
import { sendSupportEmail } from '@/lib/support/send-support-email'

export type SupportDeliveryInput = {
  email: string
  message: string
}

export type SupportDeliveryResult =
  | { ok: true }
  | { ok: false; error: string }

/** Save to Neon, then send from ReadAI's server — user mail app never opens. */
export async function deliverSupportMessage(
  input: SupportDeliveryInput,
): Promise<SupportDeliveryResult> {
  try {
    await saveSupportMessage(input.email, input.message)
  } catch (error) {
    console.error('[support] neon save error:', error)
    return { ok: false, error: 'Could not save your message. Please try again.' }
  }

  const emailResult = await sendSupportEmail(input)
  if (!emailResult.ok) {
    console.error('[support] saved to database; email not sent:', emailResult.error)
    const detail =
      emailResult.error === 'Gmail app password not configured.' ||
      emailResult.error === 'Resend not configured.' ||
      emailResult.error === 'Support email is not configured on the server.'
        ? 'Support mail is not set up on the server yet.'
        : 'Your message was saved but could not be emailed to support.'
    return { ok: false, error: detail }
  }

  return { ok: true }
}
