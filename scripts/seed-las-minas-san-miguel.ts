import { getPayload } from 'payload'
import config from '../src/payload.config'

const MAS_CORREGIMIENTOS = [
  { nombre: 'Las Minas', distrito: 'Penonomé', lat: 8.6512, lng: -80.3912, descripcion: 'Comunidad y zona minera histórica en Penonomé norte.' },
  { nombre: 'San Miguel (San Miguel Centro)', distrito: 'Penonomé', lat: 8.7412, lng: -80.2915, descripcion: 'Poblado principal de San Miguel Centro en Penonomé norte.' },
]

async function run() {
  const payload = await getPayload({ config })

  for (const item of MAS_CORREGIMIENTOS) {
    const slug = item.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const existentes = await payload.find({
      collection: 'comunidades',
      where: { nombre: { equals: item.nombre } },
      overrideAccess: true,
    })

    if (existentes.docs.length === 0) {
      const nueva = await payload.create({
        collection: 'comunidades',
        data: {
          nombre: item.nombre,
          slug,
          distrito: item.distrito,
          coordenadas: {
            lat: item.lat,
            lng: item.lng,
          },
          descripcion: item.descripcion,
        },
        overrideAccess: true,
      })
      console.log(`✅ Creado: ${item.nombre} (ID: ${nueva.id})`)
    }
  }

  process.exit(0)
}

run().catch(console.error)
