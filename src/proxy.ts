import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { defaultLocale, isLocale, locales } from '@/i18n'

// Nonce por request: Next.js lo detecta solo desde el header CSP de salida y
// lo aplica a sus propios <script> (streaming RSC + chunks estáticos) — no
// hace falta leerlo a mano en layout.tsx. Ver node_modules/next/dist/server/
// app-render/get-script-nonce-from-header.js.
//
// style-src lleva 'unsafe-inline' aparte: los nonces de CSP no cubren
// atributos style="" inline (solo <style>/<link>), y el sitio (11 archivos)
// y el admin de Payload usan style={{}} — no vale la pena migrar eso a CSS
// para poder sacar el unsafe-inline de un directive de bajo riesgo (no
// ejecuta JS).
//
// Dominios externos reales del sitio, no genéricos:
// - api.maptiler.com / {a,b,c}.basemaps.cartocdn.com: tiles del mapa de
//   impacto (ImpactoMap.tsx, MapaPreviewHome.tsx), pedidos con fetch/XHR
//   por maplibre-gl → connect-src, no img-src.
// - i.ytimg.com: miniatura de YouTube antes del clic (VideoYoutube.tsx).
// - youtube-nocookie.com: iframe del video una vez que el usuario hace clic.
// worker-src va explícito (no como fallback de script-src) porque
// script-src usa 'strict-dynamic', que ignora 'self' para fuentes por host
// — el worker propio de maplibre-gl (/maplibre-gl-worker.mjs) necesita su
// propio 'self' sin depender de esa cadena.
function construirCsp() {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://i.ytimg.com;
    font-src 'self';
    connect-src 'self' https://api.maptiler.com https://a.basemaps.cartocdn.com https://b.basemaps.cartocdn.com https://c.basemaps.cartocdn.com;
    worker-src 'self';
    frame-src https://www.youtube-nocookie.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()
  return { nonce, csp }
}

function siguienteConCsp(request: NextRequest, csp: string) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', csp)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

// Redirige / y rutas sin prefijo de idioma a /es o /en según
// Accept-Language, con /es por defecto — ver 03-runbook-tecnico.md §8.1.
// Además adjunta la CSP (con nonce) a toda respuesta HTML, /admin incluido.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { csp } = construirCsp()

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return siguienteConCsp(request, csp)
  }

  const yaTienePrefijo = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
  if (yaTienePrefijo) return siguienteConCsp(request, csp)

  const preferido = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale = preferido && isLocale(preferido) ? preferido : defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
