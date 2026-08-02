'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type EditarProyectoInput = {
  id: number
  titulo: string
  comunidadId: number
  programaId?: number
  estado: 'propuesto' | 'aprobado' | 'en_ejecucion' | 'completado'
  avance: number
  monto?: number
  fecha_inicio?: string
  fecha_fin?: string
  locale: string
}

export async function editarProyecto(input: EditarProyectoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar proyectos.' }
  }

  if (!input.titulo || input.titulo.trim().length < 2) {
    return { error: 'El título del proyecto es obligatorio.' }
  }

  if (!input.comunidadId) {
    return { error: 'Debes seleccionar una comunidad de origen.' }
  }

  const avanceNum = Math.min(100, Math.max(0, Number(input.avance) || 0))

  const payload = await getPayload({ config })

  try {
    const dataToUpdate = {
      titulo: input.titulo.trim(),
      comunidad: input.comunidadId,
      programa: input.programaId || undefined,
      estado: input.estado,
      avance: avanceNum,
      monto: input.monto ? Number(input.monto) : undefined,
      fecha_inicio: input.fecha_inicio || undefined,
      fecha_fin: input.fecha_fin || undefined,
    }

    await payload.update({
      collection: 'proyectos',
      id: input.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToUpdate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/impacto`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar proyecto:', error)
    return { error: 'Ocurrió un error al actualizar el proyecto.' }
  }
}
