'use client'

import { useState, useTransition } from 'react'
import { crearRegistroAcademico } from '@/actions/crear-registro-academico'

export function FormularioNuevoAcademico({ 
  locale, 
  becarioId 
}: { 
  locale: string, 
  becarioId: number 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [periodo, setPeriodo] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!periodo) return

    setError(null)
    setIsUploading(true)

    let documentoId: number | undefined = undefined

    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        // Subir a la colección Media de Payload
        const uploadRes = await fetch('/api/media', {
          method: 'POST',
          body: formData
        })
        if (!uploadRes.ok) throw new Error('Error al subir el documento')
        
        const uploadData = await uploadRes.json()
        documentoId = uploadData.doc.id
      } catch {
        setIsUploading(false)
        setError('Error al subir el archivo. Revisa el tamaño o intenta de nuevo.')
        return
      }
    }

    startTransition(async () => {
      const res = await crearRegistroAcademico(becarioId, periodo, documentoId, locale)
      setIsUploading(false)
      
      if (res.error) {
        setError(res.error)
      } else {
        setPeriodo('')
        setFile(null)
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
        {locale === 'es' ? '+ Nuevo Período' : '+ New Period'}
      </button>
    )
  }

  const isLoading = isPending || isUploading

  return (
    <div className="rounded-sm border border-piedra/25 bg-niebla p-5">
      <div className="mb-4 flex items-center justify-between border-b border-piedra/15 pb-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">
          {locale === 'es' ? 'Crear Período Académico' : 'Create Academic Period'}
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="font-dato text-xs uppercase tracking-widest text-piedra hover:text-cosecha"
        >
          {locale === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>

      <form onSubmit={handleCrear} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Período' : 'Period'}
          </label>
          <input 
            type="text" 
            required
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            placeholder={locale === 'es' ? 'Ej. 2026-1' : 'E.g. 2026-1'}
            className="rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Documento (Opcional)' : 'Document (Optional)'}
          </label>
          <input 
            type="file" 
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-sm border border-piedra/25 px-3 py-1.5 font-lectura text-sm outline-none focus:border-montana bg-white"
          />
        </div>
        
        <div className="flex items-end sm:col-span-2 md:col-span-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-sm bg-montana px-4 py-2 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
          >
            {isLoading ? '...' : locale === 'es' ? 'Crear' : 'Create'}
          </button>
        </div>
      </form>
      {error && <p className="mt-3 font-dato text-xs text-cosecha">{error}</p>}
    </div>
  )
}
