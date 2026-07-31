'use client'

import { useState, useTransition } from 'react'
import { gestionarDesembolso } from '@/actions/gestionar-desembolso'

export function AccionesDesembolso({ 
  id, 
  estadoActual,
  locale, 
  becarioId 
}: { 
  id: number, 
  estadoActual: 'programado' | 'retenido' | 'pagado' | 'cancelado',
  locale: string, 
  becarioId: number 
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleCambio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value as 'programado' | 'retenido' | 'pagado' | 'cancelado'
    if (nuevoEstado === estadoActual) return

    setError(null)
    startTransition(async () => {
      const res = await gestionarDesembolso(id, nuevoEstado, locale, becarioId)
      if (res.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <select 
        value={estadoActual}
        onChange={handleCambio}
        disabled={isPending}
        className="rounded-sm border border-piedra/25 bg-white px-2 py-1 font-dato text-xs uppercase tracking-widest text-tinta outline-none focus:border-montana disabled:opacity-50"
      >
        <option value="programado">{locale === 'es' ? 'Programado' : 'Scheduled'}</option>
        <option value="retenido">{locale === 'es' ? 'Retenido' : 'Withheld'}</option>
        <option value="pagado">{locale === 'es' ? 'Pagado' : 'Paid'}</option>
        <option value="cancelado">{locale === 'es' ? 'Cancelado' : 'Cancelled'}</option>
      </select>
      {error && <span className="text-[10px] text-cosecha">{error}</span>}
    </div>
  )
}
