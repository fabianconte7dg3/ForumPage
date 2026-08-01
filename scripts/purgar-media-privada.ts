import fs from 'node:fs'
import path from 'node:path'

import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import config from '../src/payload.config'

// Cierra la segunda mitad de la migración a `documentos-privados`.
//
// La migración SQL (20260801_190433) copia las filas de `media` a
// `documentos_privados` preservando el id, que es lo que mantiene válidas las
// FK. Pero copiar no es mover: la fila original sigue en `media`, que es
// `read: () => true`, así que cada documento privado sigue siendo descargable
// por cualquiera en su URL vieja. Este script borra ese original.
//
// Corre DESPUÉS de `payload migrate`. Sin argumentos hace un simulacro; con
// `--purge` borra de verdad.
//
//   pnpm tsx --env-file=.env scripts/purgar-media-privada.ts
//   pnpm tsx --env-file=.env scripts/purgar-media-privada.ts --purge

type Fila = Record<string, unknown>

async function main() {
  const purgar = process.argv.includes('--purge')
  const payload = await getPayload({ config })
  const drizzle = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }).drizzle

  const filas = async (q: unknown): Promise<Fila[]> => {
    const r = (await drizzle.execute(q)) as { rows?: Fila[] } | Fila[]
    return Array.isArray(r) ? r : (r.rows ?? [])
  }

  // Idempotente: si la migración corrió antes del arreglo de url, las filas
  // copiadas apuntan a la ruta pública de media. Corregirlas acá evita tener
  // que rehacer la migración.
  await filas(sql`
    UPDATE "documentos_privados" SET url = REPLACE(url, '/media/', '/documentos-privados/')
    WHERE url LIKE '%/media/%'
  `)

  // El vínculo entre la copia y el original es el filename, no el id: el id de
  // un documento privado creado DESPUÉS de la migración puede coincidir por
  // casualidad con el de una foto pública, porque las dos secuencias avanzan
  // por separado.
  const candidatos = await filas(sql`
    SELECT m.id, m.filename
    FROM "media" m
    JOIN "documentos_privados" dp ON dp.filename = m.filename
    WHERE m.filename IS NOT NULL
  `)

  if (candidatos.length === 0) {
    console.log('Nada que purgar: ninguna fila de media tiene copia en documentos_privados.')
    process.exit(0)
  }

  const ids = candidatos.map((c) => Number(c.id))
  const listaIds = sql.raw(ids.join(','))

  // Qué columnas siguen apuntando a media(id), preguntándoselo al catálogo en
  // vez de hardcodear la lista — hay 13 hoy y van a ser más. Se excluyen las
  // tablas internas de Payload: una fila de bloqueo de edición no es una
  // referencia de contenido y no debe impedir el borrado.
  //
  // Y se excluye `media_locales`, que es el sidecar de localización de la
  // propia media: `alt` es required y localized, así que TODA fila de media
  // tiene fila ahí. Sin esta exclusión el script se declara a sí mismo que
  // todo sigue referenciado y no borra nunca nada. Ojo: se excluye esa tabla
  // puntual y no `%_locales` en general, porque el sidecar de OTRA colección
  // sí puede tener un upload localizado apuntando a media, y esa sí es una
  // referencia real que debe frenar el borrado.
  const columnas = await filas(sql`
    SELECT tc.table_name AS tabla, kcu.column_name AS columna
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND ccu.table_name = 'media'
      AND ccu.column_name = 'id'
      AND tc.table_name NOT LIKE 'payload_%'
      AND tc.table_name <> 'media_locales'
  `)

  const referenciados = new Set<number>()
  for (const { tabla, columna } of columnas as { tabla: string; columna: string }[]) {
    const usos = await filas(sql`
      SELECT DISTINCT ${sql.raw(`"${columna}"`)} AS id
      FROM ${sql.raw(`"${tabla}"`)}
      WHERE ${sql.raw(`"${columna}"`)} IN (${listaIds})
    `)
    for (const u of usos) {
      referenciados.add(Number(u.id))
      console.warn(`[!] media ${u.id} sigue referenciada por ${tabla}.${columna} — no se borra.`)
    }
  }

  const aBorrar = candidatos.filter((c) => !referenciados.has(Number(c.id)))
  console.log(
    `${candidatos.length} duplicados, ${referenciados.size} aún referenciados, ${aBorrar.length} a borrar.`,
  )

  let borrados = 0
  for (const fila of aBorrar) {
    const id = Number(fila.id)
    const filename = String(fila.filename)
    const origen = path.join(process.cwd(), 'media', filename)
    const destino = path.join(process.cwd(), 'documentos-privados', filename)

    // El archivo físico tiene que estar del lado privado antes de borrar el
    // público, o el documento queda sin archivo.
    if (!fs.existsSync(destino)) {
      if (!fs.existsSync(origen)) {
        console.warn(`[!] media ${id} (${filename}): no está ni en media/ ni en documentos-privados/ — se omite.`)
        continue
      }
      if (purgar) {
        fs.mkdirSync(path.dirname(destino), { recursive: true })
        fs.copyFileSync(origen, destino)
      }
      console.log(`  copiar  ${filename} → documentos-privados/`)
    }

    // payload.delete y no SQL: se lleva también las derivadas (thumbnail,
    // card, hero, og) que media genera, que son igual de públicas.
    if (purgar) await payload.delete({ collection: 'media', id, overrideAccess: true })
    console.log(`  borrar  media ${id} (${filename})`)
    borrados++
  }

  console.log(purgar ? `Listo: ${borrados} borrados de media.` : `Simulacro: ${borrados} se borrarían. Repetí con --purge.`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
