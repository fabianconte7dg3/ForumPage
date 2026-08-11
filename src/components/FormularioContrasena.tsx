'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    password: 'Contraseña',
    confirmar: 'Confirmar contraseña',
    exito: 'Listo. Ya podés iniciar sesión.',
    noCoincide: 'Las contraseñas no coinciden',
    cortita: 'La contraseña debe tener al menos 8 caracteres',
    irAlPanel: 'Ir al panel',
    error: 'No se pudo completar la operación',
    codigo: 'Código de la app autenticadora',
    confirmarCodigo: 'Confirmar código',
    codigoInvalido: 'Código inválido o expirado — volvé a intentar',
  },
  en: {
    password: 'Password',
    confirmar: 'Confirm password',
    exito: 'Done. You can log in now.',
    noCoincide: 'Passwords do not match',
    cortita: 'Password must be at least 8 characters',
    irAlPanel: 'Go to the panel',
    error: 'Could not complete the operation',
    codigo: 'Code from your authenticator app',
    confirmarCodigo: 'Confirm code',
    codigoInvalido: 'Invalid or expired code — try again',
  },
} satisfies Record<Locale, Record<string, string>>

// Un solo endpoint (/api/users/reset-password) sirve tanto para la primera
// activación (invitación) como para restablecer una contraseña olvidada — la
// única diferencia real es el texto del botón. Si la cuenta tiene 2FA
// habilitado (nunca pasa en una invitación nueva, sí puede pasar al
// restablecer una cuenta existente), el mismo endpoint devuelve un desafío en
// vez de la sesión — acá se completa ese segundo paso.
export function FormularioContrasena({ enviarLabel, locale, token }: { enviarLabel: string; locale: Locale; token: string }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [codigo, setCodigo] = useState('')
  const [desafioId, setDesafioId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  async function enviarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError(t.cortita)
      return
    }
    if (password !== confirmar) {
      setError(t.noCoincide)
      return
    }
    setError(null)
    setEnviando(true)
    const res = await fetch('/api/users/reset-password', {
      body: JSON.stringify({ password, token }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const body = (await res.json().catch(() => null)) as { desafioId?: string; message?: string; requiere2FA?: boolean } | null
    setEnviando(false)
    if (res.ok && body?.requiere2FA && body.desafioId) {
      setDesafioId(body.desafioId)
    } else if (res.ok) {
      setExito(true)
    } else {
      setError(body?.message ?? t.error)
    }
  }

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    const res = await fetch('/api/users/reset-password', {
      body: JSON.stringify({ codigo, desafioId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    setEnviando(false)
    if (res.ok) {
      setExito(true)
    } else {
      setError(t.codigoInvalido)
    }
  }

  if (exito) {
    return (
      <div className="space-y-4">
        <p className="font-lectura text-sm text-montana">{t.exito}</p>
        <Link className="inline-block rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white" href={`/${locale}/portal`}>
          {t.irAlPanel}
        </Link>
      </div>
    )
  }

  if (desafioId) {
    return (
      <form className="max-w-sm space-y-4" onSubmit={enviarCodigo}>
        <div>
          <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="codigo">
            {t.codigo}
          </label>
          <input
            className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
            id="codigo"
            inputMode="numeric"
            maxLength={6}
            onChange={(e) => setCodigo(e.target.value)}
            required
            value={codigo}
          />
        </div>
        {error && <p className="font-lectura text-sm text-red-700">{error}</p>}
        <button
          className="rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white disabled:opacity-40"
          disabled={enviando}
          type="submit"
        >
          {t.confirmarCodigo}
        </button>
      </form>
    )
  }

  return (
    <form className="max-w-sm space-y-4" onSubmit={enviarPassword}>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="password">
          {t.password}
        </label>
        <input
          className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
          id="password"
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="confirmar">
          {t.confirmar}
        </label>
        <input
          className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
          id="confirmar"
          minLength={8}
          onChange={(e) => setConfirmar(e.target.value)}
          required
          type="password"
          value={confirmar}
        />
      </div>
      {error && <p className="font-lectura text-sm text-red-700">{error}</p>}
      <button
        className="rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white disabled:opacity-40"
        disabled={enviando}
        type="submit"
      >
        {enviarLabel}
      </button>
    </form>
  )
}
