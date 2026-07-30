// Migra TODAS las historias comunitarias (~70 carpetas) desde ForumOldPageInfo/historias/ a Payload CMS.
// Extrae la fecha real de publicación (- **Fecha:** ...), resumen, contenido en Lexical, imágenes
// e intenta asociar la comunidad por palabras clave en el texto.
//
// Uso: pnpm tsx --env-file=.env scripts/migrate-all-historias.ts

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const historiasBaseDir = path.resolve(dirname, '../ForumOldPageInfo/historias')

function parrafosLexical(lineas: string[]) {
  return {
    root: {
      type: 'root',
      children: lineas.map((texto) => ({
        type: 'paragraph',
        children: [{ type: 'text', text: texto, version: 1 }],
        direction: null,
        format: '' as const,
        indent: 0,
        version: 1,
      })),
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// WordPress reexporta la misma foto varias veces bajo nombres distintos
// (Foo.jpeg, Foo_2.jpeg, Foo_3.jpeg — bytes idénticos). Cachear por nombre de
// archivo no detecta eso; el hash del contenido sí, y de paso evita subir el
// mismo archivo dos veces aunque aparezca en carpetas de artículos distintos.
const mediaCache = new Map<string, number>() // hash md5 -> media id

async function subirImagenPorContenido(
  payload: Awaited<ReturnType<typeof getPayload>>,
  folderPath: string,
  filename: string,
  altText: string
): Promise<{ hash: string; id: number } | undefined> {
  const ruta = path.join(folderPath, filename)
  if (!fs.existsSync(ruta)) return undefined

  const buffer = fs.readFileSync(ruta)
  const hash = crypto.createHash('md5').update(buffer).digest('hex')

  const idCacheado = mediaCache.get(hash)
  if (idCacheado) return { hash, id: idCacheado }

  const ext = path.extname(filename).toLowerCase()
  const mimetype =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpeg' || ext === '.jpg'
      ? 'image/jpeg'
      : ext === '.webp'
      ? 'image/webp'
      : 'image/jpeg'

  try {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: { data: buffer, mimetype, name: filename, size: buffer.length },
      overrideAccess: true,
    })
    mediaCache.set(hash, doc.id as number)
    return { hash, id: doc.id as number }
  } catch (e) {
    console.warn(`No se pudo subir la imagen ${filename}:`, (e as Error).message)
    return undefined
  }
}

// Sin tildes ni mayúsculas, para comparar contra el texto del artículo.
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

async function main() {
  const payload = await getPayload({ config })

  // Obtener comunidades para hacer matching
  const comunidadesResult = await payload.find({ collection: 'comunidades', limit: 100, overrideAccess: true })
  const comunidades = comunidadesResult.docs
  if (comunidades.length === 0) {
    console.error('No hay comunidades en la base de datos. Corre pnpm seed primero.')
    process.exit(1)
  }
  const sinClasificar = comunidades.find((c) => c.nombre === 'Sin clasificar')
  const defaultComunidadId = sinClasificar ? sinClasificar.id : comunidades[0].id

  console.log(`Cargadas ${comunidades.length} comunidades para resolución de relaciones.`)

  const carpetas = fs
    .readdirSync(historiasBaseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  console.log(`Encontradas ${carpetas.length} historias en ${historiasBaseDir}. Iniciando migración...`)

  let procesadas = 0
  let creadas = 0
  let actualizadas = 0

  for (const carpeta of carpetas) {
    const folderPath = path.join(historiasBaseDir, carpeta)
    const mdPath = path.join(folderPath, 'articulo.md')

    if (!fs.existsSync(mdPath)) {
      continue
    }

    procesadas++
    const rawMarkdown = fs.readFileSync(mdPath, 'utf8')
    const lineas = rawMarkdown.split('\n')

    // 1. Extraer Título (Línea # ...)
    let titulo = carpeta
    const tituloMatch = rawMarkdown.match(/^#\s+(.+)$/m)
    if (tituloMatch) {
      titulo = tituloMatch[1].trim()
    }

    // 2. Extraer Fecha Real (- **Fecha:** ...)
    let fechaISO = new Date().toISOString()
    const fechaMatch = rawMarkdown.match(/-\s*\*\*Fecha:\*\*\s*(.+)/i)
    if (fechaMatch) {
      const parsedDate = new Date(fechaMatch[1].trim())
      if (!isNaN(parsedDate.getTime())) {
        fechaISO = parsedDate.toISOString()
      }
    }

    // 3. Extraer Resumen (> **Resumen:** ...)
    let extracto = ''
    const resumenMatch = rawMarkdown.match(/>\s*\*\*Resumen:\*\*\s*(.+)/i)
    if (resumenMatch) {
      extracto = resumenMatch[1].trim().replace(/\[\.\.\.\]$/, '').trim()
    }

    // 4. Extraer Contenido (después de ## Contenido y antes de ## Imágenes)
    let contenidoLineas: string[] = []
    let enContenido = false
    for (const linea of lineas) {
      const l = linea.trim()
      if (l.startsWith('## Contenido')) {
        enContenido = true
        continue
      }
      if (l.startsWith('## Imágenes')) {
        enContenido = false
        break
      }
      if (enContenido && l.length > 0 && !l.startsWith('#') && !l.startsWith('- **') && !l.startsWith('>')) {
        contenidoLineas.push(l)
      }
    }
    if (contenidoLineas.length === 0) {
      // Si no se encontró bloque ## Contenido explícito, usar todos los párrafos limpios
      contenidoLineas = lineas
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 0 &&
            !l.startsWith('#') &&
            !l.startsWith('- **') &&
            !l.startsWith('>') &&
            !l.startsWith('![')
        )
    }

    if (!extracto && contenidoLineas.length > 0) {
      extracto = contenidoLineas[0].slice(0, 200) + '...'
    }

    // 5. Extraer Lista de Imágenes
    const imagenesFilenames: string[] = []
    const imgRegex = /!\[.*?\]\((.*?)\)/g
    let matchImg: RegExpExecArray | null
    while ((matchImg = imgRegex.exec(rawMarkdown)) !== null) {
      if (matchImg[1]) {
        imagenesFilenames.push(matchImg[1].trim())
      }
    }

    // Si no había en markdown, buscar archivos de imagen en la carpeta
    if (imagenesFilenames.length === 0) {
      const archivos = fs.readdirSync(folderPath)
      const imgsEnCarpeta = archivos.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      imagenesFilenames.push(...imgsEnCarpeta)
    }

    // Subir portada e imágenes de galería — deduplicadas por contenido, no por
    // nombre de archivo (ver comentario de subirImagenPorContenido).
    let portadaId: number | undefined = undefined
    const galeriaIds: number[] = []
    const hashesUsadosEnEsteArticulo = new Set<string>()

    for (let i = 0; i < imagenesFilenames.length; i++) {
      const imgFile = imagenesFilenames[i]
      const resultado = await subirImagenPorContenido(payload, folderPath, imgFile, `${titulo} - Imagen ${i + 1}`)
      if (!resultado || hashesUsadosEnEsteArticulo.has(resultado.hash)) continue
      hashesUsadosEnEsteArticulo.add(resultado.hash)

      if (portadaId === undefined) {
        portadaId = resultado.id
      } else {
        galeriaIds.push(resultado.id)
      }
    }

    // 6. Matchear comunidad real por nombre mencionado en el texto — antes era
    // una lista de palabras clave a mano, incompleta (le faltaban Coclesito, El
    // Harino, La Pintada y Tulú) y con entradas que no correspondían a ninguna
    // comunidad real ("penonome", "san miguel" son distrito/centro educativo,
    // no comunidades). Ahora compara directo contra los nombres que ya existen
    // en la base — cualquier comunidad nueva se detecta sola, sin mantenimiento.
    let comunidadId = defaultComunidadId
    const textoNorm = normalizar(titulo + ' ' + rawMarkdown)

    for (const c of comunidades) {
      if (c.nombre === 'Sin clasificar') continue
      if (textoNorm.includes(normalizar(c.nombre))) {
        comunidadId = c.id
        break
      }
    }

    // 7. Buscar si ya existe la actividad
    const existentes = await payload.find({
      collection: 'actividades',
      where: {
        or: [{ titulo: { equals: titulo } }],
      },
      overrideAccess: true,
    })

    const payloadData = {
      titulo,
      extracto,
      contenido: parrafosLexical(contenidoLineas),
      fecha_publicacion: fechaISO,
      comunidad: comunidadId,
      // Sin heurística confiable de programa a partir del texto (a diferencia
      // de comunidad, no hay un nombre literal que buscar) — se deja en null
      // en vez de forzar el primero de la lista a los 70 artículos (`null`
      // explícito, no `undefined`, para que también borre el valor incorrecto
      // que dejó la corrida anterior al reprocesar). El staff lo asigna al
      // revisar, igual que la comunidad "Sin clasificar".
      programa: null,
      portada: portadaId ?? null,
      // Array vacío explícito, no `undefined` — en un `update` de Payload,
      // `undefined` significa "no tocar este campo", así que una galería que
      // quedó vacía tras deduplicar nunca borraría lo que había antes.
      galeria: galeriaIds,
    }

    if (existentes.docs.length > 0) {
      const docId = existentes.docs[0].id
      await payload.update({
        collection: 'actividades',
        id: docId,
        data: payloadData,
        overrideAccess: true,
      })
      await payload.update({
        collection: 'actividades',
        id: docId,
        data: { titulo, extracto },
        locale: 'en',
        overrideAccess: true,
      })
      actualizadas++
    } else {
      const doc = await payload.create({
        collection: 'actividades',
        data: payloadData,
        overrideAccess: true,
      })
      await payload.update({
        collection: 'actividades',
        id: doc.id,
        data: { titulo, extracto },
        locale: 'en',
        overrideAccess: true,
      })
      creadas++
    }

    if (procesadas % 10 === 0 || procesadas === carpetas.length) {
      console.log(`[${procesadas}/${carpetas.length}] Procesadas (Creadas: ${creadas}, Actualizadas: ${actualizadas})`)
    }
  }

  console.log(`\n🎉 Migración completa de historias finalizada!`)
  console.log(`Total procesadas: ${procesadas} | Creadas: ${creadas} | Actualizadas: ${actualizadas}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Error durante la migración de historias:', err)
  process.exit(1)
})
