'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Necesidade } from '@/payload-types'

export type ActualizarNecesidadInput = {
  estado: Necesidade['estado']
  id: number
  locale: string
  prioridad: Necesidade['prioridad']
  proyectoResultanteId?: number | null
  visible_publicamente: boolean
}

// Solo staff/admin — mismo criterio que el `update` real de la colección
// (esStaffOSuperior en Necesidades.ts). Directiva ve la cola pero no la
// gestiona: overrideAccess queda en false para que la colección sea la que
// de verdad decide, esta acción solo evita un formulario público abierto.
export async function actualizarNecesidad(input: ActualizarNecesidadInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para gestionar necesidades.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'necesidades',
      id: input.id,
      data: {
        estado: input.estado,
        prioridad: input.prioridad,
        proyecto_resultante: input.proyectoResultanteId || undefined,
        visible_publicamente: input.visible_publicamente,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/directiva/necesidades`)
    revalidatePath(`/${input.locale}/impacto`)
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar necesidad:', error)
    return { error: 'Ocurrió un error al actualizar la necesidad.' }
  }
}
