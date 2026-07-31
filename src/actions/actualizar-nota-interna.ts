'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export async function actualizarNotaInterna(
  becarioId: number,
  nuevaNota: string,
  locale: string
) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const payload = await getPayload({ config })

  try {
    const reqMock = { user: usuario, payload } as any

    await payload.update({
      collection: 'becarios',
      id: becarioId,
      data: { nota_interna_evaluacion: nuevaNota },
      overrideAccess: false,
      req: reqMock,
    })

    revalidatePath(`/${locale}/staff/${becarioId}`)
    return { success: true }
  } catch (error) {
    console.error(`Error actualizando nota interna:`, error)
    return { error: 'Ocurrió un error al guardar la nota.' }
  }
}
