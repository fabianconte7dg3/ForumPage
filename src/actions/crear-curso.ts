'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type CrearCursoInput = {
  nombre: string
  tipo: 'estudiantes' | 'adultos'
  sede?: number
  fecha_inicio?: string
  responsable?: string
  realizada: boolean
  participantes?: number
  notas?: string
  locale: Locale
}

export async function crearCurso(input: CrearCursoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar cursos.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre del curso es obligatorio.' }
  }

  const payload = await getPayload({ config })

  try {
    const nuevo = await payload.create({
      collection: 'cursos',
      locale: input.locale,
      data: {
        nombre: input.nombre.trim(),
        tipo: input.tipo,
        sede: input.sede || undefined,
        fecha_inicio: input.fecha_inicio || undefined,
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
    console.error('Error al crear curso:', error)
    return { error: 'Ocurrió un error al registrar el curso.' }
  }
}
