'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearTutoria } from '@/actions/crear-tutoria'
import { editarTutoria } from '@/actions/editar-tutoria'
import type { Tutoria, Nivel, Materia, Sede } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  tutoria?: Tutoria
  materias: Materia[]
  niveles: Nivel[]
  sedes: Sede[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

// input[type=datetime-local] no acepta ISO con segundos/zona — recorta a
// los primeros 16 caracteres (YYYY-MM-DDTHH:mm) en hora local.
function aDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function FormularioTutoriaModal({
  locale,
  tutoria,
  materias,
  niveles,
  sedes,
  triggerText,
  variant = 'primary',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!tutoria

  const [materiaId, setMateriaId] = useState<number | ''>(
    typeof tutoria?.materia === 'object' ? tutoria.materia?.id ?? '' : tutoria?.materia ?? ''
  )
  const [nivelId, setNivelId] = useState<number | ''>(
    typeof tutoria?.nivel === 'object' ? tutoria.nivel?.id ?? '' : tutoria?.nivel ?? ''
  )
  const [sedeId, setSedeId] = useState<number | ''>(
    typeof tutoria?.sede === 'object' ? tutoria.sede?.id ?? '' : tutoria?.sede ?? ''
  )
  const [fechaHora, setFechaHora] = useState(aDatetimeLocal(tutoria?.fecha_hora))
  const [cupo, setCupo] = useState<number | ''>(tutoria?.cupo ?? '')
  const [responsable, setResponsable] = useState(tutoria?.responsable ?? '')
  const [recurrencia, setRecurrencia] = useState<'ninguna' | 'semanal' | 'quincenal' | 'mensual'>(
    tutoria?.recurrencia ?? 'ninguna'
  )
  const [notas, setNotas] = useState(tutoria?.notas ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!materiaId || !sedeId || !fechaHora) {
      setErrorMsg('Completá materia, sede y fecha/hora.')
      return
    }

    setCargando(true)

    const base = {
      materia: Number(materiaId),
      nivel: nivelId ? Number(nivelId) : undefined,
      sede: Number(sedeId),
      fechaHora,
      cupo: cupo ? Number(cupo) : undefined,
      responsable: responsable || undefined,
      recurrencia,
      notas: notas || undefined,
      locale,
    }

    const res = esEdicion
      ? await editarTutoria({ ...base, id: tutoria.id })
      : await crearTutoria(base)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setMateriaId('')
        setNivelId('')
        setSedeId('')
        setFechaHora('')
        setCupo('')
        setResponsable('')
        setRecurrencia('ninguna')
        setNotas('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Tutoría' : '+ Nueva Tutoría'

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
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Centro de Aprendizaje</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Tutoría' : 'Agendar Nueva Tutoría'}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Materia <span className="text-cosecha">*</span>
                  </label>
                  <select
                    required
                    value={materiaId}
                    onChange={(e) => setMateriaId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Seleccionar...</option>
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Sede <span className="text-cosecha">*</span>
                </label>
                <select
                  required
                  value={sedeId}
                  onChange={(e) => setSedeId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                >
                  <option value="">Seleccionar...</option>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Fecha y Hora <span className="text-cosecha">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={fechaHora}
                    onChange={(e) => setFechaHora(e.target.value)}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Cupo</label>
                  <input
                    type="number"
                    min={0}
                    value={cupo}
                    onChange={(e) => setCupo(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 15"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Recurrencia</label>
                  <select
                    value={recurrencia}
                    onChange={(e) => setRecurrencia(e.target.value as typeof recurrencia)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="ninguna">Ninguna</option>
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Notas</label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej. Traer calculadora"
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Agendar Tutoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
