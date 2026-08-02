import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })

  // Buscar El Caimito en comunidades
  const res = await payload.find({
    collection: 'comunidades',
    where: { nombre: { equals: 'El Caimito' } },
    overrideAccess: true,
  })

  if (res.docs.length > 0) {
    const caimitoDoc = res.docs[0]
    await payload.update({
      collection: 'comunidades',
      id: caimitoDoc.id,
      data: {
        coordenadas: {
          lat: 8.6987,
          lng: -80.2355,
        },
        descripcion: 'Comunidad rural del distrito de Penonomé, zona de Pajonal.',
      },
      overrideAccess: true,
    })
    console.log('✅ Coordenadas y descripción de El Caimito corregidas exitosamente (ID:', caimitoDoc.id, ')')
  } else {
    console.log('El Caimito no encontrado en comunidades')
  }

  process.exit(0)
}

run().catch(console.error)
