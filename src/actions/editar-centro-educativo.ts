'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarCentroEducativoInput = {
  comunidadId: number
  contacto?: string
  id: number
  lat: number
  lng: number
  locale: Locale
  matricula_aproximada?: number
  niveles_atendidos?: string
  nombre: string
}

export async function editarCentroEducativo(input: EditarCentroEducativoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar centros educativos.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre del centro educativo es obligatorio.' }
  }

  if (typeof input.lat !== 'number' || typeof input.lng !== 'number' || Number.isNaN(input.lat) || Number.isNaN(input.lng)) {
    return { error: 'Las coordenadas (latitud y longitud) son obligatorias.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'centros-educativos',
      id: input.id,
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
    return { success: true }
  } catch (error) {
    console.error('Error al editar centro educativo:', error)
    return { error: 'Ocurrió un error al actualizar el centro educativo.' }
  }
}
