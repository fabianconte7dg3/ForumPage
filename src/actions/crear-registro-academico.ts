'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export async function crearRegistroAcademico(
  becarioId: number,
  periodo: string,
  documentoId: number | undefined,
  locale: string
) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.create({
      collection: 'registros-academicos',
      data: { 
        becario: becarioId,
        periodo,
        documento: documentoId,
        estado_verificacion: 'pendiente'
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${locale}/staff/${becarioId}`)
    return { success: true }
  } catch (error) {
    console.error(`Error creando registro académico:`, error)
    return { error: 'Ocurrió un error al registrar el período.' }
  }
}
