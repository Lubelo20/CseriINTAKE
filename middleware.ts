import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { locales } from './navigation'

const intlMiddleware = createMiddleware({ locales, defaultLocale: 'en' })
const JWT_COOKIE = 'cseri_admin_token'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin pages — skip only the login page to avoid redirect loop
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(JWT_COOKIE)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!),
      )
    } catch {
      const res = NextResponse.redirect(new URL('/admin/login', request.url))
      res.cookies.delete(JWT_COOKIE)
      return res
    }
    return NextResponse.next()
  }

  // next-intl handles locale routing for all public pages
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    return intlMiddleware(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
