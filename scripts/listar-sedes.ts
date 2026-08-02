import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })
  const sedes = await payload.find({
    collection: 'sedes',
    limit: 50,
    overrideAccess: true,
  })

  console.log('--- SEDES ACTUALES ---')
  for (const s of sedes.docs) {
    console.log(`ID: ${s.id} | Nombre: ${s.nombre} | Tipo: ${s.tipo} | Coordenadas:`, s.coordenadas)
  }
  process.exit(0)
}

run().catch(console.error)
