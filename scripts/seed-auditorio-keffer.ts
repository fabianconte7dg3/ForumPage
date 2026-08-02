import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })

  // 1. Buscar un media doc de respaldo o crear uno
  const mediaDocs = await payload.find({
    collection: 'media',
    limit: 5,
    overrideAccess: true,
  })
  const mediaId = mediaDocs.docs[0]?.id

  // 2. Buscar comunidad relacionada (Chiguirí Arriba o Penonomé)
  const comunidades = await payload.find({
    collection: 'comunidades',
    limit: 50,
    overrideAccess: true,
  })
  const comunidadRelacionada = comunidades.docs.find((c) => c.nombre.includes('Chiguirí')) || comunidades.docs[0]

  // 3. Crear o actualizar Sede "Auditorio John Y. Keffer - Academia Forum"
  const sedesExistentes = await payload.find({
    collection: 'sedes',
    where: { nombre: { equals: 'Auditorio John Y. Keffer - Academia Forum' } },
    overrideAccess: true,
  })

  const dataSede = {
    nombre: 'Auditorio John Y. Keffer - Academia Forum',
    tipo: 'centro' as const,
    comunidad: comunidadRelacionada.id,
    coordenadas: {
      lat: 8.6260523,
      lng: -80.2360815,
    },
    destacada: true,
    horario: 'Eventos institucionales, capacitaciones y ceremonias de graduación',
    fotos: mediaId ? [mediaId] : undefined,
  }

  if (sedesExistentes.docs.length > 0) {
    const actualizada = await payload.update({
      collection: 'sedes',
      id: sedesExistentes.docs[0].id,
      data: dataSede,
      overrideAccess: true,
    })
    console.log('✅ Auditorio actualizado exitosamente (ID:', actualizada.id, ')')
  } else {
    const nueva = await payload.create({
      collection: 'sedes',
      data: dataSede,
      overrideAccess: true,
    })
    console.log('✅ Auditorio creado exitosamente (ID:', nueva.id, ')')
  }

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
