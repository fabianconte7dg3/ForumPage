// Migra artículos desde WordPress según docs/fase-0/plantillas/inventario-articulos.csv
// (columna `accion` = "migrar"). Ver 03-runbook-tecnico.md §10.
//
// Uso: pnpm migrate:wordpress
//
// No decide qué migrar ni a qué comunidad/programa pertenece cada
// actividad — eso es curaduría del staff en el inventario (Fase 0).
// Las actividades migradas quedan asignadas a la comunidad "Sin
// clasificar" hasta que el staff las revise y reasigne una real.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { parseCsv } from './lib/csv'
import { extraerContenidoLexical, extraerImagenes } from './lib/elementor'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const inventarioPath = path.resolve(dirname, '../docs/fase-0/plantillas/inventario-articulos.csv')
const redirectsPath = path.resolve(dirname, '../docs/fase-0/redirects.csv')

const SITIO_ORIGEN = 'https://www.forum-foundation.org'
const COMUNIDAD_SIN_CLASIFICAR = 'Sin clasificar'

type PostWordPress = {
  slug: string
  date: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
}

async function obtenerPost(slug: string): Promise<PostWordPress | null> {
  const res = await fetch(`${SITIO_ORIGEN}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}`)
  if (!res.ok) return null
  const posts = (await res.json()) as PostWordPress[]
  return posts[0] ?? null
}

async function obtenerComunidadSinClasificar(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existente = await payload.find({
    collection: 'comunidades',
    where: { nombre: { equals: COMUNIDAD_SIN_CLASIFICAR } },
    limit: 1,
  })
  if (existente.docs.length > 0) return existente.docs[0].id as number
  const creada = await payload.create({
    collection: 'comunidades',
    data: {
      nombre: COMUNIDAD_SIN_CLASIFICAR,
      distrito: 'Por determinar',
      coordenadas: { lat: 0, lng: 0 },
      descripcion: 'Placeholder para actividades migradas pendientes de asignar a una comunidad real.',
    },
  })
  return creada.id as number
}

function limpiarTexto(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim()
}

async function subirImagen(payload: Awaited<ReturnType<typeof getPayload>>, url: string, altProvisional: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo descargar ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const nombre = decodeURIComponent(path.basename(new URL(url).pathname))
  const mimetype = res.headers.get('content-type') ?? 'image/jpeg'
  return payload.create({
    collection: 'media',
    data: { alt: altProvisional || nombre },
    file: { data: buffer, mimetype, name: nombre, size: buffer.length },
  })
}

async function main() {
  const payload = await getPayload({ config })
  const inventario = parseCsv(fs.readFileSync(inventarioPath, 'utf8'))
  const aMigrar = inventario.filter((row) => row['accion(migrar/archivar/reescribir)']?.trim().toLowerCase() === 'migrar')

  if (aMigrar.length === 0) {
    console.log('Ningún artículo marcado "migrar" en el inventario. Nada que hacer.')
    console.log(`(${inventario.length} filas en el inventario, en espera de curaduría del staff)`)
    process.exit(0)
  }

  const comunidadId = await obtenerComunidadSinClasificar(payload)
  const redirects: string[] = ['url_antigua,url_nueva']

  for (const row of aMigrar) {
    const slug = row.url.replace(/^\/+|\/+$/g, '')
    console.log(`Migrando ${slug}...`)
    const post = await obtenerPost(slug)
    if (!post) {
      console.warn(`  ! no encontrado en ${SITIO_ORIGEN}, se omite`)
      continue
    }

    const existente = await payload.find({ collection: 'actividades', where: { slug: { equals: slug } }, limit: 1 })
    if (existente.docs.length > 0) {
      console.log('  = ya migrado, se omite')
      redirects.push(`${row.url},/en/stories/${slug}`)
      continue
    }

    const imagenes = extraerImagenes(post.content.rendered)
    let portada: number | undefined
    if (imagenes[0]) {
      const media = await subirImagen(payload, imagenes[0].src, imagenes[0].alt || post.title.rendered)
      portada = media.id as number
    }

    await payload.create({
      collection: 'actividades',
      data: {
        titulo: post.title.rendered,
        slug,
        extracto: limpiarTexto(post.excerpt.rendered),
        contenido: extraerContenidoLexical(post.content.rendered),
        fecha_publicacion: post.date,
        portada,
        comunidad: comunidadId,
      },
      locale: 'en',
    })
    console.log('  + creada (locale en, comunidad: Sin clasificar — revisar y reasignar)')
    redirects.push(`${row.url},/en/stories/${slug}`)
  }

  fs.writeFileSync(redirectsPath, redirects.join('\n') + '\n')
  console.log(`\nredirects.csv escrito en ${redirectsPath}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
