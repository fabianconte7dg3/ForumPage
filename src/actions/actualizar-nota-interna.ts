'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

// nota_interna_evaluacion vive en RegistrosAcademicos.ts:206, no en Becarios.
// Ver 01-documento-de-proyecto.md §10 "Reglas a nivel de campo".
export async function actualizarNotaInterna(
  registroId: number,
  nuevaNota: string,
  locale: string
) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'registros-academicos',
      id: registroId,
      data: { nota_interna_evaluacion: nuevaNota },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error(`Error actualizando nota interna:`, error)
    return { error: 'Ocurrió un error al guardar la nota.' }
  }
}
