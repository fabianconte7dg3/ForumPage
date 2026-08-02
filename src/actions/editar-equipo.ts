'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type EditarEquipoInput = {
  id: number
  nombre: string
  cargo: string
  bio?: string
  destacado: boolean
  orden: number
  locale: string
}

export async function editarEquipo(input: EditarEquipoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar miembros del equipo.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre es obligatorio.' }
  }

  if (!input.cargo || input.cargo.trim().length < 2) {
    return { error: 'El cargo es obligatorio.' }
  }

  const payload = await getPayload({ config })

  try {
    const dataToUpdate = {
      nombre: input.nombre.trim(),
      cargo: input.cargo.trim(),
      bio: input.bio?.trim() || undefined,
      destacado: Boolean(input.destacado),
      orden: Number(input.orden) || 0,
    }

    await payload.update({
      collection: 'equipo',
      id: input.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToUpdate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/nosotros`)
    revalidatePath(`/${input.locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar miembro del equipo:', error)
    return { error: 'Ocurrió un error al actualizar el miembro del equipo.' }
  }
}
