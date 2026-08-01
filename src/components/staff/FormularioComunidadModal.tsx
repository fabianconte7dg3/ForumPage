'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearComunidad } from '@/actions/crear-comunidad'
import { editarComunidad } from '@/actions/editar-comunidad'
import type { Comunidad } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  comunidad?: Comunidad
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioComunidadModal({
  locale,
  comunidad,
  triggerText,
  variant = 'primary',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!comunidad

  const [nombre, setNombre] = useState(comunidad?.nombre ?? '')
  const [distrito, setDistrito] = useState(comunidad?.distrito ?? 'Penonomé')
  const [corregimiento, setCorregimiento] = useState(comunidad?.corregimiento ?? '')
  const [lat, setLat] = useState<number | ''>(comunidad?.coordenadas?.lat ?? '')
  const [lng, setLng] = useState<number | ''>(comunidad?.coordenadas?.lng ?? '')
  const [descripcion, setDescripcion] = useState(comunidad?.descripcion ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (lat === '' || lng === '') {
      setErrorMsg('Debes ingresar la latitud y longitud de la comunidad.')
      return
    }

    setCargando(true)

    let res: { success?: boolean; error?: string }
    if (esEdicion) {
      res = await editarComunidad({
        id: comunidad.id,
        nombre,
        distrito,
        corregimiento,
        lat: Number(lat),
        lng: Number(lng),
        descripcion,
        locale,
      })
    } else {
      res = await crearComunidad({
        nombre,
        distrito,
        corregimiento,
        lat: Number(lat),
        lng: Number(lng),
        descripcion,
        locale,
      })
    }

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setNombre('')
        setCorregimiento('')
        setLat('')
        setLng('')
        setDescripcion('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Comunidad' : '+ Nueva Comunidad'

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
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Puntos en el Mapa</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Comunidad' : 'Agregar Nueva Comunidad'}
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
                  Nombre de la Comunidad <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. El Caimito"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Distrito <span className="text-cosecha">*</span>
                  </label>
                  <select
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana bg-white"
                  >
                    <option value="Penonomé">Penonomé</option>
                    <option value="La Pintada">La Pintada</option>
                    <option value="Antón">Antón</option>
                    <option value="Olá">Olá</option>
                    <option value="Aguadulce">Aguadulce</option>
                    <option value="Natá">Natá</option>
                    <option value="Por determinar">Por determinar / Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Corregimiento
                  </label>
                  <input
                    type="text"
                    value={corregimiento}
                    onChange={(e) => setCorregimiento(e.target.value)}
                    placeholder="Ej. Pajonal"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>

              <div className="rounded-sm border border-piedra/15 bg-niebla/40 p-4">
                <label className="mb-2 block font-dato text-xs font-bold uppercase tracking-widest text-montana">
                  Ubicación GPS (Coordenadas en el Mapa) <span className="text-cosecha">*</span>
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                      Latitud (Norte)
                    </label>
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
                    <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                      Longitud (Oeste)
                    </label>
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
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Descripción Breve
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Comunidad rural en la zona montañosa de Coclé norte..."
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Comunidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
