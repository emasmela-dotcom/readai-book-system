import Link from 'next/link'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/reset-password-form'

export const metadata = {
  title: 'Reset password | ReadAI',
  description: 'Set a new password for ReadAI Book Club.',
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-md">
        <nav className="mb-8 text-xs uppercase tracking-[0.2em]">
          <Link href="/sign-in" className="text-[#c9a96e] hover:underline">
            Back to sign in
          </Link>
        </nav>

        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Account recovery</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">Set a new password</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
            Choose a new password for your account, then sign in again.
          </p>
        </header>

        <Suspense fallback={<p className="mt-8 text-sm text-[#eadfce]">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
