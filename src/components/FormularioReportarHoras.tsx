'use client'

import { useRef, useState, type DragEvent, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import { reportarHoras } from '@/actions/reportar-horas'

const TEXTOS = {
  es: {
    encabezado: 'Registro de actividad',
    titulo: 'Reportar Labor Social',
    // Datos básicos
    tituloActividad: 'Título de la actividad',
    placeholderActividad: 'Ej. Limpieza de Playa en Santa Catalina',
    fecha: 'Fecha',
    horas: 'Número de horas',
    // Detalles
    detallesTitulo: 'Detalles',
    descripcion: 'Descripción detallada',
    placeholderDescripcion: 'Describí las tareas realizadas, el impacto en la comunidad y cualquier observación relevante.',
    // Evidencia
    evidenciaTitulo: 'Registro Documental',
    cargaEvidencia: 'Carga de evidencia',
    subirArchivo: 'Subir archivo',
    oArrastrar: ' o arrastrar y soltar',
    formatosPermitidos: 'PNG, JPG, PDF (Máx. 10MB)',
    archivoSeleccionado: 'Archivo seleccionado:',
    eliminarArchivo: 'Eliminar',
    // Panel lateral
    requisitosTitulo: 'Requisitos de Evidencia',
    requisitosIntro: 'Para asegurar la validez del registro, la evidencia documental debe cumplir con los siguientes estándares:',
    req1Titulo: 'Claridad Visual',
    req1Desc: 'Fotografías legibles donde se aprecie claramente al becario realizando la actividad.',
    req2Titulo: 'Verificación Oficial',
    req2Desc: 'Cartas de constancia deben incluir firma y sello de la organización o líder comunitario responsable.',
    req3Titulo: 'Metadatos',
    req3Desc: 'Asegurarse de que las fechas en los documentos coincidan exactamente con la fecha ingresada en el formulario.',
    // Botones
    cancelar: 'Cancelar',
    enviar: 'Enviar registro',
    enviando: 'Enviando…',
    // Resultado
    exito: 'Tu registro fue enviado y está pendiente de aprobación por el staff.',
  },
  en: {
    encabezado: 'Activity Log',
    titulo: 'Report Community Service',
    tituloActividad: 'Activity title',
    placeholderActividad: 'E.g. Beach cleanup in Santa Catalina',
    fecha: 'Date',
    horas: 'Number of hours',
    detallesTitulo: 'Details',
    descripcion: 'Detailed description',
    placeholderDescripcion: 'Describe the tasks performed, the community impact, and any relevant observations.',
    evidenciaTitulo: 'Documentary Record',
    cargaEvidencia: 'Evidence upload',
    subirArchivo: 'Upload file',
    oArrastrar: ' or drag and drop',
    formatosPermitidos: 'PNG, JPG, PDF (Max. 10MB)',
    archivoSeleccionado: 'Selected file:',
    eliminarArchivo: 'Remove',
    requisitosTitulo: 'Evidence Requirements',
    requisitosIntro: 'To ensure record validity, documentary evidence must meet the following standards:',
    req1Titulo: 'Visual Clarity',
    req1Desc: 'Readable photographs clearly showing the becario performing the activity.',
    req2Titulo: 'Official Verification',
    req2Desc: 'Certificates must include signature and seal from the organization or community leader.',
    req3Titulo: 'Metadata',
    req3Desc: 'Ensure document dates match exactly the date entered in this form.',
    cancelar: 'Cancel',
    enviar: 'Submit log',
    enviando: 'Submitting…',
    exito: 'Your log was submitted and is pending staff approval.',
  },
} as const

type Locale = 'es' | 'en'

export function FormularioReportarHoras({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [archivo, setArchivo] = useState<File | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  function handleArchivo(file: File | null) {
    if (!file) return
    const MAX = 10 * 1024 * 1024
    if (file.size > MAX) {
      setError(locale === 'es' ? 'El archivo no puede superar los 10 MB.' : 'File cannot exceed 10 MB.')
      return
    }
    const permitidos = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
    if (!permitidos.includes(file.type)) {
      setError(locale === 'es' ? 'Solo se aceptan PNG, JPG, WebP o PDF.' : 'Only PNG, JPG, WebP or PDF accepted.')
      return
    }
    setError(null)
    setArchivo(file)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setArrastrando(false)
    const file = e.dataTransfer.files[0]
    if (file) handleArchivo(file)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleArchivo(file)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setEnviando(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Reemplazar el archivo del input con el del state (en caso de drag-drop)
    formData.delete('evidencia')
    if (archivo) {
      formData.append('evidencia', archivo)
    }

    try {
      const resultado = await reportarHoras(formData)

      if (!resultado.ok) {
        setError(resultado.error)
        setEnviando(false)
        return
      }

      setExito(true)
      // Refrescar la data del server component
      router.refresh()
    } catch {
      // Sin este catch, una excepción del server action (ej. un error de
      // disco al subir la evidencia) dejaba el botón trabado en "Enviando…"
      // para siempre, sin forma de reintentar. Bug real reportado en prod.
      setError(locale === 'es' ? 'No se pudo enviar el registro. Intentá de nuevo.' : 'Could not submit the log. Please try again.')
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-tinta/40 px-4 pt-12 md:pt-24">
        <div className="w-full max-w-lg rounded-sm border border-piedra/25 bg-white p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-montana/40 bg-montana/10">
            <svg className="h-6 w-6 text-montana" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-lectura text-sm text-tinta">{t.exito}</p>
          <button
            className="mt-6 rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white transition-colors hover:bg-montana/90"
            onClick={onClose}
            type="button"
          >
            {locale === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-tinta/40 px-4 pt-6 pb-6 md:pt-12">
      <div className="mx-auto w-full max-w-4xl rounded-sm border border-piedra/25 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-piedra/25 px-6 py-4">
          <div>
            <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.encabezado}</p>
            <h2 className="font-display text-xl font-bold text-tinta md:text-2xl">{t.titulo}</h2>
          </div>
          <button
            aria-label={t.cancelar}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-piedra/25 text-piedra transition-colors hover:bg-niebla"
            onClick={onClose}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form className="md:flex" onSubmit={onSubmit}>
          {/* Columna principal */}
          <div className="flex-1 space-y-6 p-6">
            {/* Datos Básicos */}
            <fieldset>
              <legend className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{locale === 'es' ? 'Datos Básicos' : 'Basic Info'}</legend>
              <div className="mt-2 border-t border-piedra/25 pt-4">
                <label className="block">
                  <span className="font-dato text-xs uppercase tracking-widest text-piedra">{t.tituloActividad}</span>
                  <input
                    className="mt-1 block w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta outline-none transition-colors focus:border-montana"
                    maxLength={200}
                    name="actividad"
                    placeholder={t.placeholderActividad}
                    required
                    type="text"
                  />
                </label>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="font-dato text-xs uppercase tracking-widest text-piedra">{t.fecha}</span>
                    <input
                      className="mt-1 block w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-dato text-sm text-tinta outline-none transition-colors focus:border-montana"
                      max={new Date().toISOString().split('T')[0]}
                      name="fecha"
                      required
                      type="date"
                    />
                  </label>
                  <label className="block">
                    <span className="font-dato text-xs uppercase tracking-widest text-piedra">{t.horas}</span>
                    <input
                      className="mt-1 block w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-dato text-sm text-tinta outline-none transition-colors focus:border-montana"
                      max={200}
                      min={0.5}
                      name="horas"
                      placeholder="0.0"
                      required
                      step={0.5}
                      type="number"
                    />
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Detalles */}
            <fieldset>
              <legend className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.detallesTitulo}</legend>
              <div className="mt-2 border-t border-piedra/25 pt-4">
                <label className="block">
                  <span className="font-dato text-xs uppercase tracking-widest text-piedra">{t.descripcion}</span>
                  <textarea
                    className="mt-1 block w-full resize-y rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta outline-none transition-colors focus:border-montana"
                    maxLength={2000}
                    name="descripcion_detallada"
                    placeholder={t.placeholderDescripcion}
                    rows={4}
                  />
                </label>
              </div>
            </fieldset>

            {/* Carga de Evidencia */}
            <fieldset>
              <legend className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.evidenciaTitulo}</legend>
              <div className="mt-2 border-t border-piedra/25 pt-4">
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.cargaEvidencia}</p>
                {archivo ? (
                  <div className="mt-2 flex items-center justify-between rounded-sm border border-montana/40 bg-montana/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-montana" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-lectura text-sm text-tinta">{archivo.name}</span>
                      <span className="font-dato text-xs text-piedra">({(archivo.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button
                      className="font-dato text-xs uppercase tracking-widest text-cosecha transition-colors hover:text-cosecha/80"
                      onClick={() => { setArchivo(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      type="button"
                    >
                      {t.eliminarArchivo}
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mt-2 flex cursor-pointer flex-col items-center rounded-sm border-2 border-dashed px-6 py-8 text-center transition-colors ${
                      arrastrando ? 'border-montana bg-montana/5' : 'border-piedra/25 bg-niebla hover:border-piedra/50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragLeave={() => setArrastrando(false)}
                    onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
                    onDrop={onDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                  >
                    <svg className="mb-2 h-8 w-8 text-piedra" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="font-lectura text-sm text-tinta">
                      <span className="font-display font-bold text-montana">{t.subirArchivo}</span>
                      {t.oArrastrar}
                    </p>
                    <p className="mt-1 font-dato text-xs text-piedra">{t.formatosPermitidos}</p>
                  </div>
                )}
                <input
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  name="evidencia"
                  onChange={onFileChange}
                  ref={fileInputRef}
                  type="file"
                />
              </div>
            </fieldset>

            {/* Error */}
            {error && (
              <div className="rounded-sm border border-cosecha bg-cosecha/10 px-4 py-3">
                <p className="font-lectura text-sm text-cosecha">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center gap-3 border-t border-piedra/25 pt-4">
              <button
                className="rounded-sm border border-piedra/25 bg-white px-6 py-2 font-dato text-xs uppercase tracking-widest text-tinta transition-colors hover:bg-niebla"
                disabled={enviando}
                onClick={onClose}
                type="button"
              >
                {t.cancelar}
              </button>
              <button
                className="rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
                disabled={enviando}
                type="submit"
              >
                {enviando ? t.enviando : t.enviar}
              </button>
            </div>
          </div>

          {/* Columna lateral — Requisitos de Evidencia */}
          <aside className="w-full border-t border-piedra/25 bg-niebla p-6 md:w-72 md:border-l md:border-t-0 lg:w-80">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-montana" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.requisitosTitulo}</h3>
            </div>
            <p className="mt-3 font-lectura text-xs leading-relaxed text-tinta/80">{t.requisitosIntro}</p>
            <ol className="mt-4 space-y-4">
              <li>
                <p className="font-dato text-xs text-piedra">01.</p>
                <p className="font-display text-xs font-bold text-tinta">{t.req1Titulo}</p>
                <p className="mt-1 font-lectura text-xs leading-relaxed text-tinta/70">{t.req1Desc}</p>
              </li>
              <li>
                <p className="font-dato text-xs text-piedra">02.</p>
                <p className="font-display text-xs font-bold text-tinta">{t.req2Titulo}</p>
                <p className="mt-1 font-lectura text-xs leading-relaxed text-tinta/70">{t.req2Desc}</p>
              </li>
              <li>
                <p className="font-dato text-xs text-piedra">03.</p>
                <p className="font-display text-xs font-bold text-tinta">{t.req3Titulo}</p>
                <p className="mt-1 font-lectura text-xs leading-relaxed text-tinta/70">{t.req3Desc}</p>
              </li>
            </ol>
          </aside>
        </form>
      </div>
    </div>
  )
}
