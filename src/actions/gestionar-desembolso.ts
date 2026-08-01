'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export async function gestionarDesembolso(
  id: number,
  nuevoEstado: 'programado' | 'retenido' | 'pagado' | 'cancelado',
  locale: string,
  becarioId: number
) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'desembolsos',
      id,
      data: { estado: nuevoEstado },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${locale}/staff/${becarioId}`)
    return { success: true }
  } catch (error) {
    console.error(`Error actualizando desembolso:`, error)
    return { error: 'Ocurrió un error al actualizar el estado del pago.' }
  }
}
