'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type CrearDonacionInput = {
  institucion: string
  tipo_institucion: 'escuela' | 'universidad' | 'centro_salud' | 'iglesia' | 'otro'
  comunidadId?: number
  descripcion?: string
  fecha?: string
  locale: Locale
}

export async function crearDonacion(input: CrearDonacionInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar donaciones.' }
  }

  if (!input.institucion || input.institucion.trim().length < 2) {
    return { error: 'La institución es obligatoria.' }
  }

  const payload = await getPayload({ config })

  try {
    const nueva = await payload.create({
      collection: 'donaciones',
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
    return { success: true, id: nueva.id }
  } catch (error) {
    console.error('Error al crear donación:', error)
    return { error: 'Ocurrió un error al registrar la donación.' }
  }
}
