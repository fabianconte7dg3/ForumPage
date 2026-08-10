'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearGira } from '@/actions/crear-gira'
import { editarGira } from '@/actions/editar-gira'
import type { GiraEducativa, CentroEducativo, Nivel } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  gira?: GiraEducativa
  escuelas: CentroEducativo[]
  niveles: Nivel[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

export function FormularioGiraModal({ locale, gira, escuelas, niveles, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!gira

  const [destino, setDestino] = useState(gira?.destino ?? '')
  const [escuelaId, setEscuelaId] = useState<number | ''>(
    typeof gira?.escuela === 'object' ? gira.escuela?.id ?? '' : gira?.escuela ?? ''
  )
  const [nivelId, setNivelId] = useState<number | ''>(
    typeof gira?.nivel === 'object' ? gira.nivel?.id ?? '' : gira?.nivel ?? ''
  )
  const [fecha, setFecha] = useState(gira?.fecha?.slice(0, 10) ?? '')
  const [realizada, setRealizada] = useState(gira?.realizada ?? false)
  const [participantes, setParticipantes] = useState<number | ''>(gira?.participantes ?? '')
  const [notas, setNotas] = useState(gira?.notas ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!destino.trim() || !escuelaId) {
      setErrorMsg('Completá destino y escuela.')
      return
    }

    setCargando(true)

    const base = {
      destino,
      escuela: Number(escuelaId),
      nivel: nivelId ? Number(nivelId) : undefined,
      fecha: fecha || undefined,
      realizada,
      participantes: realizada && participantes ? Number(participantes) : undefined,
      notas: notas || undefined,
      locale,
    }

    const res = esEdicion ? await editarGira({ ...base, id: gira.id }) : await crearGira(base)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setDestino('')
        setEscuelaId('')
        setNivelId('')
        setFecha('')
        setRealizada(false)
        setParticipantes('')
        setNotas('')
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Gira' : '+ Nueva Gira Educativa'

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
                  {esEdicion ? 'Editar Gira Educativa' : 'Nueva Gira Educativa'}
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
                  Destino <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ej. Biomuseo"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Escuela <span className="text-cosecha">*</span>
                  </label>
                  <select
                    required
                    value={escuelaId}
                    onChange={(e) => setEscuelaId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Seleccionar...</option>
                    {escuelas.map((esc) => (
                      <option key={esc.id} value={esc.id}>{esc.nombre}</option>
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
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana sm:w-56"
                />
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
                      placeholder="Ej. 30"
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar Gira'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
