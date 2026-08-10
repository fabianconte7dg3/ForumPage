'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type CrearTallerInput = {
  nombre: string
  tipo: 'estudiantes' | 'adultos'
  sede?: number
  fecha?: string
  responsable?: string
  realizada: boolean
  participantes?: number
  notas?: string
  locale: Locale
}

export async function crearTaller(input: CrearTallerInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar talleres.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre del taller es obligatorio.' }
  }

  const payload = await getPayload({ config })

  try {
    const nuevo = await payload.create({
      collection: 'talleres',
      locale: input.locale,
      data: {
        nombre: input.nombre.trim(),
        tipo: input.tipo,
        sede: input.sede || undefined,
        fecha: input.fecha || undefined,
        responsable: input.responsable?.trim() || undefined,
        realizada: input.realizada,
        participantes: input.realizada ? input.participantes || undefined : undefined,
        notas: input.notas?.trim() || undefined,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    return { success: true, id: nuevo.id }
  } catch (error) {
    console.error('Error al crear taller:', error)
    return { error: 'Ocurrió un error al registrar el taller.' }
  }
}
