'use client'

import { useState, useTransition } from 'react'
import { verificarAcademico } from '@/actions/verificar-academico'

type Materia = { nombre: string; calificacion: string }

export function FormularioVerificacionAcademica({ 
  id, 
  locale, 
  becarioId 
}: { 
  id: number, 
  locale: string, 
  becarioId: number 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [indice, setIndice] = useState('')
  const [aprobadas, setAprobadas] = useState<Materia[]>([])
  const [reprobadas, setReprobadas] = useState<Materia[]>([])

  const handleAgregarAprobada = () => setAprobadas([...aprobadas, { nombre: '', calificacion: '' }])
  const handleRemoverAprobada = (index: number) => setAprobadas(aprobadas.filter((_, i) => i !== index))
  const handleCambioAprobada = (index: number, campo: keyof Materia, valor: string) => {
    const nuevas = [...aprobadas]
    nuevas[index][campo] = valor
    setAprobadas(nuevas)
  }

  const handleAgregarReprobada = () => setReprobadas([...reprobadas, { nombre: '', calificacion: '' }])
  const handleRemoverReprobada = (index: number) => setReprobadas(reprobadas.filter((_, i) => i !== index))
  const handleCambioReprobada = (index: number, campo: keyof Materia, valor: string) => {
    const nuevas = [...reprobadas]
    nuevas[index][campo] = valor
    setReprobadas(nuevas)
  }

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filtrar materias vacías
    const finalAprobadas = aprobadas.filter(m => m.nombre.trim() !== '')
    const finalReprobadas = reprobadas.filter(m => m.nombre.trim() !== '')

    setError(null)
    startTransition(async () => {
      const res = await verificarAcademico('registros-academicos', id, locale, becarioId, {
        indice: indice ? Number(indice) : undefined,
        materias_aprobadas: finalAprobadas,
        materias_reprobadas: finalReprobadas
      })
      if (res.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    })
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-3 rounded-sm bg-montana px-4 py-1.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 sm:mt-0"
      >
        {locale === 'es' ? 'Evaluar y Verificar' : 'Evaluate and Verify'}
      </button>
    )
  }

  return (
    <div className="mt-4 w-full rounded-sm border border-montana/30 bg-niebla p-5">
      <div className="mb-4 flex items-center justify-between border-b border-piedra/15 pb-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-montana">
          {locale === 'es' ? 'Ingreso de Calificaciones' : 'Grades Entry'}
        </h3>
        <button 
          type="button"
          onClick={() => setIsOpen(false)}
          className="font-dato text-xs uppercase tracking-widest text-piedra hover:text-cosecha"
        >
          {locale === 'es' ? 'Cancelar' : 'Cancel'}
        </button>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* Índice Académico */}
        <div>
          <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">
            {locale === 'es' ? 'Índice Académico (GPA)' : 'GPA'}
          </label>
          <input 
            type="number" 
            step="0.01"
            value={indice}
            onChange={(e) => setIndice(e.target.value)}
            placeholder="Ej. 2.5"
            className="w-full max-w-[200px] rounded-sm border border-piedra/25 px-3 py-2 font-mono text-sm outline-none focus:border-montana"
          />
        </div>

        {/* Materias Reprobadas (CRÍTICO) */}
        <div className="rounded-sm border border-cosecha/30 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-widest text-cosecha">
                {locale === 'es' ? 'Materias Reprobadas' : 'Failed Subjects'}
              </h4>
              <p className="font-lectura text-xs text-tinta/60">
                {locale === 'es' ? '⚠️ Agregar materias aquí suspenderá al becario automáticamente.' : '⚠️ Adding subjects here will automatically suspend the becario.'}
              </p>
            </div>
            <button 
              type="button"
              onClick={handleAgregarReprobada}
              className="rounded-sm border border-cosecha px-2 py-1 font-dato text-xs uppercase tracking-widest text-cosecha hover:bg-cosecha hover:text-white"
            >
              + {locale === 'es' ? 'Agregar' : 'Add'}
            </button>
          </div>
          
          <div className="space-y-2">
            {reprobadas.map((mat, i) => (
              <div key={i} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={mat.nombre}
                  onChange={(e) => handleCambioReprobada(i, 'nombre', e.target.value)}
                  placeholder={locale === 'es' ? 'Nombre de materia' : 'Subject name'}
                  required
                  className="flex-1 rounded-sm border border-piedra/25 px-3 py-1.5 font-lectura text-sm outline-none focus:border-cosecha"
                />
                <input 
                  type="text" 
                  value={mat.calificacion}
                  onChange={(e) => handleCambioReprobada(i, 'calificacion', e.target.value)}
                  placeholder="Nota (Ej. F)"
                  required
                  className="w-24 rounded-sm border border-piedra/25 px-3 py-1.5 font-mono text-sm outline-none focus:border-cosecha"
                />
                <button type="button" onClick={() => handleRemoverReprobada(i)} className="text-piedra hover:text-cosecha">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Materias Aprobadas (Opcional) */}
        <div className="rounded-sm border border-montana/30 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-widest text-montana">
                {locale === 'es' ? 'Materias Aprobadas (Opcional)' : 'Passed Subjects (Optional)'}
              </h4>
            </div>
            <button 
              type="button"
              onClick={handleAgregarAprobada}
              className="rounded-sm border border-montana px-2 py-1 font-dato text-xs uppercase tracking-widest text-montana hover:bg-montana hover:text-white"
            >
              + {locale === 'es' ? 'Agregar' : 'Add'}
            </button>
          </div>
          
          <div className="space-y-2">
            {aprobadas.map((mat, i) => (
              <div key={i} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={mat.nombre}
                  onChange={(e) => handleCambioAprobada(i, 'nombre', e.target.value)}
                  placeholder={locale === 'es' ? 'Nombre de materia' : 'Subject name'}
                  required
                  className="flex-1 rounded-sm border border-piedra/25 px-3 py-1.5 font-lectura text-sm outline-none focus:border-montana"
                />
                <input 
                  type="text" 
                  value={mat.calificacion}
                  onChange={(e) => handleCambioAprobada(i, 'calificacion', e.target.value)}
                  placeholder="Nota (Ej. A)"
                  required
                  className="w-24 rounded-sm border border-piedra/25 px-3 py-1.5 font-mono text-sm outline-none focus:border-montana"
                />
                <button type="button" onClick={() => handleRemoverAprobada(i)} className="text-piedra hover:text-cosecha">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-piedra/15 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-sm bg-montana px-6 py-2 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
          >
            {isPending ? '...' : locale === 'es' ? 'Guardar y Verificar' : 'Save and Verify'}
          </button>
          {error && <span className="font-dato text-xs text-cosecha">{error}</span>}
        </div>
      </form>
    </div>
  )
}
