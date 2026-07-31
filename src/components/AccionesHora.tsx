'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { gestionarHora } from '@/actions/gestionar-hora'

type Locale = 'es' | 'en'

const TEXTOS = {
  es: {
    evaluar: 'Evaluar y Verificar',
    cancelar: 'Cancelar',
    horasAsignadas: 'Horas a Aprobar',
    comentarioOpcional: 'Comentario (Opcional si aprueba, obligatorio si rechaza)',
    aprobar: 'Aprobar Horas',
    rechazar: 'Rechazar',
    procesando: 'Procesando…',
  },
  en: {
    evaluar: 'Evaluate and Verify',
    cancelar: 'Cancel',
    horasAsignadas: 'Hours to Approve',
    comentarioOpcional: 'Comment (Optional if approving, required if rejecting)',
    aprobar: 'Approve Hours',
    rechazar: 'Reject',
    procesando: 'Processing…',
  },
} as const

export function AccionesHora({ horaId, horasReportadas, locale }: { horaId: number; horasReportadas: number; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const router = useRouter()
  
  const [isOpen, setIsOpen] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [comentario, setComentario] = useState('')
  const [horasFinales, setHorasFinales] = useState(horasReportadas.toString())
  const [error, setError] = useState<string | null>(null)

  async function aprobar() {
    setProcesando(true)
    setError(null)
    const resultado = await gestionarHora(horaId, 'aprobada', comentario, Number(horasFinales))
    if (!resultado.ok) {
      setError(resultado.error)
      setProcesando(false)
      return
    }
    setIsOpen(false)
    router.refresh()
  }

  async function rechazar() {
    if (!comentario.trim()) {
      setError(locale === 'es' ? 'Debe ingresar un motivo para rechazar' : 'Must provide a rejection reason')
      return
    }
    setProcesando(true)
    setError(null)
    const resultado = await gestionarHora(horaId, 'rechazada', comentario)
    if (!resultado.ok) {
      setError(resultado.error)
      setProcesando(false)
      return
    }
    setIsOpen(false)
    router.refresh()
  }

  if (!isOpen) {
    return (
      <div className="mt-3 flex justify-end border-t border-piedra/15 pt-3">
        <button
          className="rounded-sm bg-montana px-4 py-1.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          {t.evaluar}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-sm border border-montana/30 bg-niebla p-4">
      <div className="mb-3 flex items-center justify-between border-b border-piedra/15 pb-2">
        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-montana">
          {locale === 'es' ? 'Verificación de Horas' : 'Hours Verification'}
        </h4>
        <button
          className="font-dato text-xs uppercase tracking-widest text-piedra transition-colors hover:text-cosecha"
          disabled={procesando}
          onClick={() => { setIsOpen(false); setError(null) }}
          type="button"
        >
          {t.cancelar}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">
            {t.horasAsignadas}
          </label>
          <input 
            type="number" 
            min="0"
            step="0.5"
            value={horasFinales}
            onChange={(e) => setHorasFinales(e.target.value)}
            className="w-24 rounded-sm border border-piedra/25 px-3 py-1.5 font-mono text-sm outline-none focus:border-montana"
          />
        </div>

        <div>
          <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">
            {t.comentarioOpcional}
          </label>
          <textarea
            className="block w-full resize-none rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta outline-none transition-colors focus:border-montana"
            maxLength={500}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
            value={comentario}
          />
        </div>

        {error && <p className="font-lectura text-xs text-cosecha">{error}</p>}

        <div className="flex items-center gap-3 border-t border-piedra/15 pt-3">
          <button
            className="rounded-sm bg-montana px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
            disabled={procesando}
            onClick={aprobar}
            type="button"
          >
            {procesando ? t.procesando : t.aprobar}
          </button>
          <button
            className="rounded-sm border border-cosecha px-4 py-2 font-dato text-xs uppercase tracking-widest text-cosecha transition-colors hover:bg-cosecha/10 disabled:opacity-50"
            disabled={procesando}
            onClick={rechazar}
            type="button"
          >
            {procesando ? t.procesando : t.rechazar}
          </button>
        </div>
      </div>
    </div>
  )
}
