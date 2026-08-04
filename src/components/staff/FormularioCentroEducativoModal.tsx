'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearCentroEducativo } from '@/actions/crear-centro-educativo'
import { editarCentroEducativo } from '@/actions/editar-centro-educativo'
import type { Comunidad, CentroEducativo } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  centro?: CentroEducativo
  comunidades: Comunidad[]
  locale: Locale
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioCentroEducativoModal({ centro, comunidades, locale, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!centro
  const comunidadInicialId = centro?.comunidad ? (typeof centro.comunidad === 'object' ? centro.comunidad.id : centro.comunidad) : ''

  const [nombre, setNombre] = useState(centro?.nombre ?? '')
  const [comunidadId, setComunidadId] = useState<number | ''>(comunidadInicialId)
  const [lat, setLat] = useState<number | ''>(centro?.coordenadas?.lat ?? '')
  const [lng, setLng] = useState<number | ''>(centro?.coordenadas?.lng ?? '')
  const [nivelesAtendidos, setNivelesAtendidos] = useState(centro?.niveles_atendidos ?? '')
  const [matricula, setMatricula] = useState<number | ''>(centro?.matricula_aproximada ?? '')
  const [contacto, setContacto] = useState(centro?.contacto ?? '')

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
      comunidadId: Number(comunidadId),
      lat: Number(lat),
      lng: Number(lng),
      niveles_atendidos: nivelesAtendidos,
      matricula_aproximada: matricula === '' ? undefined : Number(matricula),
      contacto,
      locale,
    }

    const res = esEdicion ? await editarCentroEducativo({ id: centro.id, ...datos }) : await crearCentroEducativo(datos)

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
        setNivelesAtendidos('')
        setMatricula('')
        setContacto('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Centro' : '+ Nuevo Centro Educativo'

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
                  {esEdicion ? 'Editar Centro Educativo' : 'Agregar Centro Educativo'}
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
                  placeholder="Ej. Escuela Los Algarrobos"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
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
                      className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Niveles atendidos</label>
                  <input
                    type="text"
                    value={nivelesAtendidos}
                    onChange={(e) => setNivelesAtendidos(e.target.value)}
                    placeholder="Ej. Primaria y premedia"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Matrícula aproximada</label>
                  <input
                    type="number"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Contacto</label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  placeholder="Ej. Director/a, teléfono"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Centro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
