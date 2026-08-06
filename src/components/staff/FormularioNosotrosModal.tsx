'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editarNosotrosGlobal } from '@/actions/editar-nosotros-global'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  misionInicial?: string
  historiaInicial?: string
  resumenInicial?: string
}

export function FormularioNosotrosModal({
  locale,
  misionInicial = '',
  historiaInicial = '',
  resumenInicial = '',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [mision, setMision] = useState(misionInicial)
  const [historia, setHistoria] = useState(historiaInicial)
  const [resumen, setResumen] = useState(resumenInicial)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const res = await editarNosotrosGlobal({
      misionText: mision,
      historiaText: historia,
      resumenText: resumen,
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
        ✏ Editar Misión e Historia
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Página Institucional (/nosotros)</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  Editar Misión e Historia
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
                  Misión Institucional
                </label>
                <textarea
                  rows={4}
                  required
                  value={mision}
                  onChange={(e) => setMision(e.target.value)}
                  placeholder="Escribe el texto de la Misión..."
                  className="w-full rounded-sm border border-piedra/25 p-3 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Historia & Orígenes
                </label>
                <textarea
                  rows={6}
                  required
                  value={historia}
                  onChange={(e) => setHistoria(e.target.value)}
                  placeholder="Escribe la historia de la fundación..."
                  className="w-full rounded-sm border border-piedra/25 p-3 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Resumen de lo que hacemos (página Programas)
                </label>
                <textarea
                  rows={8}
                  required
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder="Escribe un resumen de las líneas de trabajo de la fundación. Dejá una línea en blanco entre párrafos."
                  className="w-full rounded-sm border border-piedra/25 p-3 font-lectura text-sm outline-none focus:border-montana"
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
