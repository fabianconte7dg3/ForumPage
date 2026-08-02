import { getPayload } from 'payload'
import config from '../src/payload.config'

const CORREGIMIENTOS_PENONOME = [
  { nombre: 'Penonomé (Cabecera)', distrito: 'Penonomé', lat: 8.5173, lng: -80.3556, descripcion: 'Cabecera del distrito de Penonomé y centro administrativo de la Provincia de Coclé.' },
  { nombre: 'Cañaveral', distrito: 'Penonomé', lat: 8.5312, lng: -80.4012, descripcion: 'Corregimiento del distrito de Penonomé.' },
  { nombre: 'Coclé', distrito: 'Penonomé', lat: 8.4812, lng: -80.3214, descripcion: 'Corregimiento histórico de Penonomé.' },
  { nombre: 'El Coco', distrito: 'Penonomé', lat: 8.5012, lng: -80.3812, descripcion: 'Corregimiento del distrito de Penonomé.' },
  { nombre: 'Pajonal', distrito: 'Penonomé', lat: 8.5712, lng: -80.2514, descripcion: 'Corregimiento montañoso del distrito de Penonomé.' },
  { nombre: 'Río Grande', distrito: 'Penonomé', lat: 8.4512, lng: -80.4812, descripcion: 'Corregimiento del llano de Penonomé.' },
  { nombre: 'Boca de Tucué', distrito: 'Penonomé', lat: 8.7214, lng: -80.2714, descripcion: 'Poblado y cuenca en el corregimiento de Toabré.' },
  { nombre: 'Candelario Ovalle', distrito: 'Penonomé', lat: 8.7612, lng: -80.2814, descripcion: 'Corregimiento del norte de Penonomé.' },
  { nombre: 'Riecito', distrito: 'Penonomé', lat: 8.8214, lng: -80.2814, descripcion: 'Comunidad del norte montañoso de Penonomé.' },
  { nombre: 'Victoriano Lorenzo', distrito: 'Penonomé', lat: 8.8512, lng: -80.3014, descripcion: 'Corregimiento en la zona norte de Penonomé.' },
]

async function run() {
  const payload = await getPayload({ config })

  console.log('🌱 Registrando corregimientos de Penonomé...')

  for (const item of CORREGIMIENTOS_PENONOME) {
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

    if (existentes.docs.length > 0) {
      console.log(`- ${item.nombre} ya existe (ID: ${existentes.docs[0].id})`)
    } else {
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
      console.log(`✅ Creado corregimiento: ${item.nombre} (ID: ${nueva.id})`)
    }
  }

  console.log('✨ Registro de Penonomé completado.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
