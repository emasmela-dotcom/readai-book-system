import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasClubAccess } from '@/lib/auth/access'
import { isPublicPath } from '@/lib/auth/public-routes'
import { getSessionUserFromToken } from '@/lib/auth/session'
import { SESSION_COOKIE } from '@/lib/auth/session-token'
import { getLocaleFromPathname, localizedPath, stripLocalePrefix } from '@/lib/i18n/config'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = getLocaleFromPathname(pathname)
  const barePath = stripLocalePrefix(pathname)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  if (isPublicPath(barePath) || isPublicPath(pathname)) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    const signIn = new URL(localizedPath(locale, '/sign-in'), request.url)
    signIn.searchParams.set('next', pathname)
    return NextResponse.redirect(signIn)
  }

  const user = await getSessionUserFromToken(token)
  if (!user) {
    const signIn = new URL(localizedPath(locale, '/sign-in'), request.url)
    signIn.searchParams.set('next', pathname)
    const response = NextResponse.redirect(signIn)
    response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
    return response
  }

  if (!hasClubAccess(user) && barePath !== '/subscribe') {
    return NextResponse.redirect(new URL(localizedPath(locale, '/subscribe'), request.url))
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
