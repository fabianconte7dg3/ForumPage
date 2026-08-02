import { getPayload } from 'payload'
import config from '../src/payload.config'

const NUEVAS_COMUNIDADES = [
  { nombre: 'El Guabal', distrito: 'La Pintada', lat: 8.8021, lng: -80.4412, descripcion: 'Comunidad rural en Coclé Norte con presencia de programas educativos.' },
  { nombre: 'Atré', distrito: 'Penonomé', lat: 8.6415, lng: -80.3211, descripcion: 'Comunidad en la cuenca de Penonomé norte.' },
  { nombre: 'Churiquita Chiquita', distrito: 'Penonomé', lat: 8.5812, lng: -80.2789, descripcion: 'Comunidad en la zona montañosa de Penonomé.' },
  { nombre: 'Sofre', distrito: 'Penonomé', lat: 8.6145, lng: -80.2287, descripcion: 'Comunidad vecina a Caimito en el distrito de Penonomé.' },
  { nombre: 'Vaquilla', distrito: 'Penonomé', lat: 8.6812, lng: -80.2014, descripcion: 'Comunidad en el corregimiento de Chiguirí Arriba.' },
  { nombre: 'Chiguirí Abajo', distrito: 'Penonomé', lat: 8.6945, lng: -80.2312, descripcion: 'Comunidad en las laderas de Chiguirí.' },
  { nombre: 'Alto de San Miguel', distrito: 'Penonomé', lat: 8.7412, lng: -80.2915, descripcion: 'Comunidad en la cuenca alta de San Miguel.' },
  { nombre: 'Boca de Tulú', distrito: 'Penonomé', lat: 8.8123, lng: -80.3512, descripcion: 'Comunidad en la desembocadura y cuenca del Río Tulú.' },
  { nombre: 'Boca de Cuiria', distrito: 'Penonomé', lat: 8.7812, lng: -80.3214, descripcion: 'Comunidad del sector de Cuiria.' },
  { nombre: 'Las Marías', distrito: 'Penonomé', lat: 8.8412, lng: -80.2415, descripcion: 'Comunidad limítrofe en la zona norte.' },
  { nombre: 'Uracillo Arriba', distrito: 'Penonomé', lat: 8.7512, lng: -80.2114, descripcion: 'Comunidad en el sector de Uracillo.' },
  { nombre: 'Río Indio Arriba', distrito: 'Penonomé', lat: 8.7312, lng: -80.1712, descripcion: 'Comunidad en las cabeceras del Río Indio.' },
  { nombre: 'Cascajal', distrito: 'La Pintada', lat: 8.7214, lng: -80.4012, descripcion: 'Comunidad montañosa del distrito de La Pintada.' },
  { nombre: 'Las Lajas', distrito: 'La Pintada', lat: 8.6912, lng: -80.4412, descripcion: 'Comunidad en La Pintada.' },
  { nombre: 'Piedras Gordas', distrito: 'La Pintada', lat: 8.6312, lng: -80.4512, descripcion: 'Comunidad tradicional de La Pintada.' },
]

async function run() {
  const payload = await getPayload({ config })

  console.log('🌱 Registrando comunidades adicionales de Coclé Norte...')

  for (const item of NUEVAS_COMUNIDADES) {
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
      console.log(`✅ Creada: ${item.nombre} (ID: ${nueva.id})`)
    }
  }

  console.log('✨ Registro completado.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
