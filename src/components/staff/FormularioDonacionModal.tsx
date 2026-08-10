'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearDonacion } from '@/actions/crear-donacion'
import { editarDonacion } from '@/actions/editar-donacion'
import type { Donacion } from '@/payload-types'
import type { Locale } from '@/i18n'

type ComunidadSimple = { id: number; nombre: string }

type Props = {
  locale: Locale
  donacion?: Donacion
  comunidades: ComunidadSimple[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioDonacionModal({ locale, donacion, comunidades, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!donacion

  const [institucion, setInstitucion] = useState(donacion?.institucion ?? '')
  const [tipoInstitucion, setTipoInstitucion] = useState<'escuela' | 'universidad' | 'centro_salud' | 'iglesia' | 'otro'>(
    donacion?.tipo_institucion ?? 'escuela'
  )
  const [comunidadId, setComunidadId] = useState<number | ''>(
    typeof donacion?.comunidad === 'object' ? donacion.comunidad?.id ?? '' : donacion?.comunidad ?? ''
  )
  const [descripcion, setDescripcion] = useState(donacion?.descripcion ?? '')
  const [fecha, setFecha] = useState(donacion?.fecha?.slice(0, 10) ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!institucion.trim()) {
      setErrorMsg('La institución es obligatoria.')
      return
    }

    setCargando(true)

    const base = {
      institucion,
      tipo_institucion: tipoInstitucion,
      comunidadId: comunidadId ? Number(comunidadId) : undefined,
      descripcion: descripcion || undefined,
      fecha: fecha || undefined,
      locale,
    }

    const res = esEdicion ? await editarDonacion({ ...base, id: donacion.id }) : await crearDonacion(base)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setInstitucion('')
        setTipoInstitucion('escuela')
        setComunidadId('')
        setDescripcion('')
        setFecha('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Donación' : '+ Nueva Donación'

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
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Programas</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Donación' : 'Nueva Donación'}
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
                  Institución <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value)}
                  placeholder="Ej. Escuela Membrillo"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Tipo de Institución</label>
                  <select
                    value={tipoInstitucion}
                    onChange={(e) => setTipoInstitucion(e.target.value as typeof tipoInstitucion)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="escuela">Escuela</option>
                    <option value="universidad">Universidad</option>
                    <option value="centro_salud">Centro de salud</option>
                    <option value="iglesia">Iglesia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Comunidad</label>
                  <select
                    value={comunidadId}
                    onChange={(e) => setComunidadId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Sin especificar</option>
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana sm:w-56"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Descripción (qué se donó)</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. 5 computadoras, material didáctico"
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar Donación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
