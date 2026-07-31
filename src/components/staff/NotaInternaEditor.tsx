'use client'

import { useState, useTransition } from 'react'
import { actualizarNotaInterna } from '@/actions/actualizar-nota-interna'

export function NotaInternaEditor({ 
  valorInicial,
  locale, 
  becarioId 
}: { 
  valorInicial: string,
  locale: string, 
  becarioId: number 
}) {
  const [nota, setNota] = useState(valorInicial)
  const [isPending, startTransition] = useTransition()
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito', texto: string } | null>(null)

  const handleGuardar = () => {
    if (nota === valorInicial) return

    setMensaje(null)
    startTransition(async () => {
      const res = await actualizarNotaInterna(becarioId, nota, locale)
      if (res.error) {
        setMensaje({ tipo: 'error', texto: res.error })
      } else {
        setMensaje({ tipo: 'exito', texto: locale === 'es' ? 'Guardado correctamente.' : 'Saved successfully.' })
        setTimeout(() => setMensaje(null), 3000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        rows={6}
        className="w-full resize-y rounded-sm border border-piedra/25 bg-white p-3 font-lectura text-sm text-tinta outline-none focus:border-montana"
        placeholder={locale === 'es' ? 'Escribe aquí observaciones privadas del becario...' : 'Write private observations here...'}
      />
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleGuardar}
          disabled={isPending || nota === valorInicial}
          className="rounded-sm bg-tinta px-5 py-2 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-tinta/90 disabled:opacity-50"
        >
          {isPending ? '...' : locale === 'es' ? 'Guardar Nota' : 'Save Note'}
        </button>
        {mensaje && (
          <span className={`font-dato text-xs ${mensaje.tipo === 'error' ? 'text-cosecha' : 'text-montana'}`}>
            {mensaje.texto}
          </span>
        )}
      </div>
    </div>
  )
}
