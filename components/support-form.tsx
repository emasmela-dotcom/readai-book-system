'use client'

import { type FormEvent, useState } from 'react'

export function SupportForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })
      const data = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok || data.ok !== true) {
        setError(data.error ?? 'Something went wrong. Your message was not delivered.')
        return
      }

      setSent(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-8 border border-[#c9a96e]/40 bg-[#171311] p-6">
        <p className="text-sm text-[#f5f2ed]">Your message was sent. We will reply to {email}.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="support-email" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
          Your email
        </label>
        <input
          id="support-email"
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
        <label htmlFor="support-message" className="text-[11px] uppercase tracking-[0.25em] text-[#c9a96e]">
          Message
        </label>
        <textarea
          id="support-message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-2 w-full resize-y border border-white/15 bg-[#171311] px-4 py-3 text-sm text-[#f5f2ed] outline-none placeholder:text-[#eadfce]/45 focus:border-[#c9a96e]"
          placeholder="What do you need help with?"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="border border-[#c9a96e]/60 bg-[#221912] p-4"
        >
          <p className="text-sm font-medium text-[#f5f2ed]">Message not delivered</p>
          <p className="mt-2 text-sm text-[#eadfce]">{error}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#0e0c0a] transition hover:bg-[#d8be84] disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
