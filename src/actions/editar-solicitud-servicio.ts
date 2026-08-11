'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarSolicitudServicioInput = {
  id: number
  solicitante: string
  comunidad?: number
  canal: 'whatsapp' | 'carta'
  tipo_servicio: 'impresion_copia' | 'materiales_compras' | 'ambos'
  descripcion: string
  cantidad_hojas?: number
  documento_solicitud?: number | null
  lugar_retiro?: string
  estado: 'recibida' | 'en_preparacion' | 'lista_para_retirar' | 'entregada' | 'cancelada'
  fecha_solicitud?: string
  fecha_entrega?: string | null
  recibido_por?: string | null
  comprobante_entrega?: number | null
  observaciones?: string | null
  locale: Locale
}

export async function editarSolicitudServicio(input: EditarSolicitudServicioInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para actualizar solicitudes.' }
  }

  if (!input.id) {
    return { error: 'ID de solicitud no válido.' }
  }

  if (!input.solicitante || input.solicitante.trim().length < 2) {
    return { error: 'El nombre del solicitante es obligatorio.' }
  }

  const payload = await getPayload({ config })

  try {
    const original = await payload.findByID({
      collection: 'solicitudes-servicios',
      id: input.id,
      overrideAccess: false,
      user: usuario,
    })

    if (!original) {
      return { error: 'Solicitud no encontrada.' }
    }

    const cambiandoAEntregada = original.estado !== 'entregada' && input.estado === 'entregada'
    const fechaEntrega = input.estado === 'entregada'
      ? (input.fecha_entrega || original.fecha_entrega || new Date().toISOString())
      : null

    await payload.update({
      collection: 'solicitudes-servicios',
      id: input.id,
      locale: input.locale,
      data: {
        solicitante: input.solicitante.trim(),
        comunidad: input.comunidad || null,
        canal: input.canal,
        tipo_servicio: input.tipo_servicio,
        descripcion: input.descripcion.trim(),
        cantidad_hojas: input.cantidad_hojas || null,
        documento_solicitud: input.documento_solicitud !== undefined ? input.documento_solicitud : original.documento_solicitud,
        lugar_retiro: input.lugar_retiro?.trim() || 'Auditorio',
        estado: input.estado,
        fecha_solicitud: input.fecha_solicitud || original.fecha_solicitud,
        fecha_entrega: fechaEntrega,
        recibido_por: input.recibido_por?.trim() || null,
        comprobante_entrega: input.comprobante_entrega !== undefined ? input.comprobante_entrega : original.comprobante_entrega,
        observaciones: input.observaciones?.trim() || null,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar solicitud de servicio:', error)
    return { error: 'Ocurrió un error al actualizar la solicitud.' }
  }
}
