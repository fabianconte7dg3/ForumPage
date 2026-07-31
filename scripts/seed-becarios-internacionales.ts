import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })
  
  const comunidades = await payload.find({ collection: 'comunidades', limit: 1 })
  if (comunidades.docs.length === 0) {
    console.log('No hay comunidades')
    process.exit(1)
  }
  
  const comunidad = comunidades.docs[0]
  
  await payload.create({
    collection: 'becarios',
    data: {
      nombre: 'Sofía Valdés',
      estado: 'activo',
      comunidad: comunidad.id,
      universidad: 'Bocconi University',
      carrera: 'Economía y Finanzas',
      tipo_estudio: 'internacional',
      pais_estudio: 'Italia',
      ciudad_estudio: 'Milán',
      coordenadas_estudio: { lat: 45.4497, lng: 9.1895 },
      mostrar_en_mapa: true,
      consentimiento_firmado: true,
      consentimiento_fecha: new Date().toISOString()
    }
  })
  
  await payload.create({
    collection: 'becarios',
    data: {
      nombre: 'Ricardo Méndez',
      estado: 'activo',
      comunidad: comunidad.id,
      universidad: 'University of Florida',
      carrera: 'Ingeniería Agrícola',
      tipo_estudio: 'internacional',
      pais_estudio: 'Estados Unidos',
      ciudad_estudio: 'Gainesville',
      coordenadas_estudio: { lat: 29.6516, lng: -82.3248 },
      mostrar_en_mapa: true,
      consentimiento_firmado: true,
      consentimiento_fecha: new Date().toISOString()
    }
  })
  
  console.log('Becarios internacionales insertados')
  process.exit(0)
}

run()
