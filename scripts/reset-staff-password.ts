import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config })

  // Resetear contraseña del staff existente
  await payload.update({
    collection: 'users',
    id: 61,
    data: {
      password: 'Staff2026!',
    } as any,
    overrideAccess: true,
  })

  console.log('✅ Contraseña del staff reseteada:')
  console.log('   Email: contefania3@gmail.com')
  console.log('   Password: Staff2026!')
  console.log('   Rol: staff')

  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
