'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('Reset link is invalid or expired.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      window.location.assign('/')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-[#f3d7a4]">This reset link is invalid or expired.</p>
        <Link href="/forgot-password" className="text-sm text-[#c9a96e] hover:underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="password" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] outline-none placeholder:text-[#eadfce]/45 focus:border-[#c9a96e]"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-2 w-full border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] outline-none placeholder:text-[#eadfce]/45 focus:border-[#c9a96e]"
          placeholder="Repeat your password"
        />
      </div>

      {error ? <p className="text-sm text-[#f3d7a4]">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84] disabled:opacity-60"
      >
        {loading ? 'Please wait…' : 'Set new password'}
      </button>
    </form>
  )
}
