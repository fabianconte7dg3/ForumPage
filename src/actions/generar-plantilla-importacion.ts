'use server'

import ExcelJS from 'exceljs'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import { configDe } from '@/lib/importadores'

export type GenerarPlantillaResultado = { error: string } | { archivoBase64: string; nombreArchivo: string }

export async function generarPlantillaImportacion(coleccion: string): Promise<GenerarPlantillaResultado> {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado.' }
  }

  const cfg = configDe(coleccion)
  if (!cfg) {
    return { error: 'Colección desconocida.' }
  }

  const payload = await getPayload({ config })
  const libro = new ExcelJS.Workbook()

  const hojaDatos = libro.addWorksheet('Datos')
  hojaDatos.columns = cfg.columnas.map((col) => ({ header: col.etiqueta, key: col.clave, width: 24 }))
  hojaDatos.getRow(1).font = { bold: true }

  const hojaInstrucciones = libro.addWorksheet('Instrucciones')
  hojaInstrucciones.columns = [
    { header: 'Columna', key: 'columna', width: 24 },
    { header: 'Obligatoria', key: 'obligatoria', width: 14 },
    { header: 'Qué escribir', key: 'que', width: 60 },
  ]
  hojaInstrucciones.getRow(1).font = { bold: true }

  for (const col of cfg.columnas) {
    let queEscribir = col.descripcion ?? ''
    if (col.tipo === 'select' && col.opciones) {
      queEscribir = `Una de estas opciones exactas: ${col.opciones.map((o) => o.etiqueta).join(' / ')}`
    } else if (col.tipo === 'relacion' && col.relacionA) {
      const existentes = await payload.find({
        collection: col.relacionA.coleccion as Parameters<typeof payload.find>[0]['collection'],
        limit: 500,
        depth: 0,
        overrideAccess: true,
      })
      const campoNombre = col.relacionA.campoNombre ?? 'nombre'
      const nombres = (existentes.docs as unknown as Record<string, unknown>[])
        .map((d) => d[campoNombre])
        .filter((n): n is string => typeof n === 'string')
        .sort((a, b) => a.localeCompare(b))
      queEscribir = `El nombre EXACTO de un registro ya existente en "${col.relacionA.coleccion}". Opciones disponibles hoy: ${nombres.join(', ') || '(ninguno cargado todavía — creá al menos uno desde /staff antes de importar)'}`
    } else if (col.tipo === 'fecha') {
      queEscribir = queEscribir || 'Formato DD/MM/AAAA'
    }
    hojaInstrucciones.addRow({ columna: col.etiqueta, obligatoria: col.requerido ? 'Sí' : 'No', que: queEscribir })
  }
  hojaInstrucciones.addRow({})
  hojaInstrucciones.addRow({
    columna: 'Nota general',
    obligatoria: '',
    que: 'Esta importación es para historial de cosas que YA ocurrieron — cada registro se carga como "realizada". No borres la fila de encabezados de la hoja "Datos". Dejá vacías las columnas que no apliquen a una fila.',
  })

  const buffer = await libro.xlsx.writeBuffer()
  return {
    archivoBase64: Buffer.from(buffer).toString('base64'),
    nombreArchivo: `plantilla-${cfg.coleccion}.xlsx`,
  }
}
