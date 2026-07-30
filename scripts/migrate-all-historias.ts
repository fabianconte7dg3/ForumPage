// Migra TODAS las historias comunitarias (~70 carpetas) desde ForumOldPageInfo/historias/ a Payload CMS.
// Extrae la fecha real de publicación (- **Fecha:** ...), resumen, contenido en Lexical, imágenes
// e intenta asociar la comunidad por palabras clave en el texto.
//
// Uso: pnpm tsx --env-file=.env scripts/migrate-all-historias.ts

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

const mediaCache = new Map<string, number>()

async function subirImagen(
  payload: Awaited<ReturnType<typeof getPayload>>,
  folderPath: string,
  filename: string,
  altText: string
): Promise<number | undefined> {
  const ruta = path.join(folderPath, filename)
  if (!fs.existsSync(ruta)) return undefined

  // Verificar caché
  if (mediaCache.has(filename)) {
    return mediaCache.get(filename)
  }

  const buffer = fs.readFileSync(ruta)
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
    mediaCache.set(filename, doc.id as number)
    return doc.id as number
  } catch (e) {
    console.warn(`No se pudo subir la imagen ${filename}:`, (e as Error).message)
    return undefined
  }
}

// Mapeo básico de palabras clave a nombres de comunidades
const COMUNIDAD_KEYWORDS: Record<string, string[]> = {
  caimito: ['caimito', 'el caimito', 'villa unida'],
  machuca: ['machuca'],
  turega: ['turega', 'túrega'],
  'rio indio': ['rio indio', 'río indio', 'alto riecito'],
  chiguiri: ['chiguiri', 'chiguirí', 'chiguiri arriba'],
  penonome: ['penonome', 'penonomé', 'candelario ovalle', 'angel maria herrera'],
  'san miguel': ['san miguel', 'san miguel centro'],
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
  const defaultComunidadId = comunidades[0].id

  // Obtener programas
  const programasResult = await payload.find({ collection: 'programas', limit: 10, overrideAccess: true })
  const programaId = programasResult.docs.length > 0 ? programasResult.docs[0].id : undefined

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

    // Subir portada e imágenes de galería
    let portadaId: number | undefined = undefined
    const galeriaIds: number[] = []

    for (let i = 0; i < imagenesFilenames.length; i++) {
      const imgFile = imagenesFilenames[i]
      const mediaId = await subirImagen(payload, folderPath, imgFile, `${titulo} - Imagen ${i + 1}`)
      if (mediaId) {
        if (i === 0) {
          portadaId = mediaId
        } else {
          galeriaIds.push(mediaId)
        }
      }
    }

    // 6. Matchear comunidad por palabras clave
    let comunidadId = defaultComunidadId
    const textoBúsqueda = (titulo + ' ' + rawMarkdown).toLowerCase()

    for (const [kwGroup, keywords] of Object.entries(COMUNIDAD_KEYWORDS)) {
      if (keywords.some((kw) => textoBúsqueda.includes(kw))) {
        const encontrada = comunidades.find(
          (c) => c.nombre.toLowerCase().includes(kwGroup) || (c.slug ?? '').toLowerCase().includes(kwGroup)
        )
        if (encontrada) {
          comunidadId = encontrada.id
          break
        }
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
      programa: programaId,
      portada: portadaId,
      galeria: galeriaIds.length > 0 ? galeriaIds : undefined,
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
