'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'
import type { Sede } from '@/payload-types'

export type EditarSedeInput = {
  comunidadId: number
  destacada: boolean
  horario?: string
  id: number
  lat: number
  lng: number
  locale: Locale
  nombre: string
  tipo: Sede['tipo']
}

export async function editarSede(input: EditarSedeInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar sedes.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre de la sede es obligatorio.' }
  }

  if (typeof input.lat !== 'number' || typeof input.lng !== 'number' || Number.isNaN(input.lat) || Number.isNaN(input.lng)) {
    return { error: 'Las coordenadas (latitud y longitud) son obligatorias.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'sedes',
      id: input.id,
      locale: input.locale,
      data: {
        nombre: input.nombre.trim(),
        tipo: input.tipo,
        comunidad: input.comunidadId,
        coordenadas: { lat: input.lat, lng: input.lng },
        destacada: input.destacada,
        horario: input.horario?.trim() || undefined,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/impacto`)
    revalidatePath(`/${input.locale}/aprende/tutorias`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar sede:', error)
    return { error: 'Ocurrió un error al actualizar la sede.' }
  }
}
