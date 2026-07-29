// Carga los datos ficticios de docs/fase-0/plantillas/ vía la API local de
// Payload. Idempotente: si el registro ya existe (por `nombre`), lo salta.
// Uso: pnpm seed (carga .env vía --env-file, antes de que los imports ESM
// evalúen payload.config.ts — por eso no se usa process.loadEnvFile() aquí).
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const plantillasDir = path.resolve(dirname, '../docs/fase-0/plantillas')

function splitLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (const c of line) {
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  const headers = splitLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = splitLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

function readCsv(filename: string): Record<string, string>[] {
  return parseCsv(fs.readFileSync(path.join(plantillasDir, filename), 'utf8'))
}

const si = (v: string) => v.trim().toLowerCase() === 'si'
const num = (v: string) => (v ? Number(v) : undefined)

async function crearSiNoExiste(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'programas' | 'comunidades' | 'sedes' | 'centros-educativos',
  nombre: string,
  data: Record<string, unknown>,
) {
  const existente = await payload.find({ collection, where: { nombre: { equals: nombre } }, limit: 1 })
  if (existente.docs.length > 0) {
    console.log(`  = ${collection}/${nombre} ya existe, se omite`)
    return existente.docs[0]
  }
  // El script arma `data` genéricamente desde CSV — any es correcto aquí, no
  // en el resto de la app, que sí usa los tipos generados de Payload.
  const creado = await payload.create({ collection, data } as any)
  console.log(`  + ${collection}/${nombre} creado`)
  return creado
}

async function main() {
  const payload = await getPayload({ config })

  console.log('Programas:')
  for (const row of readCsv('programas.csv')) {
    await crearSiNoExiste(payload, 'programas', row.nombre, {
      nombre: row.nombre,
      descripcion: row.descripcion_breve,
      color: row.color_hex_sugerido,
      icono: row.icono_sugerido,
      activo: si(row['activo(si/no)']),
    })
  }

  console.log('Comunidades:')
  const comunidadPorNombre = new Map<string, number>()
  for (const row of readCsv('comunidades.csv')) {
    const doc = await crearSiNoExiste(payload, 'comunidades', row.nombre, {
      nombre: row.nombre,
      distrito: row.distrito,
      corregimiento: row.corregimiento,
      coordenadas: { lat: num(row.latitud), lng: num(row.longitud) },
      descripcion: row.descripcion_breve,
    })
    comunidadPorNombre.set(row.nombre, doc.id as number)
  }

  console.log('Sedes:')
  for (const row of readCsv('sedes.csv')) {
    await crearSiNoExiste(payload, 'sedes', row.nombre, {
      nombre: row.nombre,
      tipo: row['tipo(sede_principal/biblioteca/centro)'],
      comunidad: comunidadPorNombre.get(row.comunidad),
      coordenadas: { lat: num(row.latitud), lng: num(row.longitud) },
      destacada: si(row['destacada(si/no)']),
      horario: row.horario,
    })
  }

  console.log('Centros educativos:')
  for (const row of readCsv('centros-educativos.csv')) {
    await crearSiNoExiste(payload, 'centros-educativos', row.nombre, {
      nombre: row.nombre,
      comunidad: comunidadPorNombre.get(row.comunidad),
      coordenadas: { lat: num(row.latitud), lng: num(row.longitud) },
      niveles_atendidos: row.niveles_atendidos,
      matricula_aproximada: num(row.matricula_aproximada),
      contacto: row.contacto,
    })
  }

  console.log('Listo.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
