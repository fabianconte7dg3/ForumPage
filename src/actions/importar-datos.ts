'use server'

import ExcelJS from 'exceljs'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import { configDe, parsearFechaCelda, normalizarNombre, type ConfigImportacion } from '@/lib/importadores'
import type { Locale } from '@/i18n'

export type ImportarDatosInput = {
  coleccion: string
  archivo: FormData
  locale: Locale
}

export type ImportarDatosResultado =
  | { error: string }
  | { success: true; total: number; creados: number; errores: { fila: number; mensaje: string }[] }

type MapaRelaciones = Map<string, Map<string, number>>

async function construirMapaRelaciones(
  payload: Awaited<ReturnType<typeof getPayload>>,
  cfg: ConfigImportacion,
): Promise<MapaRelaciones> {
  const mapa: MapaRelaciones = new Map()
  for (const col of cfg.columnas) {
    if (col.tipo !== 'relacion' || !col.relacionA || mapa.has(col.relacionA.coleccion)) continue
    const campoNombre = col.relacionA.campoNombre ?? 'nombre'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = await payload.find({ collection: col.relacionA.coleccion as any, limit: 1000, depth: 0, overrideAccess: true })
    const porNombre = new Map<string, number>()
    for (const doc of docs.docs as Record<string, unknown>[]) {
      const nombre = doc[campoNombre]
      if (typeof nombre === 'string' && typeof doc.id === 'number') {
        porNombre.set(normalizarNombre(nombre), doc.id)
      }
    }
    mapa.set(col.relacionA.coleccion, porNombre)
  }
  return mapa
}

export async function importarDatos(input: ImportarDatosInput): Promise<ImportarDatosResultado> {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado.' }
  }

  const cfg = configDe(input.coleccion)
  if (!cfg) {
    return { error: 'Colección desconocida.' }
  }

  const archivo = input.archivo.get('file') as File | null
  if (!archivo || archivo.size === 0) {
    return { error: 'No se recibió ningún archivo.' }
  }

  const libro = new ExcelJS.Workbook()
  try {
    // El tipo `Buffer` que exceljs declara en su propio .d.ts es un shim local
    // (`interface Buffer extends ArrayBuffer {}`), no el Buffer real de
    // Node — por eso el ArrayBuffer nativo encaja mejor con su firma que un
    // Buffer de Node de verdad, que no lo satisface estructuralmente.
    await libro.xlsx.load(await archivo.arrayBuffer())
  } catch {
    return { error: 'El archivo no es un Excel (.xlsx) válido.' }
  }

  const hoja = libro.getWorksheet('Datos') ?? libro.worksheets[0]
  if (!hoja) {
    return { error: 'El Excel no tiene ninguna hoja con datos.' }
  }

  const payload = await getPayload({ config })
  const mapaRelaciones = await construirMapaRelaciones(payload, cfg)

  const errores: { fila: number; mensaje: string }[] = []
  let creados = 0
  let total = 0

  for (let numeroFila = 2; numeroFila <= hoja.rowCount; numeroFila++) {
    const fila = hoja.getRow(numeroFila)
    const celdas = cfg.columnas.map((_, i) => fila.getCell(i + 1).value)
    const filaVacia = celdas.every((v) => v === null || v === undefined || v === '')
    if (filaVacia) continue

    total++
    const erroresFila: string[] = []
    const data: Record<string, unknown> = { ...cfg.valoresFijos }

    cfg.columnas.forEach((col, i) => {
      const valorCrudo = celdas[i]
      const vacio = valorCrudo === null || valorCrudo === undefined || valorCrudo === ''

      if (vacio) {
        if (col.requerido) erroresFila.push(`"${col.etiqueta}" es obligatoria y está vacía.`)
        return
      }

      if (col.tipo === 'texto') {
        data[col.clave] = String(valorCrudo).trim()
        return
      }

      if (col.tipo === 'numero') {
        const n = Number(valorCrudo)
        if (Number.isNaN(n)) {
          erroresFila.push(`"${col.etiqueta}" debe ser un número (llegó "${valorCrudo}").`)
        } else {
          data[col.clave] = n
        }
        return
      }

      if (col.tipo === 'fecha') {
        const fecha = parsearFechaCelda(valorCrudo)
        if (!fecha) {
          erroresFila.push(`"${col.etiqueta}" no es una fecha válida (usá DD/MM/AAAA, llegó "${valorCrudo}").`)
        } else {
          data[col.clave] = fecha.toISOString()
        }
        return
      }

      if (col.tipo === 'select') {
        const texto = normalizarNombre(String(valorCrudo))
        const opcion = col.opciones?.find(
          (o) => normalizarNombre(o.etiqueta) === texto || normalizarNombre(o.valor) === texto,
        )
        if (!opcion) {
          erroresFila.push(
            `"${col.etiqueta}" tiene un valor no reconocido ("${valorCrudo}"). Opciones válidas: ${col.opciones?.map((o) => o.etiqueta).join(' / ')}.`,
          )
        } else {
          data[col.clave] = opcion.valor
        }
        return
      }

      if (col.tipo === 'relacion' && col.relacionA) {
        const id = mapaRelaciones.get(col.relacionA.coleccion)?.get(normalizarNombre(String(valorCrudo)))
        if (!id) {
          erroresFila.push(
            `"${col.etiqueta}": no existe un registro llamado "${valorCrudo}" en ${col.relacionA.coleccion}. Revisá el nombre o creálo primero desde /staff.`,
          )
        } else {
          data[col.clave] = id
        }
      }
    })

    if (erroresFila.length > 0) {
      errores.push({ fila: numeroFila, mensaje: erroresFila.join(' ') })
      continue
    }

    try {
      await payload.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collection: cfg.coleccion as any,
        data,
        overrideAccess: false,
        user: usuario,
      })
      creados++
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido al guardar.'
      errores.push({ fila: numeroFila, mensaje })
    }
  }

  revalidatePath(`/${input.locale}/staff`)
  revalidatePath(`/${input.locale}/impacto`)

  return { success: true, total, creados, errores }
}
