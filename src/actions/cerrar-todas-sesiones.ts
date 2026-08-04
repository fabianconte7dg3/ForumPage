'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

// Vacía sessions[] por completo — incluida la sesión desde la que se llama,
// a propósito: es más simple y más seguro que tratar de preservar "esta
// sesión" (necesitaría decodificar el sid del JWT actual). El caso de uso
// real es "no sé si alguien más tiene acceso a mi cuenta" — cerrar todo y
// volver a entrar es la respuesta correcta ahí.
export async function cerrarTodasLasSesiones() {
  const usuario = await sesionActual()
  if (!usuario) {
    return { error: 'No autenticado.' }
  }

  const payload = await getPayload({ config })
  await payload.update({
    collection: 'users',
    id: usuario.id,
    data: { sessions: [] },
    overrideAccess: true,
  })

  return { success: true }
}
