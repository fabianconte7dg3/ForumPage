'use server'

import { getPayload } from 'payload'

import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'

export type ResultadoGestion = { ok: true } | { error: string; ok: false }

// Solo staff/admin puede cambiar el estado de una hora de labor social.
// El hook `autocompletarAprobador` de HorasLaborSocial.ts graba
// automáticamente quién hizo la acción, y `registrarAprobacion` deja
// traza en auditoría — esta acción solo orquesta la llamada.
export async function gestionarHora(
  horaId: number,
  estado: 'aprobada' | 'rechazada',
  comentario?: string,
): Promise<ResultadoGestion> {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'Sin permisos para gestionar horas.', ok: false }
  }

  if (!horaId || !estado) {
    return { error: 'Faltan datos requeridos.', ok: false }
  }

  const payload = await getPayload({ config })

  // Verificar que la hora existe y está pendiente
  const hora = await payload.findByID({
    collection: 'horas-labor-social',
    id: horaId,
    overrideAccess: true,
  })

  if (!hora) {
    return { error: 'El registro de horas no existe.', ok: false }
  }

  if (hora.estado !== 'pendiente') {
    return { error: `Este registro ya fue ${hora.estado}. No se puede cambiar.`, ok: false }
  }

  await payload.update({
    collection: 'horas-labor-social',
    id: horaId,
    data: {
      estado,
      ...(comentario?.trim() ? { comentario: comentario.trim() } : {}),
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Payload draft typing quirk
    overrideAccess: true,
    // Pasar el usuario real para que autocompletarAprobador funcione
    user: usuario,
  })

  return { ok: true }
}
