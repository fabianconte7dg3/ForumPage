'use client'

import { useState, useTransition } from 'react'
import { crearDesembolso } from '@/actions/crear-desembolso'

export function FormularioDesembolso({ 
  locale, 
  becarioId 
}: { 
  locale: string, 
  becarioId: number 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [concepto, setConcepto] = useState('')

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto || !fecha) return

    setError(null)
    startTransition(async () => {
      const res = await crearDesembolso(becarioId, Number(monto), fecha, concepto, locale)
      if (res.error) {
        setError(res.error)
      } else {
        // Reset and close
        setMonto('')
        setFecha('')
        setConcepto('')
        setIsOpen(false)
      }
    })
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-sm border border-tinta px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-tinta transition-colors hover:bg-tinta hover:text-white"
      >
        {locale === 'es' ? '+ Registrar Pago' : '+ Register Payment'}
      </button>
    )
  }

  return (
    <div className="rounded-sm border border-piedra/25 bg-niebla p-5">
      <div className="mb-4 flex items-center justify-between border-b border-piedra/15 pb-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">
          {locale === 'es' ? 'Registrar Pago Realizado' : 'Register Completed Payment'}
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="font-dato text-xs uppercase tracking-widest text-piedra hover:text-cosecha"
        >
          {locale === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>

      <form onSubmit={handleCrear} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Monto (USD)' : 'Amount (USD)'}
          </label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="rounded-sm border border-piedra/25 px-3 py-2 font-mono text-sm outline-none focus:border-montana"
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Fecha de Pago' : 'Payment Date'}
          </label>
          <input 
            type="date" 
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
          />
        </div>
        
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Concepto' : 'Concept'}
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              required
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder={locale === 'es' ? 'Ej. Matrícula Q1' : 'E.g. Q1 Tuition'}
              className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
            />
            <button
              type="submit"
              disabled={isPending}
              className="shrink-0 rounded-sm bg-montana px-4 py-2 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
            >
              {isPending ? '...' : locale === 'es' ? 'Registrar' : 'Register'}
            </button>
          </div>
        </div>
      </form>
      {error && <p className="mt-3 font-dato text-xs text-cosecha">{error}</p>}
    </div>
  )
}
