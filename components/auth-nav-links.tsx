'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocaleFromPathname, localizedPath, type Locale } from '@/lib/i18n/config'

const linkClass = 'hover:text-[#c9a96e]'

export function AuthNavLinks({ locale: localeProp }: { locale?: Locale }) {
  const pathname = usePathname()
  const locale = localeProp ?? getLocaleFromPathname(pathname || '/')
  const t = getDictionary(locale)
  const [signedIn, setSignedIn] = useState(false)
  const [ready, setReady] = useState(false)

  const loadSession = useCallback(() => {
    setReady(false)
    fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return null
        return res.json() as Promise<{ user?: { email?: string } | null }>
      })
      .then((data) => setSignedIn(Boolean(data?.user?.email)))
      .catch(() => setSignedIn(false))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession, pathname])

  async function signOut() {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' })
    setSignedIn(false)
    window.location.assign(localizedPath(locale, '/'))
  }

  if (!ready) {
    return <span className="text-[#eadfce]/50">…</span>
  }

  if (signedIn) {
    return (
      <button
        type="button"
        onClick={signOut}
        className="border border-[#c9a96e]/60 px-2 py-1 text-[#c9a96e] hover:bg-[#c9a96e]/10"
      >
        {t.nav.signOut}
      </button>
    )
  }

  return (
    <>
      <Link href={localizedPath(locale, '/sign-up')} className={linkClass}>
        {t.nav.startTrial}
      </Link>
      <Link href={localizedPath(locale, '/sign-in')} className={linkClass}>
        {t.nav.signIn}
      </Link>
    </>
  )
}
