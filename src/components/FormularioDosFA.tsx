'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    activo: 'Verificación en dos pasos activa',
    inactivo: 'Verificación en dos pasos inactiva',
    activarBoton: 'Activar verificación en dos pasos',
    desactivarBoton: 'Desactivar verificación en dos pasos',
    cancelar: 'Cancelar',
    pasoQr: 'Escaneá este código con tu app autenticadora (Google Authenticator, Authy, etc.).',
    pasoManual: 'O ingresá esta clave manualmente:',
    codigoLabel: 'Código de 6 dígitos de la app',
    confirmar: 'Confirmar y activar',
    confirmando: 'Confirmando...',
    passwordLabel: 'Confirmá tu contraseña para desactivar',
    desactivarConfirmar: 'Desactivar',
    desactivando: 'Desactivando...',
    generando: 'Generando...',
    errorGenerico: 'Ocurrió un error. Probá de nuevo.',
    errorCodigo: 'Código inválido.',
    errorPassword: 'Contraseña incorrecta.',
    exitoActivado: '2FA activado correctamente.',
    exitoDesactivado: '2FA desactivado.',
  },
  en: {
    activo: 'Two-step verification active',
    inactivo: 'Two-step verification inactive',
    activarBoton: 'Turn on two-step verification',
    desactivarBoton: 'Turn off two-step verification',
    cancelar: 'Cancel',
    pasoQr: 'Scan this code with your authenticator app (Google Authenticator, Authy, etc.).',
    pasoManual: 'Or enter this key manually:',
    codigoLabel: '6-digit code from the app',
    confirmar: 'Confirm and turn on',
    confirmando: 'Confirming...',
    passwordLabel: 'Confirm your password to turn off',
    desactivarConfirmar: 'Turn off',
    desactivando: 'Turning off...',
    generando: 'Generating...',
    errorGenerico: 'Something went wrong. Try again.',
    errorCodigo: 'Invalid code.',
    errorPassword: 'Incorrect password.',
    exitoActivado: '2FA turned on successfully.',
    exitoDesactivado: '2FA turned off.',
  },
} satisfies Record<Locale, Record<string, string>>

export function FormularioDosFA({ dosFAHabilitado, locale }: { dosFAHabilitado: boolean; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const router = useRouter()

  const [habilitado, setHabilitado] = useState(dosFAHabilitado)
  const [enrolando, setEnrolando] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [secreto, setSecreto] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('')
  const [desactivando, setDesactivando] = useState(false)
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const iniciarEnrolamiento = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setCargando(true)
    const res = await fetch('/api/users/2fa/generar', { method: 'POST' })
    const body = (await res.json().catch(() => null)) as { qr?: string; secreto?: string; message?: string } | null
    setCargando(false)
    if (res.ok && body?.qr && body.secreto) {
      setQr(body.qr)
      setSecreto(body.secreto)
      setEnrolando(true)
    } else {
      setErrorMsg(body?.message ?? t.errorGenerico)
    }
  }

  const cancelarEnrolamiento = () => {
    setEnrolando(false)
    setQr(null)
    setSecreto(null)
    setCodigo('')
    setErrorMsg(null)
  }

  const confirmarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)
    const res = await fetch('/api/users/2fa/confirmar', {
      body: JSON.stringify({ codigo }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    setCargando(false)
    if (res.ok) {
      setHabilitado(true)
      setEnrolando(false)
      setQr(null)
      setSecreto(null)
      setCodigo('')
      setSuccessMsg(t.exitoActivado)
      router.refresh()
    } else {
      setErrorMsg(t.errorCodigo)
    }
  }

  const confirmarDesactivacion = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)
    const res = await fetch('/api/users/2fa/desactivar', {
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    setCargando(false)
    if (res.ok) {
      setHabilitado(false)
      setDesactivando(false)
      setPassword('')
      setSuccessMsg(t.exitoDesactivado)
      router.refresh()
    } else {
      setErrorMsg(t.errorPassword)
    }
  }

  return (
    <div className="max-w-md rounded-sm border border-piedra/25 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-sm font-bold uppercase text-tinta">{habilitado ? t.activo : t.inactivo}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${habilitado ? 'bg-montana' : 'bg-piedra/40'}`} />
      </div>

      {successMsg && <p className="mb-4 font-lectura text-sm text-montana">{successMsg}</p>}
      {errorMsg && <p className="mb-4 font-lectura text-sm text-cosecha">{errorMsg}</p>}

      {habilitado && !desactivando && (
        <button
          type="button"
          onClick={() => setDesactivando(true)}
          className="rounded-sm border border-cosecha px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-cosecha transition-colors hover:bg-cosecha hover:text-white"
        >
          {t.desactivarBoton}
        </button>
      )}

      {habilitado && desactivando && (
        <form onSubmit={confirmarDesactivacion} className="space-y-3">
          <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="password-2fa">
            {t.passwordLabel}
          </label>
          <input
            id="password-2fa"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setDesactivando(false)
                setPassword('')
                setErrorMsg(null)
              }}
              className="rounded-sm border border-piedra/25 px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-tinta hover:bg-niebla"
            >
              {t.cancelar}
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="rounded-sm border border-cosecha bg-cosecha px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-cosecha/90 disabled:opacity-50"
            >
              {cargando ? t.desactivando : t.desactivarConfirmar}
            </button>
          </div>
        </form>
      )}

      {!habilitado && !enrolando && (
        <button
          type="button"
          onClick={iniciarEnrolamiento}
          disabled={cargando}
          className="rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
        >
          {cargando ? t.generando : t.activarBoton}
        </button>
      )}

      {!habilitado && enrolando && qr && secreto && (
        <div className="space-y-4">
          <p className="font-lectura text-sm text-tinta">{t.pasoQr}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="QR de verificación en dos pasos" className="h-44 w-44 border border-piedra/25" src={qr} />
          <p className="font-lectura text-xs text-piedra">
            {t.pasoManual} <span className="break-all font-mono text-tinta">{secreto}</span>
          </p>

          <form onSubmit={confirmarCodigo} className="space-y-3">
            <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="codigo-2fa">
              {t.codigoLabel}
            </label>
            <input
              id="codigo-2fa"
              inputMode="numeric"
              maxLength={6}
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelarEnrolamiento}
                className="rounded-sm border border-piedra/25 px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-tinta hover:bg-niebla"
              >
                {t.cancelar}
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
              >
                {cargando ? t.confirmando : t.confirmar}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
