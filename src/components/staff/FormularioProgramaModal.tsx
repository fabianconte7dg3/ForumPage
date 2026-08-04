'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearPrograma } from '@/actions/crear-programa'
import { editarPrograma } from '@/actions/editar-programa'
import type { Programa } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  programa?: Programa
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioProgramaModal({ locale, programa, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!programa

  const [nombre, setNombre] = useState(programa?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(programa?.descripcion ?? '')
  const [color, setColor] = useState(programa?.color ?? '#17423B')
  const [icono, setIcono] = useState(programa?.icono ?? '')
  const [activo, setActivo] = useState(programa?.activo ?? true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const datos = { nombre, descripcion, color, icono, activo, locale }
    const res = esEdicion ? await editarPrograma({ id: programa.id, ...datos }) : await crearPrograma(datos)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setNombre('')
        setDescripcion('')
        setColor('#17423B')
        setIcono('')
        setActivo(true)
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Programa' : '+ Nuevo Programa'

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
          <div className="my-8 w-full max-w-lg rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Proyectos & Programas</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Programa' : 'Agregar Nuevo Programa'}
                </h2>
              </div>
              <button type="button" onClick={() => setAbierto(false)} className="font-dato text-sm font-bold text-piedra hover:text-tinta">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-sm border border-cosecha/50 bg-cosecha/10 p-3 font-lectura text-sm text-tinta">{errorMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Nombre <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Becas Universitarias"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Descripción</label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Color <span className="text-cosecha">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-9 shrink-0 rounded-sm border border-piedra/25"
                    />
                    <input
                      type="text"
                      required
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#17423B"
                      className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Ícono</label>
                  <input
                    type="text"
                    value={icono}
                    onChange={(e) => setIcono(e.target.value)}
                    placeholder="Ej. graduation-cap"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 font-dato text-xs uppercase tracking-widest text-tinta">
                <input checked={activo} onChange={(e) => setActivo(e.target.checked)} type="checkbox" />
                Programa activo
              </label>

              <div className="flex justify-end space-x-3 border-t border-piedra/25 pt-4">
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Programa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
