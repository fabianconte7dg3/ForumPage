'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarGiraInput = {
  id: number
  destino: string
  escuela: number
  nivel?: number
  fecha?: string
  realizada: boolean
  participantes?: number
  notas?: string
  locale: Locale
}

export async function editarGira(input: EditarGiraInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar giras educativas.' }
  }

  if (!input.destino || input.destino.trim().length < 2) {
    return { error: 'El destino de la gira es obligatorio.' }
  }

  if (!input.escuela) {
    return { error: 'La escuela es obligatoria.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'giras-educativas',
      id: input.id,
      locale: input.locale,
      data: {
        destino: input.destino.trim(),
        escuela: input.escuela,
        nivel: input.nivel || undefined,
        fecha: input.fecha || undefined,
        realizada: input.realizada,
        participantes: input.realizada ? input.participantes || undefined : null,
        notas: input.notas?.trim() || undefined,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar gira educativa:', error)
    return { error: 'Ocurrió un error al actualizar la gira educativa.' }
  }
}
