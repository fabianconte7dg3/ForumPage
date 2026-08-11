'use client'

import { useRef, useState, type DragEvent, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import { reportarRegistroAcademico } from '@/actions/reportar-registro-academico'

const TEXTOS = {
  es: {
    encabezado: 'Registro académico',
    titulo: 'Subir constancia académica',
    periodo: 'Período',
    placeholderPeriodo: 'Ej. 2026-1',
    universidad: 'Universidad',
    placeholderUniversidad: 'Ej. Universidad de Panamá',
    documentoTitulo: 'Constancia de matrícula o créditos',
    cargaDocumento: 'Carga de documento',
    subirArchivo: 'Subir archivo',
    oArrastrar: ' o arrastrar y soltar',
    formatosPermitidos: 'PNG, JPG, PDF (Máx. 10MB)',
    eliminarArchivo: 'Eliminar',
    cancelar: 'Cancelar',
    enviar: 'Enviar registro',
    enviando: 'Enviando…',
    exito: 'Tu registro fue enviado. El staff va a revisar el documento y completar tus materias e índice.',
  },
  en: {
    encabezado: 'Academic record',
    titulo: 'Upload academic proof',
    periodo: 'Term',
    placeholderPeriodo: 'E.g. 2026-1',
    universidad: 'University',
    placeholderUniversidad: 'E.g. University of Panama',
    documentoTitulo: 'Enrollment proof or credits report',
    cargaDocumento: 'Document upload',
    subirArchivo: 'Upload file',
    oArrastrar: ' or drag and drop',
    formatosPermitidos: 'PNG, JPG, PDF (Max. 10MB)',
    eliminarArchivo: 'Remove',
    cancelar: 'Cancel',
    enviar: 'Submit record',
    enviando: 'Submitting…',
    exito: 'Your record was submitted. Staff will review the document and fill in your courses and GPA.',
  },
} as const

type Locale = 'es' | 'en'

export function FormularioReportarAcademico({ locale, onClose }: { locale: Locale; onClose: () => void }) {
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
    if (!archivo) {
      setError(locale === 'es' ? 'Subí la constancia de matrícula o el reporte de créditos.' : 'Upload the enrollment proof or credits report.')
      return
    }
    setError(null)
    setEnviando(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('documento', archivo)

    try {
      const resultado = await reportarRegistroAcademico(formData)

      if (!resultado.ok) {
        setError(resultado.error)
        setEnviando(false)
        return
      }

      setExito(true)
      router.refresh()
    } catch {
      setError(locale === 'es' ? 'No se pudo enviar el registro. Intentá de nuevo.' : 'Could not submit the record. Please try again.')
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
      <div className="mx-auto w-full max-w-lg rounded-sm border border-piedra/25 bg-white">
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

        <form className="space-y-6 p-6" onSubmit={onSubmit}>
          <label className="block">
            <span className="font-dato text-xs uppercase tracking-widest text-piedra">{t.periodo}</span>
            <input
              className="mt-1 block w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta outline-none transition-colors focus:border-montana"
              maxLength={20}
              name="periodo"
              placeholder={t.placeholderPeriodo}
              required
              type="text"
            />
          </label>

          <label className="block">
            <span className="font-dato text-xs uppercase tracking-widest text-piedra">{t.universidad}</span>
            <input
              className="mt-1 block w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta outline-none transition-colors focus:border-montana"
              maxLength={200}
              name="universidad"
              placeholder={t.placeholderUniversidad}
              required
              type="text"
            />
          </label>

          <div>
            <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.documentoTitulo}</p>
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
              name="documento"
              onChange={onFileChange}
              ref={fileInputRef}
              type="file"
            />
          </div>

          {error && (
            <div className="rounded-sm border border-cosecha bg-cosecha/10 px-4 py-3">
              <p className="font-lectura text-sm text-cosecha">{error}</p>
            </div>
          )}

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
        </form>
      </div>
    </div>
  )
}
