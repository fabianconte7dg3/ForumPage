'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import type { Locale } from '@/i18n'

const NAV: Record<Locale, { href: string; label: string }[]> = {
  es: [
    { href: '', label: 'Inicio' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/impacto', label: 'Impacto' },
    { href: '/aprende', label: 'Aprende' },
    { href: '/historias', label: 'Historias' },
    { href: '/contacto', label: 'Contacto' },
  ],
  en: [
    { href: '', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/impact', label: 'Impact' },
    { href: '/learn', label: 'Learn' },
    { href: '/stories', label: 'Stories' },
    { href: '/contact', label: 'Contact' },
  ],
}

const PORTAL_LABEL: Record<Locale, string> = { es: 'Portal', en: 'Portal' }

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)
  const otroLocale: Locale = locale === 'es' ? 'en' : 'es'
  // Cambia solo el segmento de idioma, preservando el resto de la ruta —
  // no resuelve todavía el slug equivalente de contenido traducido.
  const rutaOtroIdioma = pathname.replace(`/${locale}`, `/${otroLocale}`) || `/${otroLocale}`

  return (
    <header className="sticky top-0 z-50 border-b border-piedra/25 bg-niebla/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-(--container-content) items-center justify-between px-4 py-4 md:px-16">
        <Link className="font-display text-xl font-bold tracking-tight text-montana" href={`/${locale}`}>
          FORUM FOUNDATION
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV[locale].map((item) => (
            <Link
              className="font-display text-sm font-bold uppercase tracking-tight text-tinta/70 transition-colors hover:text-montana"
              href={`/${locale}${item.href}`}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link className="font-dato text-xs text-tinta hover:text-montana" href={rutaOtroIdioma}>
            {otroLocale.toUpperCase()}
          </Link>
          <Link
            className="rounded-md bg-montana px-4 py-2 font-dato text-xs uppercase tracking-wider text-niebla transition-colors hover:bg-montana-hover"
            href={`/${locale}/portal`}
          >
            {PORTAL_LABEL[locale]}
          </Link>
          <button
            aria-expanded={abierto}
            aria-label="Menú"
            className="text-montana md:hidden"
            onClick={() => setAbierto((v) => !v)}
            type="button"
          >
            ☰
          </button>
        </div>
      </div>
      {abierto && (
        <nav className="flex flex-col gap-1 border-t border-piedra/25 px-4 py-4 md:hidden">
          {NAV[locale].map((item) => (
            <Link
              className="py-2 font-display text-sm font-bold uppercase text-tinta/70 hover:text-montana"
              href={`/${locale}${item.href}`}
              key={item.href}
              onClick={() => setAbierto(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
