import Link from 'next/link'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign up | ReadAI',
  description: 'Create a ReadAI Book Club account.',
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#0e0c0a] px-5 py-10 text-[#f5f2ed] md:px-8 md:py-14">
      <div className="mx-auto max-w-md">
        <nav className="mb-8 text-xs uppercase tracking-[0.2em]">
          <Link href="/" className="text-[#c9a96e] hover:underline">
            Club home
          </Link>
        </nav>

        <header className="border-b border-white/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e]">Join the club</p>
          <h1 className="mt-2 font-serif text-3xl text-[#f5f2ed]">Create your account</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#eadfce]">
            Start with a 14-day free trial. No credit card required.
          </p>
        </header>

        <Suspense fallback={<p className="mt-8 text-sm text-[#eadfce]">Loading…</p>}>
          <AuthForm mode="sign-up" />
        </Suspense>
      </div>
    </main>
  )
}
