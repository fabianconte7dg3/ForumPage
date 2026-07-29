import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { defaultLocale, isLocale, locales } from '@/i18n'

// Redirige / y rutas sin prefijo de idioma a /es o /en según
// Accept-Language, con /es por defecto — ver 03-runbook-tecnico.md §8.1.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const yaTienePrefijo = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
  if (yaTienePrefijo) return NextResponse.next()

  const preferido = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale = preferido && isLocale(preferido) ? preferido : defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
