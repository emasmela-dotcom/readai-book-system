'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export function AuthForm({
  mode,
}: {
  mode: 'sign-in' | 'sign-up'
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isSignUp = mode === 'sign-up'

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] outline-none placeholder:text-[#eadfce]/45 focus:border-[#c9a96e]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] outline-none placeholder:text-[#eadfce]/45 focus:border-[#c9a96e]"
          placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
        />
        {!isSignUp ? (
          <p className="mt-2 text-right text-sm">
            <Link href="/forgot-password" className="text-[#c9a96e] hover:underline">
              Forgot password?
            </Link>
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-[#f3d7a4]">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84] disabled:opacity-60"
      >
        {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-sm text-[#eadfce]">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#c9a96e] hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to the club?{' '}
            <Link href="/sign-up" className="text-[#c9a96e] hover:underline">
              Create an account
            </Link>
            {' · '}
            14-day free trial, no card required.
          </>
        )}
      </p>
    </form>
  )
}
