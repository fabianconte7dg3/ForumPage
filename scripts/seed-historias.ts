// Carga 5 historias comunitarias reales del volcado ForumOldPageInfo/historias en Payload CMS
// Uso: pnpm tsx --env-file=.env scripts/seed-historias.ts
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const historiasBaseDir = path.resolve(dirname, '../ForumOldPageInfo/historias')

function parrafosLexical(textoCompleto: string) {
  const lineas = textoCompleto
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('- **') && !l.startsWith('>') && !l.startsWith('!['))

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

async function subirImagen(payload: Awaited<ReturnType<typeof getPayload>>, folderPath: string, filename: string, altText: string) {
  const ruta = path.join(folderPath, filename)
  if (!fs.existsSync(ruta)) return undefined

  const buffer = fs.readFileSync(ruta)
  const ext = path.extname(filename).toLowerCase()
  const mimetype = ext === '.png' ? 'image/png' : ext === '.jpeg' || ext === '.jpg' ? 'image/jpeg' : 'image/png'

  const doc = await payload.create({
    collection: 'media',
    data: { alt: altText },
    file: { data: buffer, mimetype, name: filename, size: buffer.length },
    overrideAccess: true,
  })
  return doc.id
}

type HistoriaConfig = {
  carpeta: string
  tituloEs: string
  tituloEn: string
  extractoEs: string
  extractoEn: string
  imagenNombre: string
  destacada?: boolean
}

const PRIMERAS_5_HISTORIAS: HistoriaConfig[] = [
  {
    carpeta: '2022 Honors Graduate Yazmilka Soto',
    tituloEs: 'Graduada con Honores 2022: Yazmilka Soto',
    tituloEn: '2022 Honors Graduate Yazmilka Soto',
    extractoEs:
      'Las montañas del norte de Coclé albergan mentes curiosas y motivadas. Yazmilka Velásquez Soto obtuvo el primer puesto de honor en el Colegio Candelario Ovalle y sueña con estudiar Derecho.',
    extractoEn:
      'The mountains in Northern Cocle are home to curious minds. Yazmilka Velasquez Soto achieved first-place honors at Candelario Ovalle High School and aims to study law.',
    imagenNombre: 'Soto-q2avlhg2lad4ci4anqotfdx5islslbu4lmez02rkps.jpg',
    destacada: true,
  },
  {
    carpeta: 'A Love for Language and Learning',
    tituloEs: 'Amor por el Idioma y el Aprendizaje: Ailin Pérez',
    tituloEn: 'A Love for Language and Learning',
    extractoEs:
      'Ailin Jassiel Pérez, originaria de Machuca, completó su licenciatura en Inglés en la Universidad de Panamá tras graduarse de la primera promoción de la Academia Forum.',
    extractoEn:
      'Ailin Jassiel Perez, raised in Machuca, earned her Bachelor Degree in English at the University of Panama after graduating from the first class of Forum Academy.',
    imagenNombre: 'Ailin-Perez-1-e1684164697348.png',
  },
  {
    carpeta: 'Access to Digital Resources Opens a Path to Sustainable Change',
    tituloEs: 'El Acceso a Recursos Digitales Abre Paso al Cambio Sostenible',
    tituloEn: 'Access to Digital Resources Opens a Path to Sustainable Change',
    extractoEs:
      'Jair Alberto Rodríguez, de Villa Unida en Caimito, obtuvo el tercer puesto de honor en el Colegio Ángel María Herrera aprovechando el centro comunitario de la Fundación.',
    extractoEn:
      'Jair Alberto Rodriguez, from Villa Unida in Caimito, came in third place in his graduating class utilizing digital resources at the Caimito Community Center.',
    imagenNombre: 'Jair-WEB.jpg',
  },
  {
    carpeta: 'Alexandra Martinez',
    tituloEs: 'Superación y Pasión Gastronómica: Alexandra Martínez',
    tituloEn: 'Alexandra Martinez: Passion for Culinary Arts',
    extractoEs:
      'Originaria de Túrega, Alexandra cursó el Bachillerato Internacional en la Academia Forum y hoy estudia Artes Culinarias en la Universidad de Panamá.',
    extractoEn:
      'Hailing from Turega, Alexandra studied the International Baccalaureate at Forum Academy and is now completing her Culinary Arts degree at University of Panama.',
    imagenNombre: 'Alexandra-Martinez-ov5waocsu8pko954uo3txc34uhel8301hmndxbz1y8.jpeg',
  },
  {
    carpeta: 'Bryner Joel Saldaña',
    tituloEs: 'De Estudiante a Líder Comunitario: Bryner Joel Saldaña',
    tituloEn: 'Bryner Joel Saldaña: From Student to Community Leader',
    extractoEs:
      'Criado en Caimito, Penonomé, Bryner completó el programa del IB en la Academia Forum y ha participado en giras de reclutamiento de estudiantes en comunidades rurales.',
    extractoEn:
      'Raised in Caimito, Bryner completed the IB Program at Forum Academy and participated in recruitment trips across northern Cocle rural communities.',
    imagenNombre: '20200831155107_IMG_3175.jpg',
  },
]

