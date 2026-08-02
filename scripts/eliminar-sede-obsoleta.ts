import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })

  // Eliminar la sede obsoleta ID 1 ("Academia Forum / Biblioteca John Y. Keffer" en El Caimito)
  try {
    await payload.delete({
      collection: 'sedes',
      id: 1,
      overrideAccess: true,
    })
    console.log('✅ Sede obsoleta ID 1 eliminada correctamente de la base de datos.')
  } catch (e) {
    console.log('Error o ya eliminada:', e)
  }

  process.exit(0)
}

run().catch(console.error)
