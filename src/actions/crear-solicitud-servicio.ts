'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type CrearSolicitudServicioInput = {
  solicitante: string
  comunidad?: number
  canal: 'whatsapp' | 'carta'
  tipo_servicio: 'impresion_copia' | 'materiales_compras' | 'ambos'
  descripcion: string
  cantidad_hojas?: number
  documento_solicitud?: number
  lugar_retiro?: string
  estado: 'recibida' | 'en_preparacion' | 'lista_para_retirar' | 'entregada' | 'cancelada'
  fecha_solicitud?: string
  fecha_entrega?: string
  recibido_por?: string
  comprobante_entrega?: number
  observaciones?: string
  locale: Locale
}

export async function crearSolicitudServicio(input: CrearSolicitudServicioInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar solicitudes.' }
  }

  if (!input.solicitante || input.solicitante.trim().length < 2) {
    return { error: 'El nombre del solicitante es obligatorio.' }
  }

  if (!input.descripcion || input.descripcion.trim().length < 3) {
    return { error: 'El detalle de la solicitud es obligatorio.' }
  }

  const payload = await getPayload({ config })

  try {
    const fechaSolicitud = input.fecha_solicitud || new Date().toISOString()
    const fechaEntrega = input.estado === 'entregada' ? input.fecha_entrega || new Date().toISOString() : undefined

    const nueva = await payload.create({
      collection: 'solicitudes-servicios',
      locale: input.locale,
      data: {
        solicitante: input.solicitante.trim(),
        comunidad: input.comunidad || undefined,
        canal: input.canal,
        tipo_servicio: input.tipo_servicio,
        descripcion: input.descripcion.trim(),
        cantidad_hojas: input.cantidad_hojas || undefined,
        documento_solicitud: input.documento_solicitud || undefined,
        lugar_retiro: input.lugar_retiro?.trim() || 'Auditorio',
        estado: input.estado,
        fecha_solicitud: fechaSolicitud,
        fecha_entrega: fechaEntrega,
        recibido_por: input.recibido_por?.trim() || undefined,
        comprobante_entrega: input.comprobante_entrega || undefined,
        observaciones: input.observaciones?.trim() || undefined,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    return { success: true, id: nueva.id }
  } catch (error) {
    console.error('Error al crear solicitud de servicio:', error)
    return { error: 'Ocurrió un error al registrar la solicitud de servicio.' }
  }
}
