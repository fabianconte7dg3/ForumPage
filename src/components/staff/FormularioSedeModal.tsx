'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearSede } from '@/actions/crear-sede'
import { editarSede } from '@/actions/editar-sede'
import type { Comunidad, Sede } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  comunidades: Comunidad[]
  locale: Locale
  sede?: Sede
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

const TIPO_OPCIONES: { value: Sede['tipo']; label: string }[] = [
  { value: 'sede_principal', label: 'Sede principal' },
  { value: 'biblioteca', label: 'Biblioteca' },
  { value: 'centro', label: 'Centro' },
]

export function FormularioSedeModal({ comunidades, locale, sede, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!sede
  const comunidadInicialId = sede?.comunidad ? (typeof sede.comunidad === 'object' ? sede.comunidad.id : sede.comunidad) : ''

  const [nombre, setNombre] = useState(sede?.nombre ?? '')
  const [tipo, setTipo] = useState<Sede['tipo']>(sede?.tipo ?? 'centro')
  const [comunidadId, setComunidadId] = useState<number | ''>(comunidadInicialId)
  const [lat, setLat] = useState<number | ''>(sede?.coordenadas?.lat ?? '')
  const [lng, setLng] = useState<number | ''>(sede?.coordenadas?.lng ?? '')
  const [destacada, setDestacada] = useState(sede?.destacada ?? false)
  const [horario, setHorario] = useState(sede?.horario ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (lat === '' || lng === '' || comunidadId === '') {
      setErrorMsg('Completá comunidad y coordenadas.')
      return
    }

    setCargando(true)

    const datos = {
      nombre,
      tipo,
      comunidadId: Number(comunidadId),
      lat: Number(lat),
      lng: Number(lng),
      destacada,
      horario,
      locale,
    }

    const res = esEdicion ? await editarSede({ id: sede.id, ...datos }) : await crearSede(datos)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setNombre('')
        setComunidadId('')
        setLat('')
        setLng('')
        setDestacada(false)
        setHorario('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Sede' : '+ Nueva Sede'

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
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Puntos en el Mapa</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Sede' : 'Agregar Nueva Sede'}
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
                  placeholder="Ej. Biblioteca John Y. Keffer"
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
                    onChange={(e) => setTipo(e.target.value as Sede['tipo'])}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    {TIPO_OPCIONES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Comunidad <span className="text-cosecha">*</span>
                  </label>
                  <select
                    required
                    value={comunidadId}
                    onChange={(e) => setComunidadId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Seleccioná una comunidad</option>
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-sm border border-piedra/15 bg-niebla/40 p-4">
                <label className="mb-2 block font-dato text-xs font-bold uppercase tracking-widest text-montana">
                  Ubicación GPS <span className="text-cosecha">*</span>
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Latitud</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ej. 8.6186"
                      className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Longitud</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ej. -80.3621"
                      className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Horario</label>
                <input
                  type="text"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  placeholder="Ej. Lunes a viernes, 2pm-6pm"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <label className="flex items-center gap-2 font-dato text-xs uppercase tracking-widest text-tinta">
                <input checked={destacada} onChange={(e) => setDestacada(e.target.checked)} type="checkbox" />
                Destacar en el mapa
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
