'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearRecurso } from '@/actions/crear-recurso'
import { editarRecurso } from '@/actions/editar-recurso'
import type { Recurso, Nivel, Materia } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  recurso?: Recurso
  niveles: Nivel[]
  materias: Materia[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioRecursoModal({
  locale,
  recurso,
  niveles,
  materias,
  triggerText,
  variant = 'primary',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!recurso

  const [titulo, setTitulo] = useState(recurso?.titulo ?? '')
  const [tipo, setTipo] = useState<'pdf_propio' | 'enlace_externo' | 'video_youtube' | 'practica'>(
    recurso?.tipo ?? 'enlace_externo'
  )
  const [nivelId, setNivelId] = useState<number | ''>(
    typeof recurso?.nivel === 'object' ? recurso.nivel?.id ?? '' : recurso?.nivel ?? ''
  )
  const [materiaId, setMateriaId] = useState<number | ''>(
    typeof recurso?.materia === 'object' ? recurso.materia?.id ?? '' : recurso?.materia ?? ''
  )
  const [idioma, setIdioma] = useState<'es' | 'en'>(recurso?.idioma ?? 'es')
  const [url, setUrl] = useState(recurso?.url ?? '')
  const [fuenteYLicencia, setFuenteYLicencia] = useState(recurso?.fuente_y_licencia ?? '')
  const [archivoFile, setArchivoFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    let archivo: FormData | undefined
    if (archivoFile) {
      archivo = new FormData()
      archivo.append('file', archivoFile)
    }

    const base = {
      titulo,
      tipo,
      nivel: nivelId || undefined,
      materia: materiaId || undefined,
      idioma,
      url: url || undefined,
      fuenteYLicencia,
      archivo,
      locale,
    }

    const res = esEdicion
      ? await editarRecurso({ ...base, id: recurso.id })
      : await crearRecurso(base)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setTitulo('')
        setNivelId('')
        setMateriaId('')
        setUrl('')
        setFuenteYLicencia('')
        setArchivoFile(null)
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Recurso' : '+ Nuevo Recurso'

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={
          variant === 'primary'
            ? 'rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90'
            : 'rounded-sm border border-montana px-3 py-1 font-dato text-xs font-bold uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white'
        }
      >
        {triggerText ?? defaultTrigger}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/60 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-xl rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Biblioteca del Centro de Aprendizaje</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Recurso' : 'Agregar Nuevo Recurso'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="font-dato text-sm font-bold text-piedra hover:text-tinta"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-sm border border-cosecha/50 bg-cosecha/10 p-3 font-lectura text-sm text-tinta">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Título <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Guía de fracciones para primaria"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Tipo <span className="text-cosecha">*</span>
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as typeof tipo)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="enlace_externo">Enlace externo</option>
                    <option value="video_youtube">Video de YouTube</option>
                    <option value="pdf_propio">PDF propio</option>
                    <option value="practica">Práctica (se gestiona en /admin)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Idioma <span className="text-cosecha">*</span>
                  </label>
                  <select
                    value={idioma}
                    onChange={(e) => setIdioma(e.target.value as typeof idioma)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                  </select>
                </div>
              </div>

              {(tipo === 'enlace_externo' || tipo === 'video_youtube') && (
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    URL <span className="text-cosecha">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              )}

              {tipo === 'pdf_propio' && (
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Archivo PDF {esEdicion ? '(dejar vacío para conservar el actual)' : <span className="text-cosecha">*</span>}
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setArchivoFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-1.5 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Nivel</label>
                  <select
                    value={nivelId}
                    onChange={(e) => setNivelId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Sin especificar</option>
                    {niveles.map((n) => (
                      <option key={n.id} value={n.id}>{n.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Materia</label>
                  <select
                    value={materiaId}
                    onChange={(e) => setMateriaId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Sin especificar</option>
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Fuente y Licencia <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fuenteYLicencia}
                  onChange={(e) => setFuenteYLicencia(e.target.value)}
                  placeholder="Ej. Elaboración propia, uso libre"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-piedra/25">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="rounded-sm border border-piedra/25 px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-tinta hover:bg-niebla"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-sm border border-montana bg-montana px-5 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
