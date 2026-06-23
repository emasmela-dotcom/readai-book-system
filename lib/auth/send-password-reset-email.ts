import nodemailer from 'nodemailer'
import { RESET_HOURS } from '@/lib/auth/reset-token'
import { gmailSenderAddress } from '@/lib/support/config'
import { getGmailAppPassword } from '@/lib/support/gmail-credentials'

export type PasswordResetEmailResult = { ok: true } | { ok: false; error: string }

function resetSubject(): string {
  return 'Reset your ReadAI password'
}

function resetBody(resetUrl: string): string {
  return `Hi,

Use this link to set a new password for ReadAI Book Club:

${resetUrl}

This link expires in ${RESET_HOURS} hour${RESET_HOURS === 1 ? '' : 's'}.

If you did not request this, you can ignore this email.

— ReadAI Book Club`
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<PasswordResetEmailResult> {
  const user = gmailSenderAddress()
  const pass = await getGmailAppPassword()
  if (!pass) {
    return { ok: false, error: 'Gmail app password not configured.' }
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  })

  try {
    await transporter.sendMail({
      from: `ReadAI <${user}>`,
      to: email,
      subject: resetSubject(),
      text: resetBody(resetUrl),
    })
    return { ok: true }
  } catch (error) {
    console.error('[forgot-password] gmail reset email error:', error)
    return { ok: false, error: 'Password reset email failed.' }
  }
}
