'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export async function verificarAcademico(
  tipo: 'registros-academicos' | 'recuperaciones',
  id: number,
  locale: string,
  becarioId: number,
  detallesExtra?: {
    indice?: number
    materias_aprobadas?: { nombre: string; calificacion: string }[]
    materias_reprobadas?: { nombre: string; calificacion: string }[]
  }
) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const payload = await getPayload({ config })

  try {
    // Las dos colecciones nombran distinto el mismo estado: registros-academicos
    // usa `estado_verificacion` y recuperaciones usa `estado`. Antes se mandaban
    // los dos campos a las dos y Payload descartaba en silencio el que no
    // existía — funcionaba de casualidad. Se separan las ramas para que un
    // renombre futuro falle en el build en vez de dejar de guardar sin avisar.
    // `user` va explícito para que corran los hooks que dependen de req.user
    // (autocompletarVerificacion, registrarAuditoria).
    if (tipo === 'recuperaciones') {
      await payload.update({
        collection: 'recuperaciones',
        id,
        data: { estado: 'verificado' },
        overrideAccess: false,
        user: usuario,
      })
    } else {
      await payload.update({
        collection: 'registros-academicos',
        id,
        data: {
          estado_verificacion: 'verificado',
          ...(detallesExtra?.indice !== undefined && { indice: detallesExtra.indice }),
          ...(detallesExtra?.materias_aprobadas !== undefined && {
            materias_aprobadas: detallesExtra.materias_aprobadas,
          }),
          ...(detallesExtra?.materias_reprobadas !== undefined && {
            materias_reprobadas: detallesExtra.materias_reprobadas,
          }),
        },
        overrideAccess: false,
        user: usuario,
      })
    }

    // Revalidar la página del becario
    revalidatePath(`/${locale}/staff/${becarioId}`)
    return { success: true }
  } catch (error) {
    console.error(`Error verificando ${tipo}:`, error)
    return { error: 'Ocurrió un error al verificar el documento.' }
  }
}
