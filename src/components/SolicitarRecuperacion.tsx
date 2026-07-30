'use client'

import { useState } from 'react'

import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    email: 'Correo electrónico',
    enviar: 'Enviar enlace',
    // Misma respuesta exista o no la cuenta — evita revelar quién tiene cuenta (05-ciberseguridad.md §3.6).
    enviado: 'Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.',
  },
  en: {
    email: 'Email',
    enviar: 'Send link',
    enviado: 'If an account exists with that email, we sent a link to reset the password.',
  },
} satisfies Record<Locale, Record<string, string>>

export function SolicitarRecuperacion({ locale }: { locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    // El endpoint de Payload ya responde igual exista o no la cuenta —
    // no hay nada que distinguir acá tampoco.
    await fetch('/api/users/forgot-password', {
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) {
    return <p className="font-lectura text-sm text-montana">{t.enviado}</p>
  }

  return (
    <form className="max-w-sm space-y-4" onSubmit={enviar}>
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
