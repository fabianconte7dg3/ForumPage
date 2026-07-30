import { headers as obtenerHeaders } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'
import type { User } from '@/payload-types'

// Un Server Component no recibe la cookie directo — se valida contra el
// mismo mecanismo que usa el resto de Payload (payload.auth), nunca
// confiando en nada que venga del cliente.
export async function sesionActual(): Promise<User | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await obtenerHeaders() })
  return (user as User | null) ?? null
}
