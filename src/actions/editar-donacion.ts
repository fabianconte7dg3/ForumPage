'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarDonacionInput = {
  id: number
  institucion: string
  tipo_institucion: 'escuela' | 'universidad' | 'centro_salud' | 'iglesia' | 'otro'
  comunidadId?: number
  descripcion?: string
  fecha?: string
  locale: Locale
}

export async function editarDonacion(input: EditarDonacionInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar donaciones.' }
  }

  if (!input.institucion || input.institucion.trim().length < 2) {
    return { error: 'La institución es obligatoria.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'donaciones',
      id: input.id,
      locale: input.locale,
      data: {
        institucion: input.institucion.trim(),
        tipo_institucion: input.tipo_institucion,
        comunidad: input.comunidadId || undefined,
        descripcion: input.descripcion?.trim() || undefined,
        fecha: input.fecha || undefined,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar donación:', error)
    return { error: 'Ocurrió un error al actualizar la donación.' }
  }
}
