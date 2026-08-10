'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type EditarTutoriaInput = {
  id: number
  materia: number
  nivel?: number
  sede: number
  fechaHora: string
  cupo?: number
  responsable?: string
  recurrencia?: 'ninguna' | 'semanal' | 'quincenal' | 'mensual'
  notas?: string
  realizada: boolean
  participantes?: number
  locale: string
}

export async function editarTutoria(input: EditarTutoriaInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar tutorías.' }
  }

  if (!input.materia) {
    return { error: 'La materia es obligatoria.' }
  }

  if (!input.sede) {
    return { error: 'La sede es obligatoria.' }
  }

  const fecha = input.fechaHora ? new Date(input.fechaHora) : null
  if (!fecha || Number.isNaN(fecha.getTime())) {
    return { error: 'La fecha y hora son obligatorias.' }
  }

  const payload = await getPayload({ config })

  try {
    const dataToUpdate = {
      materia: input.materia,
      nivel: input.nivel || undefined,
      sede: input.sede,
      fecha_hora: fecha.toISOString(),
      cupo: input.cupo || undefined,
      responsable: input.responsable?.trim() || undefined,
      recurrencia: input.recurrencia ?? 'ninguna',
      notas: input.notas?.trim() || undefined,
      realizada: input.realizada,
      participantes: input.realizada ? input.participantes || undefined : null,
    }

    await payload.update({
      collection: 'tutorias',
      id: input.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToUpdate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/aprende/tutorias`)
    revalidatePath(`/${input.locale}/aprende`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar tutoría:', error)
    return { error: 'Ocurrió un error al actualizar la tutoría.' }
  }
}
