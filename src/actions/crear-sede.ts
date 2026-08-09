'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'
import type { Sede } from '@/payload-types'

export type CrearSedeInput = {
  comunidadId: number
  destacada: boolean
  horario?: string
  lat: number
  lng: number
  locale: Locale
  nombre: string
  tipo: Sede['tipo']
}

export async function crearSede(input: CrearSedeInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar sedes.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre de la sede es obligatorio.' }
  }

  if (typeof input.lat !== 'number' || typeof input.lng !== 'number' || Number.isNaN(input.lat) || Number.isNaN(input.lng)) {
    return { error: 'Las coordenadas (latitud y longitud) son obligatorias.' }
  }

  const payload = await getPayload({ config })

  try {
    const nueva = await payload.create({
      collection: 'sedes',
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
    return { success: true, id: nueva.id }
  } catch (error) {
    console.error('Error al crear sede:', error)
    return { error: 'Ocurrió un error al registrar la sede. Verifica los datos.' }
  }
}
