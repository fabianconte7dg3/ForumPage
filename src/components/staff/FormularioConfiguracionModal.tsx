'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editarConfiguracionGlobal } from '@/actions/editar-configuracion-global'
import type { Configuracion } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  configuracion: Configuracion | null
  locale: Locale
}

export function FormularioConfiguracionModal({ configuracion, locale }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [metaHoras, setMetaHoras] = useState<number>(configuracion?.meta_horas_labor_social ?? 40)
  const [calificaciones, setCalificaciones] = useState<string[]>(
    configuracion?.calificaciones_reprobatorias?.map((c) => c.calificacion) ?? []
  )
  const [textoAviso, setTextoAviso] = useState(configuracion?.texto_aviso_suspension ?? '')
  const [email, setEmail] = useState(configuracion?.contacto_institucional?.email ?? '')
  const [telefono, setTelefono] = useState(configuracion?.contacto_institucional?.telefono ?? '')
  const [direccion, setDireccion] = useState(configuracion?.contacto_institucional?.direccion ?? '')
  const [fechaImpacto, setFechaImpacto] = useState(
    configuracion?.fecha_actualizacion_impacto ? configuracion.fecha_actualizacion_impacto.slice(0, 10) : ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const res = await editarConfiguracionGlobal({
      meta_horas_labor_social: metaHoras,
      calificaciones_reprobatorias: calificaciones,
      texto_aviso_suspension: textoAviso,
      contacto_email: email,
      contacto_telefono: telefono,
      contacto_direccion: direccion,
      fecha_actualizacion_impacto: fechaImpacto || undefined,
      locale,
    })

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      router.refresh()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-sm border border-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white"
      >
        ✏ Editar Configuración
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/60 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-xl rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Configuración General</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">Editar Configuración</h2>
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
                  Meta de horas de labor social <span className="text-cosecha">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={metaHoras}
                  onChange={(e) => setMetaHoras(Number(e.target.value))}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-2 block font-dato text-xs uppercase tracking-widest text-tinta">Calificaciones reprobatorias</label>
                <div className="space-y-2">
                  {calificaciones.map((c, i) => (
                    <div className="flex gap-2" key={i}>
                      <input
                        type="text"
                        value={c}
                        onChange={(e) =>
                          setCalificaciones((prev) => prev.map((valor, idx) => (idx === i ? e.target.value : valor)))
                        }
                        placeholder="Ej. F, D, 0-59"
                        className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                      />
                      <button
                        type="button"
                        onClick={() => setCalificaciones((prev) => prev.filter((_, idx) => idx !== i))}
                        className="rounded-sm border border-piedra/25 px-3 font-dato text-xs text-piedra hover:bg-niebla"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCalificaciones((prev) => [...prev, ''])}
                  className="mt-2 font-dato text-xs font-bold uppercase tracking-widest text-montana hover:underline"
                >
                  + Agregar calificación
                </button>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Aviso de suspensión</label>
                <textarea
                  rows={3}
                  value={textoAviso}
                  onChange={(e) => setTextoAviso(e.target.value)}
                  placeholder="Texto que ve un becario suspendido, explicando cómo reactivar la beca."
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="rounded-sm border border-piedra/15 bg-niebla/40 p-4">
                <label className="mb-2 block font-dato text-xs font-bold uppercase tracking-widest text-montana">Contacto institucional</label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Teléfono"
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Dirección"
                    className="sm:col-span-2 w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Fecha de actualización de cifras de impacto
                </label>
                <input
                  type="date"
                  value={fechaImpacto}
                  onChange={(e) => setFechaImpacto(e.target.value)}
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
                  {cargando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
