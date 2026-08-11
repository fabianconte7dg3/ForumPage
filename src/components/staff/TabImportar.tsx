'use client'

import { useRef, useState } from 'react'
import { generarPlantillaImportacion } from '@/actions/generar-plantilla-importacion'
import { importarDatos, type ImportarDatosResultado } from '@/actions/importar-datos'
import { CONFIGS_IMPORTACION } from '@/lib/importadores'
import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    titulo: 'Importar historial desde Excel',
    intro:
      'Para cargar de a poco lo que la Fundación ya tiene en Excel o en papel. Elegí qué querés importar, descargá la plantilla, completala con tus datos reales (con la fecha en que ocurrió cada cosa) y subila.',
    coleccion: 'Qué vas a importar',
    descargarPlantilla: 'Descargar plantilla (.xlsx)',
    descargando: 'Generando...',
    subir: 'Subí el Excel completado',
    importar: 'Importar',
    importando: 'Importando...',
    resumen: (creados: number, total: number) => `${creados} de ${total} filas se importaron correctamente.`,
    errores: 'Filas con problemas (no se importaron)',
    fila: 'Fila',
    sinArchivo: 'Elegí primero el archivo .xlsx completado.',
  },
  en: {
    titulo: 'Import history from Excel',
    intro:
      'To gradually load what the Foundation already has in Excel or on paper. Pick what to import, download the template, fill it in with your real data (with the date each thing actually happened), and upload it.',
    coleccion: 'What are you importing',
    descargarPlantilla: 'Download template (.xlsx)',
    descargando: 'Generating...',
    subir: 'Upload the completed Excel',
    importar: 'Import',
    importando: 'Importing...',
    resumen: (creados: number, total: number) => `${creados} of ${total} rows were imported successfully.`,
    errores: 'Rows with problems (not imported)',
    fila: 'Row',
    sinArchivo: 'Pick the completed .xlsx file first.',
  },
} satisfies Record<Locale, Record<string, string | ((a: number, b: number) => string)>>

export function TabImportar({ locale }: { locale: Locale }) {
  const t = TEXTOS[locale]
  const [coleccion, setColeccion] = useState(CONFIGS_IMPORTACION[0].coleccion)
  const [descargando, setDescargando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ImportarDatosResultado | null>(null)
  const inputArchivoRef = useRef<HTMLInputElement>(null)

  const handleDescargar = async () => {
    setDescargando(true)
    setErrorMsg(null)
    const res = await generarPlantillaImportacion(coleccion)
    setDescargando(false)
    if ('error' in res) {
      setErrorMsg(res.error)
      return
    }
    const bytes = Uint8Array.from(atob(res.archivoBase64), (c) => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = res.nombreArchivo
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportar = async () => {
    const archivo = inputArchivoRef.current?.files?.[0]
    if (!archivo) {
      setErrorMsg(t.sinArchivo as string)
      return
    }
    setErrorMsg(null)
    setResultado(null)
    setImportando(true)
    const formData = new FormData()
    formData.set('file', archivo)
    const res = await importarDatos({ coleccion, archivo: formData, locale })
    setImportando(false)
    if ('error' in res) {
      setErrorMsg(res.error)
      return
    }
    setResultado(res)
    if (inputArchivoRef.current) inputArchivoRef.current.value = ''
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold uppercase text-montana">{t.titulo as string}</h2>
        <p className="mt-1 font-lectura text-sm text-tinta/70">{t.intro as string}</p>
      </div>

      <div>
        <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-piedra">{t.coleccion as string}</label>
        <select
          value={coleccion}
          onChange={(e) => {
            setColeccion(e.target.value)
            setResultado(null)
            setErrorMsg(null)
          }}
          className="w-full rounded-lg border border-piedra/30 bg-niebla px-3 py-2 font-lectura text-sm text-tinta"
        >
          {CONFIGS_IMPORTACION.map((c) => (
            <option key={c.coleccion} value={c.coleccion}>
              {c.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleDescargar}
        disabled={descargando}
        className="rounded-full border border-montana px-5 py-2 font-dato text-sm uppercase tracking-wider text-montana transition-colors hover:bg-montana hover:text-niebla disabled:opacity-50"
      >
        {descargando ? (t.descargando as string) : (t.descargarPlantilla as string)}
      </button>

      <div className="rounded-2xl bg-piedra/10 p-6">
        <label className="mb-2 block font-dato text-xs uppercase tracking-widest text-piedra">{t.subir as string}</label>
        <input
          ref={inputArchivoRef}
          type="file"
          accept=".xlsx"
          className="mb-4 block w-full font-lectura text-sm text-tinta"
        />
        <button
          onClick={handleImportar}
          disabled={importando}
          className="rounded-full bg-cosecha px-6 py-2 font-dato text-sm uppercase tracking-wider text-niebla transition-colors hover:bg-montana disabled:opacity-50"
        >
          {importando ? (t.importando as string) : (t.importar as string)}
        </button>
      </div>

      {errorMsg && <p className="font-lectura text-sm text-red-600">{errorMsg}</p>}

      {resultado && 'success' in resultado && (
        <div className="rounded-2xl border border-piedra/25 p-6">
          <p className="font-lectura text-sm font-bold text-tinta">{(t.resumen as (a: number, b: number) => string)(resultado.creados, resultado.total)}</p>
          {resultado.errores.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 font-dato text-xs uppercase tracking-widest text-piedra">{t.errores as string}</p>
              <ul className="space-y-2">
                {resultado.errores.map((e) => (
                  <li key={e.fila} className="font-lectura text-xs text-tinta/80">
                    <span className="font-bold">
                      {t.fila as string} {e.fila}:
                    </span>{' '}
                    {e.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
