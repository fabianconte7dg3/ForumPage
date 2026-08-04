'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type EditarProgramaInput = {
  activo: boolean
  color: string
  descripcion?: string
  icono?: string
  id: number
  locale: string
  nombre: string
}

export async function editarPrograma(input: EditarProgramaInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar programas.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre del programa es obligatorio.' }
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
    return { error: 'El color debe ser hexadecimal, ej. #17423B.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'programas',
      id: input.id,
      data: {
        nombre: input.nombre.trim(),
        descripcion: input.descripcion?.trim() || undefined,
        color: input.color,
        icono: input.icono?.trim() || undefined,
        activo: input.activo,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/impacto`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar programa:', error)
    return { error: 'Ocurrió un error al actualizar el programa.' }
  }
}
