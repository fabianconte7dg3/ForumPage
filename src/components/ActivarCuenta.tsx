'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    password: 'Contraseña',
    confirmar: 'Confirmar contraseña',
    enviar: 'Activar cuenta',
    exito: 'Cuenta activada. Ya podés iniciar sesión.',
    noCoincide: 'Las contraseñas no coinciden',
    cortita: 'La contraseña debe tener al menos 8 caracteres',
    irAlPanel: 'Ir al panel',
    error: 'No se pudo activar la cuenta',
  },
  en: {
    password: 'Password',
    confirmar: 'Confirm password',
    enviar: 'Activate account',
    exito: 'Account activated. You can log in now.',
    noCoincide: 'Passwords do not match',
    cortita: 'Password must be at least 8 characters',
    irAlPanel: 'Go to the panel',
    error: 'Could not activate the account',
  },
} satisfies Record<Locale, Record<string, string>>

export function ActivarCuenta({ locale, token }: { locale: Locale; token: string }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  async function enviar(e: React.FormEvent) {
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
    setEnviando(false)
    if (res.ok) {
      setExito(true)
    } else {
      const body = (await res.json().catch(() => null)) as { message?: string } | null
      setError(body?.message ?? t.error)
    }
  }

  if (exito) {
    return (
      <div className="space-y-4">
        <p className="font-lectura text-sm text-montana">{t.exito}</p>
        <Link className="inline-block rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white" href="/admin">
          {t.irAlPanel}
        </Link>
      </div>
    )
  }

  return (
    <form className="max-w-sm space-y-4" onSubmit={enviar}>
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
        {t.enviar}
      </button>
    </form>
  )
}
