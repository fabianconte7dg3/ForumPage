'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editarNosotrosGlobal } from '@/actions/editar-nosotros-global'
import type { Locale } from '@/i18n'

export type SeccionInicial = {
  titulo: string
  texto: string
  imagenId?: number
  imagenUrl?: string
}

type Props = {
  locale: Locale
  misionInicial?: string
  historiaInicial?: string
  seccionesIniciales?: SeccionInicial[]
}

type SeccionEstado = {
  titulo: string
  texto: string
  imagenId?: number
  imagenUrlActual?: string
  imagenFile: File | null
}

const seccionVacia = (): SeccionEstado => ({ titulo: '', texto: '', imagenFile: null })

export function FormularioNosotrosModal({
  locale,
  misionInicial = '',
  historiaInicial = '',
  seccionesIniciales = [],
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [mision, setMision] = useState(misionInicial)
  const [historia, setHistoria] = useState(historiaInicial)
  const [secciones, setSecciones] = useState<SeccionEstado[]>(
    seccionesIniciales.length > 0
      ? seccionesIniciales.map((s) => ({
          titulo: s.titulo,
          texto: s.texto,
          imagenId: s.imagenId,
          imagenUrlActual: s.imagenUrl,
          imagenFile: null,
        }))
      : [seccionVacia()]
  )

  const agregarSeccion = () => setSecciones((prev) => [...prev, seccionVacia()])
  const quitarSeccion = (i: number) => setSecciones((prev) => prev.filter((_, idx) => idx !== i))
  const actualizarSeccion = (i: number, patch: Partial<SeccionEstado>) =>
    setSecciones((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const res = await editarNosotrosGlobal({
      misionText: mision,
      historiaText: historia,
      secciones: secciones.map((s) => {
        let imagenFile: FormData | undefined
        if (s.imagenFile) {
          imagenFile = new FormData()
          imagenFile.append('file', s.imagenFile)
        }
        return { titulo: s.titulo, texto: s.texto, imagenId: s.imagenId, imagenFile }
      }),
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/60 p-4 backdrop-blur-xs">
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

              <div className="space-y-4 border-t border-piedra/25 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block font-dato text-xs uppercase tracking-widest text-tinta">
                    Resumen de lo que hacemos, por sección (página Programas)
                  </label>
                  <button
                    type="button"
                    onClick={agregarSeccion}
                    className="font-dato text-xs font-bold uppercase tracking-widest text-montana hover:underline"
                  >
                    + Agregar Sección
                  </button>
                </div>

                {secciones.map((s, i) => (
                  <div key={i} className="rounded-sm border border-piedra/25 bg-niebla/30 p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className="font-dato text-xs font-bold uppercase tracking-widest text-montana">
                        Sección {i + 1}
                      </span>
                      {secciones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => quitarSeccion(i)}
                          className="font-dato text-xs text-cosecha hover:underline"
                        >
                          Quitar sección
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={s.titulo}
                      onChange={(e) => actualizarSeccion(i, { titulo: e.target.value })}
                      placeholder="Título de la sección, ej. Becas John Y. Keffer"
                      className="mb-3 w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                    />
                    <textarea
                      rows={4}
                      required
                      value={s.texto}
                      onChange={(e) => actualizarSeccion(i, { texto: e.target.value })}
                      placeholder="Texto de la sección"
                      className="mb-3 w-full rounded-sm border border-piedra/25 bg-white p-3 font-lectura text-sm outline-none focus:border-montana"
                    />

                    {s.imagenUrlActual && !s.imagenFile && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="mb-2 h-24 w-40 rounded-sm object-cover" src={s.imagenUrlActual} />
                    )}
                    <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">
                      {s.imagenUrlActual ? 'Reemplazar foto' : 'Foto de la sección'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => actualizarSeccion(i, { imagenFile: e.target.files?.[0] ?? null })}
                      className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-1.5 font-lectura text-sm outline-none focus:border-montana"
                    />
                  </div>
                ))}
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
