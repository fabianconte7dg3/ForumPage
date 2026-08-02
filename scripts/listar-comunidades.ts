import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })
  const comunidades = await payload.find({
    collection: 'comunidades',
    limit: 100,
    overrideAccess: true,
  })

  console.log('--- COMUNIDADES ACTUALES ---')
  for (const c of comunidades.docs) {
    console.log(`- ${c.nombre} (ID: ${c.id}) | Coordenadas:`, c.coordenadas)
  }
  process.exit(0)
}

run().catch(console.error)
