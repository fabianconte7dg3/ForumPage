'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export async function crearDesembolso(
  becarioId: number,
  monto: number,
  fecha: string,
  concepto: string,
  locale: string
) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const payload = await getPayload({ config })

  try {
    const reqMock = { user: usuario, payload } as any

    await payload.create({
      collection: 'desembolsos',
      data: { 
        becario: becarioId,
        monto,
        fecha_programada: fecha,
        fecha_efectiva: fecha,
        concepto,
        estado: 'pagado'
      } as any,
      overrideAccess: false,
      req: reqMock,
    })

    revalidatePath(`/${locale}/staff/${becarioId}`)
    return { success: true }
  } catch (error) {
    console.error(`Error creando desembolso:`, error)
    return { error: 'Ocurrió un error al registrar el desembolso.' }
  }
}