async function main() {
  const payload = await getPayload({ config })

  // Obtener una comunidad por defecto si existe (ej. El Caimito)
  const comunidades = await payload.find({ collection: 'comunidades', limit: 1, overrideAccess: true })
  if (comunidades.docs.length === 0) {
    console.error('No hay comunidades en la base de datos. Corre pnpm seed primero.')
    process.exit(1)
  }
  const comunidadId = comunidades.docs[0].id

  // Obtener un programa de becas/educación si existe
  const programas = await payload.find({ collection: 'programas', limit: 1, overrideAccess: true })
  const programaId = programas.docs.length > 0 ? programas.docs[0].id : undefined

  console.log(`Usando Comunidad ID: ${comunidadId} para el sembrado de historias.`)

  for (const h of PRIMERAS_5_HISTORIAS) {
    const carpetaPath = path.join(historiasBaseDir, h.carpeta)
    const mdPath = path.join(carpetaPath, 'articulo.md')

    if (!fs.existsSync(mdPath)) {
      console.warn(`No se encontró el archivo ${mdPath}, saltando...`)
      continue
    }

    const contenidoTexto = fs.readFileSync(mdPath, 'utf8')

    // Verificar si ya existe por título en español
    const existente = await payload.find({
      collection: 'actividades',
      where: { titulo: { equals: h.tituloEs } },
      overrideAccess: true,
    })

    if (existente.docs.length > 0) {
      console.log(`La historia "${h.tituloEs}" ya existe — omitiendo.`)
      continue
    }

    // Subir imagen de portada si existe
    const portadaId = await subirImagen(payload, carpetaPath, h.imagenNombre, h.tituloEs)

    // Crear la actividad en locale es
    const doc = await payload.create({
      collection: 'actividades',
      data: {
        titulo: h.tituloEs,
        extracto: h.extractoEs,
        contenido: parrafosLexical(contenidoTexto),
        fecha_publicacion: new Date().toISOString(),
        comunidad: comunidadId,
        programa: programaId,
        portada: portadaId,
        destacada: h.destacada ?? false,
      },
      overrideAccess: true,
    })

    // Actualizar locale en
    await payload.update({
      collection: 'actividades',
      id: doc.id,
      data: {
        titulo: h.tituloEn,
        extracto: h.extractoEn,
      },
      locale: 'en',
      overrideAccess: true,
    })

    console.log(`✅ Historia creada con éxito: "${h.tituloEs}" (ID: ${doc.id})`)
  }

  console.log('🎉 Sembrado de las primeras 5 historias completado.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Error al sembrar historias:', err)
  process.exit(1)
})
