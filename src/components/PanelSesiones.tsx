'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { cerrarTodasLasSesiones } from '@/actions/cerrar-todas-sesiones'
import type { Locale } from '@/i18n'

type Textos = {
  cerrando: string
  cerrarTodas: string
  confirmar: string
  sesionesActivas: (n: number) => string
  sinRegistro: string
  titulo: string
  ultimoAcceso: string
}

const TEXTOS: Record<Locale, Textos> = {
  es: {
    titulo: 'Sesiones activas',
    ultimoAcceso: 'Último acceso',
    sinRegistro: 'Sin registro todavía',
    cerrarTodas: 'Cerrar todas las sesiones',
    confirmar: '¿Seguro? Vas a tener que volver a iniciar sesión, en todos los dispositivos donde estés conectado.',
    cerrando: 'Cerrando...',
    sesionesActivas: (n: number) => `${n} sesión${n === 1 ? '' : 'es'} activa${n === 1 ? '' : 's'}`,
  },
  en: {
    titulo: 'Active sessions',
    ultimoAcceso: 'Last access',
    sinRegistro: 'No record yet',
    cerrarTodas: 'Log out everywhere',
    confirmar: "Sure? You'll need to log in again, on every device where you're currently signed in.",
    cerrando: 'Logging out...',
    sesionesActivas: (n: number) => `${n} active session${n === 1 ? '' : 's'}`,
  },
}

export function PanelSesiones({ locale, sesionesActivas, ultimoAcceso }: { locale: Locale; sesionesActivas: number; ultimoAcceso?: string | null }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleCerrarTodas = async () => {
    if (!window.confirm(t.confirmar)) return
    setErrorMsg(null)
    setCargando(true)
    const res = await cerrarTodasLasSesiones()
    if (res.error) {
      setCargando(false)
      setErrorMsg(res.error)
      return
    }
    await fetch('/api/users/logout', { method: 'POST' })
    router.push(`/${locale}/portal`)
    router.refresh()
  }

  return (
    <div className="max-w-md rounded-sm border border-piedra/25 bg-white p-6">
      <h2 className="mb-4 font-display text-sm font-bold uppercase text-tinta">{t.titulo}</h2>

      <dl className="mb-4 space-y-2">
        <div>
          <dt className="font-dato text-xs uppercase tracking-widest text-piedra">{t.ultimoAcceso}</dt>
          <dd className="font-lectura text-sm text-tinta">
            {ultimoAcceso ? new Date(ultimoAcceso).toLocaleString(locale === 'es' ? 'es-PA' : 'en-US') : t.sinRegistro}
          </dd>
        </div>
        <div>
          <dt className="font-dato text-xs uppercase tracking-widest text-piedra">{t.sesionesActivas(sesionesActivas)}</dt>
        </div>
      </dl>

      {errorMsg && <p className="mb-4 font-lectura text-sm text-cosecha">{errorMsg}</p>}

      <button
        type="button"
        onClick={handleCerrarTodas}
        disabled={cargando}
        className="rounded-sm border border-cosecha px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-cosecha transition-colors hover:bg-cosecha hover:text-white disabled:opacity-50"
      >
        {cargando ? t.cerrando : t.cerrarTodas}
      </button>
    </div>
  )
}
