'use client'

import { useRouter } from 'next/navigation'

import type { Locale } from '@/i18n'

export function BotonCerrarSesion({ locale, texto }: { locale: Locale; texto: string }) {
  const router = useRouter()

  async function salir() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push(`/${locale}/portal`)
    router.refresh()
  }

  return (
    <button className="font-dato text-xs uppercase tracking-widest text-tinta/60 underline" onClick={salir} type="button">
      {texto}
    </button>
  )
}
