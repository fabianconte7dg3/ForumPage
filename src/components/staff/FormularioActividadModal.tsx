'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearActividad } from '@/actions/crear-actividad'
import { editarActividad } from '@/actions/editar-actividad'
import { parrafosATexto } from '@/lib/richtext'
import type { Actividad, Media } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  actividad?: Actividad
  comunidades: { id: number; nombre: string }[]
  locale: Locale
  programas: { id: number; nombre: string }[]
  proyectos: { id: number; titulo: string }[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

const miniatura = (m: Media): string => m.thumbnailURL ?? m.sizes?.thumbnail?.url ?? m.url ?? ''

const hoyISO = () => new Date().toISOString().slice(0, 10)

// Debe quedar por debajo del `bodySizeLimit` de next.config.ts (20mb): portada
// + galería viajan juntas en una sola Server Action, con margen para el resto
// del formulario y el overhead de multipart.
const MAX_FOTOS_MB = 18

export function FormularioActividadModal({ actividad, comunidades, locale, programas, proyectos, triggerText, variant = 'primary' }: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!actividad

  const comunidadInicialId = actividad?.comunidad ? (typeof actividad.comunidad === 'object' ? actividad.comunidad.id : actividad.comunidad) : ''
  const programaInicialId = actividad?.programa ? (typeof actividad.programa === 'object' ? actividad.programa?.id : actividad.programa) : ''
  const proyectoInicialId = actividad?.proyecto ? (typeof actividad.proyecto === 'object' ? actividad.proyecto?.id : actividad.proyecto) : ''
  const portadaInicial = actividad?.portada && typeof actividad.portada === 'object' ? (actividad.portada as Media) : null
  const galeriaInicial = (actividad?.galeria ?? []).filter((g): g is Media => typeof g === 'object')

  const [titulo, setTitulo] = useState(actividad?.titulo ?? '')
  const [extracto, setExtracto] = useState(actividad?.extracto ?? '')
  const [contenido, setContenido] = useState(() => (actividad?.contenido ? parrafosATexto(actividad.contenido) : ''))
  const [fechaPublicacion, setFechaPublicacion] = useState(actividad?.fecha_publicacion ? actividad.fecha_publicacion.slice(0, 10) : hoyISO())
  const [comunidadId, setComunidadId] = useState<number | ''>(comunidadInicialId)
  const [programaId, setProgramaId] = useState<number | ''>(programaInicialId)
  const [proyectoId, setProyectoId] = useState<number | ''>(proyectoInicialId)
  const [destacada, setDestacada] = useState(actividad?.destacada ?? false)

  const [portadaFile, setPortadaFile] = useState<File | null>(null)
  const [portadaExistente, setPortadaExistente] = useState<Media | null>(portadaInicial)
  const [portadaFocal, setPortadaFocal] = useState({ x: portadaInicial?.focalX ?? 50, y: portadaInicial?.focalY ?? 50 })
  const [galeriaExistente, setGaleriaExistente] = useState<Media[]>(galeriaInicial)
  const [galeriaNuevos, setGaleriaNuevos] = useState<File[]>([])

  const resetear = () => {
    setTitulo('')
    setExtracto('')
    setContenido('')
    setFechaPublicacion(hoyISO())
    setComunidadId('')
    setProgramaId('')
    setProyectoId('')
    setPortadaFocal({ x: 50, y: 50 })
    setDestacada(false)
    setPortadaFile(null)
    setPortadaExistente(null)
    setGaleriaExistente([])
    setGaleriaNuevos([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (comunidadId === '') {
      setErrorMsg('La comunidad es obligatoria.')
      return
    }

    const pesoFotosMB = ([...(portadaFile ? [portadaFile] : []), ...galeriaNuevos].reduce((acc, f) => acc + f.size, 0)) / 1024 / 1024
    if (pesoFotosMB > MAX_FOTOS_MB) {
      setErrorMsg(
        `Las fotos pesan ${pesoFotosMB.toFixed(1)} MB en total — el máximo es ${MAX_FOTOS_MB} MB. Achicá alguna imagen o subí menos fotos a la vez.`
      )
      return
    }

    setCargando(true)

    let portadaFormData: FormData | undefined
    if (portadaFile) {
      portadaFormData = new FormData()
      portadaFormData.append('file', portadaFile)
    }

    let galeriaFormData: FormData | undefined
    if (galeriaNuevos.length > 0) {
      galeriaFormData = new FormData()
      galeriaNuevos.forEach((f) => galeriaFormData?.append('files', f))
    }

    const datosComunes = {
      titulo,
      extracto,
      contenido,
      fecha_publicacion: fechaPublicacion,
      comunidadId: Number(comunidadId),
      programaId: programaId ? Number(programaId) : undefined,
      proyectoId: proyectoId ? Number(proyectoId) : undefined,
      destacada,
      portadaFile: portadaFormData,
      portadaFocalX: Math.round(portadaFocal.x),
      portadaFocalY: Math.round(portadaFocal.y),
      galeriaFiles: galeriaFormData,
      locale,
    }

    const res = esEdicion
      ? await editarActividad({
          id: actividad.id,
          ...datosComunes,
          portadaExistenteId: portadaExistente?.id ?? null,
          galeriaExistenteIds: galeriaExistente.map((g) => g.id),
        })
      : await crearActividad(datosComunes)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) resetear()
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? 'Editar' : '+ Nueva Publicación'

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={
          variant === 'primary'
            ? 'rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90'
            : 'rounded-sm border border-montana px-3 py-1.5 font-dato text-xs font-bold uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white'
        }
      >
        {triggerText ?? defaultTrigger}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/60 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-2xl rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Mural / Historias (/historias)</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Publicación' : 'Nueva Publicación'}
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
                  Título <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Se inauguró la biblioteca comunitaria de Toabré"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    <option value="">Seleccioná</option>
                    {comunidades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Programa</label>
                  <select
                    value={programaId}
                    onChange={(e) => setProgramaId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Ninguno</option>
                    {programas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Proyecto</label>
                  <select
                    value={proyectoId}
                    onChange={(e) => setProyectoId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Ninguno</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Fecha de publicación</label>
                <input
                  type="date"
                  value={fechaPublicacion}
                  onChange={(e) => setFechaPublicacion(e.target.value)}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana sm:w-56"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Extracto</label>
                <textarea
                  rows={2}
                  value={extracto}
                  onChange={(e) => setExtracto(e.target.value)}
                  placeholder="Resumen corto para la tarjeta de vista previa"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Contenido <span className="text-cosecha">*</span>
                </label>
                <p className="mb-1 font-lectura text-xs text-piedra">Dejá una línea en blanco entre párrafos.</p>
                <textarea
                  rows={10}
                  required
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder={'Primer párrafo...\n\nSegundo párrafo...'}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Foto de portada</label>
                {(portadaFile || portadaExistente) && (
                  <div className="mb-2">
                    <p className="mb-1 font-lectura text-xs text-piedra">
                      Así se recorta en la tarjeta y en la portada del sitio — hacé clic sobre la foto para marcar qué parte no se debe cortar.
                    </p>
                    <div
                      className="relative aspect-4/3 w-40 cursor-crosshair overflow-hidden rounded-sm border border-piedra/25 bg-niebla"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setPortadaFocal({
                          x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
                          y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
                        })
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={portadaFile ? URL.createObjectURL(portadaFile) : miniatura(portadaExistente as Media)}
                        style={{ objectPosition: `${portadaFocal.x}% ${portadaFocal.y}%` }}
                      />
                      <div
                        className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-montana shadow"
                        style={{ left: `${portadaFocal.x}%`, top: `${portadaFocal.y}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPortadaFocal({ x: 50, y: 50 })}
                        className="font-dato text-xs uppercase tracking-widest text-piedra hover:underline"
                      >
                        Restablecer centro
                      </button>
                      {portadaFile ? (
                        <button
                          type="button"
                          onClick={() => setPortadaFile(null)}
                          className="font-dato text-xs uppercase tracking-widest text-cosecha hover:underline"
                        >
                          Cancelar reemplazo
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPortadaExistente(null)}
                          className="font-dato text-xs uppercase tracking-widest text-cosecha hover:underline"
                        >
                          Quitar portada
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setPortadaFile(e.target.files?.[0] ?? null)
                    setPortadaFocal({ x: 50, y: 50 })
                  }}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none file:mr-3 file:rounded-sm file:border-0 file:bg-niebla file:px-3 file:py-1 file:font-dato file:text-xs file:uppercase"
                />
              </div>

              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Galería</label>
                {(galeriaExistente.length > 0 || galeriaNuevos.length > 0) && (
                  <div className="mb-2 flex flex-wrap gap-3">
                    {galeriaExistente.map((g) => (
                      <div className="relative" key={g.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="h-16 w-16 rounded-sm border border-piedra/25 object-cover" src={miniatura(g)} />
                        <button
                          type="button"
                          onClick={() => setGaleriaExistente((prev) => prev.filter((x) => x.id !== g.id))}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-tinta text-xs text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {galeriaNuevos.map((f, i) => (
                      <div className="relative" key={`nuevo-${i}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="h-16 w-16 rounded-sm border border-montana object-cover" src={URL.createObjectURL(f)} />
                        <button
                          type="button"
                          onClick={() => setGaleriaNuevos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-tinta text-xs text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    // Leer los archivos antes de vaciar el input — `e.target` es el mismo nodo
                    // del DOM, y React ejecuta el actualizador funcional despues de que esta
                    // linea corre, no en el momento; para entonces `.files` ya estaria vacio.
                    const nuevos = Array.from(e.target.files ?? [])
                    setGaleriaNuevos((prev) => [...prev, ...nuevos])
                    e.target.value = ''
                  }}
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none file:mr-3 file:rounded-sm file:border-0 file:bg-niebla file:px-3 file:py-1 file:font-dato file:text-xs file:uppercase"
                />
              </div>

              <label className="flex items-center gap-2 font-dato text-xs uppercase tracking-widest text-tinta">
                <input checked={destacada} onChange={(e) => setDestacada(e.target.checked)} type="checkbox" />
                Destacar publicación
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
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
