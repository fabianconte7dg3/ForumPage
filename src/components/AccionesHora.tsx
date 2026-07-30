'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { gestionarHora } from '@/actions/gestionar-hora'

type Locale = 'es' | 'en'

const TEXTOS = {
  es: {
    aprobar: 'Aprobar',
    rechazar: 'Rechazar',
    comentarioPlaceholder: 'Motivo del rechazo (visible para el becario)',
    confirmarRechazo: 'Confirmar rechazo',
    cancelar: 'Cancelar',
    procesando: 'Procesando…',
  },
  en: {
    aprobar: 'Approve',
    rechazar: 'Reject',
    comentarioPlaceholder: 'Rejection reason (visible to the becario)',
    confirmarRechazo: 'Confirm rejection',
    cancelar: 'Cancel',
    procesando: 'Processing…',
  },
} as const

export function AccionesHora({ horaId, locale }: { horaId: number; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const router = useRouter()
  const [procesando, setProcesando] = useState(false)
  const [mostrarRechazo, setMostrarRechazo] = useState(false)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function aprobar() {
    setProcesando(true)
    setError(null)
    const resultado = await gestionarHora(horaId, 'aprobada')
    if (!resultado.ok) {
      setError(resultado.error)
      setProcesando(false)
      return
    }
    router.refresh()
  }

  async function rechazar() {
    setProcesando(true)
    setError(null)
    const resultado = await gestionarHora(horaId, 'rechazada', comentario)
    if (!resultado.ok) {
      setError(resultado.error)
      setProcesando(false)
      return
    }
    router.refresh()
  }

  if (mostrarRechazo) {
    return (
      <div className="mt-3 border-t border-piedra/15 pt-3">
        <textarea
          className="block w-full resize-none rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta outline-none transition-colors focus:border-cosecha"
          maxLength={500}
          onChange={(e) => setComentario(e.target.value)}
          placeholder={t.comentarioPlaceholder}
          rows={2}
          value={comentario}
        />
        {error && <p className="mt-1 font-lectura text-xs text-cosecha">{error}</p>}
        <div className="mt-2 flex items-center gap-2">
          <button
            className="rounded-sm bg-cosecha px-4 py-1.5 font-dato text-xs uppercase tracking-widest text-white transition-colors hover:bg-cosecha/90 disabled:opacity-50"
            disabled={procesando}
            onClick={rechazar}
            type="button"
          >
            {procesando ? t.procesando : t.confirmarRechazo}
          </button>
          <button
            className="rounded-sm border border-piedra/25 px-4 py-1.5 font-dato text-xs uppercase tracking-widest text-tinta transition-colors hover:bg-niebla"
            disabled={procesando}
            onClick={() => { setMostrarRechazo(false); setError(null) }}
            type="button"
          >
            {t.cancelar}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-piedra/15 pt-3">
      <button
        className="rounded-sm bg-montana px-4 py-1.5 font-dato text-xs uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
        disabled={procesando}
        onClick={aprobar}
        type="button"
      >
        {procesando ? t.procesando : t.aprobar}
      </button>
      <button
        className="rounded-sm border border-cosecha px-4 py-1.5 font-dato text-xs uppercase tracking-widest text-cosecha transition-colors hover:bg-cosecha/10 disabled:opacity-50"
        disabled={procesando}
        onClick={() => setMostrarRechazo(true)}
        type="button"
      >
        {t.rechazar}
      </button>
      {error && <p className="font-lectura text-xs text-cosecha">{error}</p>}
    </div>
  )
}
