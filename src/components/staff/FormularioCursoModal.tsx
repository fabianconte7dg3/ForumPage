'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearCurso } from '@/actions/crear-curso'
import { editarCurso } from '@/actions/editar-curso'
import type { Curso, Sede } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  curso?: Curso
  sedes: Sede[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioCursoModal({ locale, curso, sedes, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!curso

  const [nombre, setNombre] = useState(curso?.nombre ?? '')
  const [tipo, setTipo] = useState<'estudiantes' | 'adultos'>(curso?.tipo ?? 'estudiantes')
  const [sedeId, setSedeId] = useState<number | ''>(
    typeof curso?.sede === 'object' ? curso.sede?.id ?? '' : curso?.sede ?? ''
  )
  const [fechaInicio, setFechaInicio] = useState(curso?.fecha_inicio?.slice(0, 10) ?? '')
  const [responsable, setResponsable] = useState(curso?.responsable ?? '')
  const [realizada, setRealizada] = useState(curso?.realizada ?? false)
  const [participantes, setParticipantes] = useState<number | ''>(curso?.participantes ?? '')
  const [notas, setNotas] = useState(curso?.notas ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!nombre.trim()) {
      setErrorMsg('El nombre del curso es obligatorio.')
      return
    }

    setCargando(true)

    const base = {
      nombre,
      tipo,
      sede: sedeId ? Number(sedeId) : undefined,
      fecha_inicio: fechaInicio || undefined,
      responsable: responsable || undefined,
      realizada,
      participantes: realizada && participantes ? Number(participantes) : undefined,
      notas: notas || undefined,
      locale,
    }

    const res = esEdicion ? await editarCurso({ ...base, id: curso.id }) : await crearCurso(base)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setNombre('')
        setTipo('estudiantes')
        setSedeId('')
        setFechaInicio('')
        setResponsable('')
        setRealizada(false)
        setParticipantes('')
        setNotas('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Curso' : '+ Nuevo Curso'

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
                  {esEdicion ? 'Editar Curso' : 'Nuevo Curso'}
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
                  Nombre del Curso <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Curso de Costura"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as typeof tipo)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="estudiantes">Estudiantes</option>
                    <option value="adultos">Adultos</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Sede</label>
                  <select
                    value={sedeId}
                    onChange={(e) => setSedeId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Sin especificar</option>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Responsable</label>
                  <input
                    type="text"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    placeholder="Ej. Profa. Yariela"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Notas</label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-piedra/25 pt-4">
                <label className="flex items-center gap-2 font-dato text-xs uppercase tracking-widest text-tinta">
                  <input type="checkbox" checked={realizada} onChange={(e) => setRealizada(e.target.checked)} />
                  Se realizó
                </label>

                {realizada && (
                  <div>
                    <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                      Participantes reales
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={participantes}
                      onChange={(e) => setParticipantes(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ej. 12"
                      className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                    />
                  </div>
                )}
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
