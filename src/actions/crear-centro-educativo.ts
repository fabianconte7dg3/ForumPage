'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type CrearCentroEducativoInput = {
  comunidadId: number
  contacto?: string
  lat: number
  lng: number
  locale: Locale
  matricula_aproximada?: number
  niveles_atendidos?: string
  nombre: string
}

export async function crearCentroEducativo(input: CrearCentroEducativoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar centros educativos.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre del centro educativo es obligatorio.' }
  }

  if (typeof input.lat !== 'number' || typeof input.lng !== 'number' || Number.isNaN(input.lat) || Number.isNaN(input.lng)) {
    return { error: 'Las coordenadas (latitud y longitud) son obligatorias.' }
  }

  const payload = await getPayload({ config })

  try {
    const nuevo = await payload.create({
      collection: 'centros-educativos',
      locale: input.locale,
      data: {
        nombre: input.nombre.trim(),
        comunidad: input.comunidadId,
        coordenadas: { lat: input.lat, lng: input.lng },
        niveles_atendidos: input.niveles_atendidos?.trim() || undefined,
        matricula_aproximada: input.matricula_aproximada,
        contacto: input.contacto?.trim() || undefined,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    return { success: true, id: nuevo.id }
  } catch (error) {
    console.error('Error al crear centro educativo:', error)
    return { error: 'Ocurrió un error al registrar el centro educativo. Verifica los datos.' }
  }
}
