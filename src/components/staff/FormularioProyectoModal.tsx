'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearProyecto } from '@/actions/crear-proyecto'
import { editarProyecto } from '@/actions/editar-proyecto'
import type { Proyecto, Comunidad, Programa } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  proyecto?: Proyecto
  comunidades: Comunidad[]
  programas: Programa[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioProyectoModal({
  locale,
  proyecto,
  comunidades,
  programas,
  triggerText,
  variant = 'primary',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!proyecto

  const comunidadInicialId = proyecto?.comunidad
    ? typeof proyecto.comunidad === 'object'
      ? proyecto.comunidad.id
      : proyecto.comunidad
    : comunidades[0]?.id ?? 0

  const programaInicialId = proyecto?.programa
    ? typeof proyecto.programa === 'object'
      ? proyecto.programa.id
      : proyecto.programa
    : ''

  const [titulo, setTitulo] = useState(proyecto?.titulo ?? '')
  const [comunidadId, setComunidadId] = useState<number>(comunidadInicialId)
  const [programaId, setProgramaId] = useState<number | ''>(programaInicialId)
  const [estado, setEstado] = useState<'propuesto' | 'aprobado' | 'en_ejecucion' | 'completado'>(
    proyecto?.estado ?? 'propuesto'
  )
  const [avance, setAvance] = useState<number>(proyecto?.avance ?? 0)
  const [monto, setMonto] = useState<number | ''>(proyecto?.monto ?? '')
  const [fechaInicio, setFechaInicio] = useState(
    proyecto?.fecha_inicio ? new Date(proyecto.fecha_inicio).toISOString().substring(0, 10) : ''
  )
  const [fechaFin, setFechaFin] = useState(
    proyecto?.fecha_fin ? new Date(proyecto.fecha_fin).toISOString().substring(0, 10) : ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!comunidadId) {
      setErrorMsg('Debes seleccionar una comunidad.')
      return
    }

    setCargando(true)

    let res: { success?: boolean; error?: string }
    if (esEdicion) {
      res = await editarProyecto({
        id: proyecto.id,
        titulo,
        comunidadId,
        programaId: programaId ? Number(programaId) : undefined,
        estado,
        avance,
        monto: monto !== '' ? Number(monto) : undefined,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        locale,
      })
    } else {
      res = await crearProyecto({
        titulo,
        comunidadId,
        programaId: programaId ? Number(programaId) : undefined,
        estado,
        avance,
        monto: monto !== '' ? Number(monto) : undefined,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        locale,
      })
    }

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setTitulo('')
        setAvance(0)
        setMonto('')
        setFechaInicio('')
        setFechaFin('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar / Avance' : '+ Nuevo Proyecto'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="my-8 w-full max-w-xl rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Proyectos de Impacto</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Proyecto & Avance' : 'Crear Nuevo Proyecto'}
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
                  Título del Proyecto <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Construcción de Laboratorio de Cómputo"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Comunidad <span className="text-cosecha">*</span>
                  </label>
                  <select
                    required
                    value={comunidadId}
                    onChange={(e) => setComunidadId(Number(e.target.value))}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.distrito})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Programa Asociado
                  </label>
                  <select
                    value={programaId}
                    onChange={(e) => setProgramaId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">-- Ninguno / General --</option>
                    {programas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Estado del Proyecto <span className="text-cosecha">*</span>
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as 'propuesto' | 'aprobado' | 'en_ejecucion' | 'completado')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="propuesto">Propuesto</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="en_ejecucion">En ejecución</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Monto Estimado ($ USD)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 15000"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>

              {/* Slider de porcentaje de avance */}
              <div className="rounded-sm border border-piedra/15 bg-niebla/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-dato text-xs font-bold uppercase tracking-widest text-montana">
                    Avance de la Obra: <span className="text-cosecha">{avance}%</span>
                  </label>
                  <span className="font-dato text-xs font-bold text-piedra">0% a 100%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={avance}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setAvance(val)
                    if (val === 100 && estado !== 'completado') {
                      setEstado('completado')
                    } else if (val > 0 && val < 100 && estado === 'propuesto') {
                      setEstado('en_ejecucion')
                    }
                  }}
                  className="w-full h-2 rounded-lg accent-cosecha bg-piedra/25 cursor-pointer"
                />
                <div className="flex items-center justify-between font-dato text-[10px] text-tinta/60">
                  <span>0% (Inicio)</span>
                  <span>50% (En desarrollo)</span>
                  <span>100% (Completado)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
