'use client'

import { useState } from 'react'

import { cambiarPassword } from '@/actions/cambiar-password'
import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    titulo: 'Cambiar contraseña',
    actual: 'Contraseña actual',
    nueva: 'Contraseña nueva',
    confirmar: 'Confirmar contraseña nueva',
    guardar: 'Cambiar contraseña',
    guardando: 'Guardando...',
    exito: 'Contraseña actualizada.',
    noCoinciden: 'Las contraseñas nuevas no coinciden.',
    corta: 'La nueva contraseña debe tener al menos 8 caracteres.',
  },
  en: {
    titulo: 'Change password',
    actual: 'Current password',
    nueva: 'New password',
    confirmar: 'Confirm new password',
    guardar: 'Change password',
    guardando: 'Saving...',
    exito: 'Password updated.',
    noCoinciden: "New passwords don't match.",
    corta: 'The new password must be at least 8 characters.',
  },
} satisfies Record<Locale, Record<string, string>>

export function FormularioCambiarPassword({ locale }: { locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS.es

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (passwordNueva.length < 8) {
      setErrorMsg(t.corta)
      return
    }
    if (passwordNueva !== passwordConfirmar) {
      setErrorMsg(t.noCoinciden)
      return
    }

    setCargando(true)
    const res = await cambiarPassword({ passwordActual, passwordNueva })
    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg(t.exito)
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirmar('')
    }
  }

  return (
    <div className="max-w-md rounded-sm border border-piedra/25 bg-white p-6">
      <h2 className="mb-4 font-display text-sm font-bold uppercase text-tinta">{t.titulo}</h2>

      {successMsg && <p className="mb-4 font-lectura text-sm text-montana">{successMsg}</p>}
      {errorMsg && <p className="mb-4 font-lectura text-sm text-cosecha">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="password-actual">
            {t.actual}
          </label>
          <input
            id="password-actual"
            type="password"
            required
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
          />
        </div>
        <div>
          <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="password-nueva">
            {t.nueva}
          </label>
          <input
            id="password-nueva"
            type="password"
            required
            minLength={8}
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
          />
        </div>
        <div>
          <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="password-confirmar">
            {t.confirmar}
          </label>
          <input
            id="password-confirmar"
            type="password"
            required
            minLength={8}
            value={passwordConfirmar}
            onChange={(e) => setPasswordConfirmar(e.target.value)}
            className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
        >
          {cargando ? t.guardando : t.guardar}
        </button>
      </form>
    </div>
  )
}
