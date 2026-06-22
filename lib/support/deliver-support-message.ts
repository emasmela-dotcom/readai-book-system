import { ensureResendKeyInNeon } from '@/lib/support/resend-credentials'
import { saveSupportMessage } from '@/lib/support/save-support-message'
import {
  sendSupportConfirmationEmail,
  sendSupportEmail,
} from '@/lib/support/send-support-email'

export type SupportDeliveryInput = {
  email: string
  message: string
}

export type SupportDeliveryResult =
  | { ok: true; confirmationSent: boolean }
  | { ok: false; error: string }

/** Save to Neon, then send from ReadAI's server — user mail app never opens. */
export async function deliverSupportMessage(
  input: SupportDeliveryInput,
): Promise<SupportDeliveryResult> {
  try {
    await ensureResendKeyInNeon()
  } catch (error) {
    console.error('[support] could not sync resend key to Neon:', error)
  }

  const emailResult = await sendSupportEmail(input)

  let savedToNeon = false
  try {
    await saveSupportMessage(input.email, input.message)
    savedToNeon = true
  } catch (error) {
    console.error('[support] neon save error:', error)
  }

  if (emailResult.ok) {
    const confirmationResult = await sendSupportConfirmationEmail(input)
    if (!confirmationResult.ok) {
      console.error('[support] confirmation not sent:', confirmationResult.error)
    }
    return { ok: true, confirmationSent: confirmationResult.ok }
  }

  if (savedToNeon) {
    return {
      ok: false,
      error: 'Your message was saved but could not be emailed to support.',
    }
  }

  const detail =
    emailResult.error === 'Gmail app password not configured.' ||
    emailResult.error === 'Resend not configured.' ||
    emailResult.error === 'Support email is not configured on the server.'
      ? 'Support mail is not set up on the server yet.'
      : 'Could not save your message. Please try again.'

  return { ok: false, error: detail }
}
