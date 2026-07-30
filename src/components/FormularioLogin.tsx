'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    email: 'Correo electrónico',
    password: 'Contraseña',
    entrar: 'Entrar',
    codigo: 'Código de la app autenticadora',
    confirmarCodigo: 'Confirmar código',
    error: 'Correo o contraseña incorrectos',
    codigoInvalido: 'Código inválido o expirado',
    olvidaste: '¿Olvidaste tu contraseña?',
  },
  en: {
    email: 'Email',
    password: 'Password',
    entrar: 'Log in',
    codigo: 'Code from your authenticator app',
    confirmarCodigo: 'Confirm code',
    error: 'Incorrect email or password',
    codigoInvalido: 'Invalid or expired code',
    olvidaste: 'Forgot your password?',
  },
} satisfies Record<Locale, Record<string, string>>

export function FormularioLogin({ locale }: { locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigo, setCodigo] = useState('')
  const [desafioId, setDesafioId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviarCredenciales(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    const res = await fetch('/api/users/login', {
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const body = (await res.json().catch(() => null)) as { desafioId?: string; message?: string; requiere2FA?: boolean } | null
    setEnviando(false)
    if (res.ok && body?.requiere2FA && body.desafioId) {
      setDesafioId(body.desafioId)
    } else if (res.ok) {
      router.push(`/${locale}/portal`)
      router.refresh()
    } else {
      setError(body?.message ?? t.error)
    }
  }

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    const res = await fetch('/api/users/login', {
      body: JSON.stringify({ codigo, desafioId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    setEnviando(false)
    if (res.ok) {
      router.push(`/${locale}/portal`)
      router.refresh()
    } else {
      setError(t.codigoInvalido)
    }
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
    <form className="max-w-sm space-y-4" onSubmit={enviarCredenciales}>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="email">
          {t.email}
        </label>
        <input
          className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </div>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="password">
          {t.password}
        </label>
        <input
          className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      {error && <p className="font-lectura text-sm text-red-700">{error}</p>}
      <button
        className="rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white disabled:opacity-40"
        disabled={enviando}
        type="submit"
      >
        {t.entrar}
      </button>
      <Link className="block font-dato text-xs text-tinta/60 underline" href={`/${locale}/cuenta/recuperar`}>
        {t.olvidaste}
      </Link>
    </form>
  )
}
