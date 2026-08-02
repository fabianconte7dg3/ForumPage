import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })

  // Buscar un media existente de buena calidad o crear uno desde un archivo válido
  const mediaDocs = await payload.find({
    collection: 'media',
    limit: 5,
    overrideAccess: true,
  })

  const firstMedia = mediaDocs.docs[0]
  if (firstMedia) {
    // Asignar esta foto a la Sede "Administración Academia Forum"
    const sedes = await payload.find({
      collection: 'sedes',
      where: { nombre: { equals: 'Administración Academia Forum' } },
      overrideAccess: true,
    })

    if (sedes.docs.length > 0) {
      await payload.update({
        collection: 'sedes',
        id: sedes.docs[0].id,
        data: {
          coordenadas: { lat: 8.6217347, lng: -80.2414991 },
          destacada: true,
          fotos: [firstMedia.id],
        },
        overrideAccess: true,
      })
      console.log('✅ Sede actualizada con foto de Media ID:', firstMedia.id)
    }
  }

  process.exit(0)
}

run().catch(console.error)
