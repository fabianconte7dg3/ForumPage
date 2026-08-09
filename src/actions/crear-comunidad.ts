'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type CrearComunidadInput = {
  nombre: string
  distrito: string
  corregimiento?: string
  lat: number
  lng: number
  descripcion?: string
  locale: Locale
}

export async function crearComunidad(input: CrearComunidadInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar comunidades.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre de la comunidad es obligatorio.' }
  }

  if (!input.distrito || input.distrito.trim().length < 2) {
    return { error: 'El distrito es obligatorio.' }
  }

  if (typeof input.lat !== 'number' || typeof input.lng !== 'number' || Number.isNaN(input.lat) || Number.isNaN(input.lng)) {
    return { error: 'Las coordenadas (latitud y longitud) son obligatorias.' }
  }

  const payload = await getPayload({ config })

  try {
    const dataToCreate = {
      nombre: input.nombre.trim(),
      distrito: input.distrito.trim(),
      corregimiento: input.corregimiento?.trim() || undefined,
      coordenadas: {
        lat: input.lat,
        lng: input.lng,
      },
      descripcion: input.descripcion?.trim() || undefined,
    }

    const nueva = await payload.create({
      collection: 'comunidades',
      locale: input.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToCreate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/impacto`)
    return { success: true, id: nueva.id }
  } catch (error) {
    console.error('Error al crear comunidad:', error)
    return { error: 'Ocurrió un error al registrar la comunidad. Verifica los datos.' }
  }
}
