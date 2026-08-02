'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearEquipo } from '@/actions/crear-equipo'
import { editarEquipo } from '@/actions/editar-equipo'
import type { Equipo } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  miembro?: Equipo
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioEquipoModal({
  locale,
  miembro,
  triggerText,
  variant = 'primary',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!miembro

  const [nombre, setNombre] = useState(miembro?.nombre ?? '')
  const [cargo, setCargo] = useState(miembro?.cargo ?? '')
  const [bio, setBio] = useState(miembro?.bio ?? '')
  const [destacado, setDestacado] = useState(miembro?.destacado ?? false)
  const [orden, setOrden] = useState<number>(miembro?.orden ?? 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    setCargando(true)

    let res: { success?: boolean; error?: string }
    if (esEdicion) {
      res = await editarEquipo({
        id: miembro.id,
        nombre,
        cargo,
        bio,
        destacado,
        orden,
        locale,
      })
    } else {
      res = await crearEquipo({
        nombre,
        cargo,
        bio,
        destacado,
        orden,
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
        setCargo('')
        setBio('')
        setDestacado(false)
        setOrden(0)
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Miembro' : '+ Agregar Miembro'

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
          <div className="my-8 w-full max-w-lg rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Equipo Institucional</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Miembro del Equipo' : 'Agregar Nuevo Miembro'}
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
                  Nombre Completo <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. John Y. Keffer"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Cargo / Rol <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej. Fundador & Presidente"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Biografía Breve
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ej. Ingeniero y filántropo que fundó Forum Foundation en 2003..."
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Orden de Aparición
                  </label>
                  <input
                    type="number"
                    value={orden}
                    onChange={(e) => setOrden(Number(e.target.value))}
                    placeholder="Ej. 1"
                    className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={destacado}
                      onChange={(e) => setDestacado(e.target.checked)}
                      className="h-4 w-4 accent-cosecha"
                    />
                    <span className="font-dato text-xs font-bold uppercase tracking-wider text-montana">
                      Tarjeta Destacada (Fundador)
                    </span>
                  </label>
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Agregar Miembro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
