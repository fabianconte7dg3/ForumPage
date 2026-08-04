'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type CrearProgramaInput = {
  activo: boolean
  color: string
  descripcion?: string
  icono?: string
  locale: string
  nombre: string
}

export async function crearPrograma(input: CrearProgramaInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar programas.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre del programa es obligatorio.' }
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
    return { error: 'El color debe ser hexadecimal, ej. #17423B.' }
  }

  const payload = await getPayload({ config })

  try {
    const nuevo = await payload.create({
      collection: 'programas',
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
    return { success: true, id: nuevo.id }
  } catch (error) {
    console.error('Error al crear programa:', error)
    return { error: 'Ocurrió un error al registrar el programa. Verifica los datos.' }
  }
}
