'use client'

import { useState, useTransition } from 'react'
import { verificarAcademico } from '@/actions/verificar-academico'

export function AccionesAcademicas({ 
  tipo, 
  id, 
  locale, 
  becarioId 
}: { 
  tipo: 'registros-academicos' | 'recuperaciones', 
  id: number, 
  locale: string, 
  becarioId: number 
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleVerificar = () => {
    setError(null)
    startTransition(async () => {
      const res = await verificarAcademico(tipo, id, locale, becarioId)
      if (res.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-piedra/15 pt-3 sm:mt-0 sm:flex-row sm:items-center sm:border-0 sm:pt-0">
      {error && <span className="font-dato text-xs text-cosecha">{error}</span>}
      <button
        onClick={handleVerificar}
        disabled={isPending}
        className="rounded-sm bg-montana px-4 py-1.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
      >
        {isPending ? '...' : locale === 'es' ? 'Verificar' : 'Verify'}
      </button>
    </div>
  )
}
