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
    { href: '/nosotros', label: 'About' },
    { href: '/impacto', label: 'Impact' },
    { href: '/aprende', label: 'Learn' },
    { href: '/historias', label: 'Stories' },
    { href: '/contacto', label: 'Contact' },
  ],
}

const BANDERA: Record<Locale, string> = { es: '🇵🇦', en: '🇺🇸' }
const NOMBRE_IDIOMA: Record<Locale, string> = { es: 'Español', en: 'English' }

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
        <Link className="font-display text-lg font-bold tracking-tight text-montana md:text-xl" href={`/${locale}`}>
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
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            aria-label={`${NOMBRE_IDIOMA[otroLocale]} / Switch to ${NOMBRE_IDIOMA[otroLocale]}`}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-piedra/25 text-base leading-none transition-colors hover:border-montana"
            href={rutaOtroIdioma}
            title={NOMBRE_IDIOMA[otroLocale]}
          >
            <span aria-hidden="true">{BANDERA[otroLocale]}</span>
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
