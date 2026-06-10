import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/forgot-password-form'

export const metadata = {
  title: 'Forgot password | ReadAI',
  description: 'Reset your ReadAI Book Club password.',
}

export default function ForgotPasswordPage() {
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
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">Forgot password</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
            Enter the email on your account. On local dev, your reset link appears on this page
            after you submit.
          </p>
        </header>

        <ForgotPasswordForm />
      </div>
    </main>
  )
}
