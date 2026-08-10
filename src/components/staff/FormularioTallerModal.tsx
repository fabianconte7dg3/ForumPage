'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearTaller } from '@/actions/crear-taller'
import { editarTaller } from '@/actions/editar-taller'
import type { Taller, Sede } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  taller?: Taller
  sedes: Sede[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioTallerModal({ locale, taller, sedes, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!taller

  const [nombre, setNombre] = useState(taller?.nombre ?? '')
  const [tipo, setTipo] = useState<'estudiantes' | 'adultos'>(taller?.tipo ?? 'estudiantes')
  const [sedeId, setSedeId] = useState<number | ''>(
    typeof taller?.sede === 'object' ? taller.sede?.id ?? '' : taller?.sede ?? ''
  )
  const [fecha, setFecha] = useState(taller?.fecha?.slice(0, 10) ?? '')
  const [responsable, setResponsable] = useState(taller?.responsable ?? '')
  const [realizada, setRealizada] = useState(taller?.realizada ?? false)
  const [participantes, setParticipantes] = useState<number | ''>(taller?.participantes ?? '')
  const [notas, setNotas] = useState(taller?.notas ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!nombre.trim()) {
      setErrorMsg('El nombre del taller es obligatorio.')
      return
    }

    setCargando(true)

    const base = {
      nombre,
      tipo,
      sede: sedeId ? Number(sedeId) : undefined,
      fecha: fecha || undefined,
      responsable: responsable || undefined,
      realizada,
      participantes: realizada && participantes ? Number(participantes) : undefined,
      notas: notas || undefined,
      locale,
    }

    const res = esEdicion ? await editarTaller({ ...base, id: taller.id }) : await crearTaller(base)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setNombre('')
        setTipo('estudiantes')
        setSedeId('')
        setFecha('')
        setResponsable('')
        setRealizada(false)
        setParticipantes('')
        setNotas('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Taller' : '+ Nuevo Taller'

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
                  {esEdicion ? 'Editar Taller' : 'Nuevo Taller'}
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
                  Nombre del Taller <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Taller de Autoestima"
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
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar Taller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
