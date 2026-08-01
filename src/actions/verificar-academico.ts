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
    // Forzamos un req mock con el usuario para que pasen los access controls y
    // los hooks que dependen de req.user (ej. autocompletarVerificacion, registrarAuditoria)
    const dataUpdate: any = {
      estado_verificacion: 'verificado', // para registros-academicos
      estado: 'verificado',              // para recuperaciones
    }

    if (tipo === 'registros-academicos' && detallesExtra) {
      if (detallesExtra.indice !== undefined) dataUpdate.indice = detallesExtra.indice
      if (detallesExtra.materias_aprobadas !== undefined) dataUpdate.materias_aprobadas = detallesExtra.materias_aprobadas
      if (detallesExtra.materias_reprobadas !== undefined) dataUpdate.materias_reprobadas = detallesExtra.materias_reprobadas
    }

    await payload.update({
      collection: tipo,
      id,
      data: dataUpdate,
      overrideAccess: false,
      user: usuario,
    })

    // Revalidar la página del becario
    revalidatePath(`/${locale}/staff/${becarioId}`)
    return { success: true }
  } catch (error) {
    console.error(`Error verificando ${tipo}:`, error)
    return { error: 'Ocurrió un error al verificar el documento.' }
  }
}
