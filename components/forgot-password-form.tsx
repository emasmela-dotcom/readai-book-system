'use client'

import Link from 'next/link'
import { type FormEvent, useState } from 'react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [resetUrl, setResetUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setResetUrl(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await response.json()) as {
        error?: string
        message?: string
        resetUrl?: string
      }

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      setMessage(data.message ?? 'Check your email for reset instructions.')
      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

      {error ? <p className="text-sm text-[#f3d7a4]">{error}</p> : null}
      {message ? <p className="text-sm text-[#eadfce]">{message}</p> : null}
      {resetUrl ? (
        <p className="rounded border border-[#c9a96e]/40 bg-[#171311] p-4 text-sm text-[#f5f2ed]">
          Local dev reset link:{' '}
          <Link href={resetUrl} className="break-all text-[#c9a96e] hover:underline">
            {resetUrl}
          </Link>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84] disabled:opacity-60"
      >
        {loading ? 'Please wait…' : 'Send reset link'}
      </button>

      <p className="text-sm text-[#eadfce]">
        Remember your password?{' '}
        <Link href="/sign-in" className="text-[#c9a96e] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
