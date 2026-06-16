import { saveSupportMessage } from '@/lib/support/save-support-message'
import { sendSupportEmail } from '@/lib/support/send-support-email'

export type SupportDeliveryInput = {
  email: string
  message: string
}

export type SupportDeliveryResult =
  | { ok: true }
  | { ok: false; error: string }

/** Save to Neon, then send from ReadAI's Gmail — user mail app never opens. */
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
    return {
      ok: false,
      error: 'Your message was saved but could not be delivered. Please try again shortly.',
    }
  }

  return { ok: true }
}
