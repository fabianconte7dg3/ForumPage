'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarBecarioInput = {
  id: number
  nombre: string
  comunidadId?: number
  nivel_educativo: 'primaria' | 'premedia' | 'media' | 'universidad'
  tipo_apoyo?: ('hospedaje' | 'transporte' | 'alimento')[]
  universidad?: string
  carrera?: string
  anio?: number
  anio_inicio?: number
  tipo_estudio: 'nacional' | 'internacional'
  pais_estudio?: string
  ciudad_estudio?: string
  lat?: number
  lng?: number
  estado: 'activo' | 'suspendido' | 'graduado' | 'retornado' | 'retirado'
  motivo_suspension?: string
  consentimiento_firmado: boolean
  mostrar_en_mapa: boolean
  cita?: string
  locale: Locale
}

export async function editarBecario(input: EditarBecarioInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar becarios.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre completo es obligatorio.' }
  }

  if (input.mostrar_en_mapa && !input.consentimiento_firmado) {
    return { error: 'No se puede mostrar en el mapa sin el consentimiento firmado.' }
  }

  const payload = await getPayload({ config })

  try {
    const dataToUpdate: Record<string, unknown> = {
      nombre: input.nombre.trim(),
      comunidad: input.comunidadId || undefined,
      nivel_educativo: input.nivel_educativo,
      tipo_apoyo: input.tipo_apoyo?.length ? input.tipo_apoyo : null,
      universidad: input.universidad?.trim() || undefined,
      carrera: input.carrera?.trim() || undefined,
      anio: input.anio || undefined,
      anio_inicio: input.anio_inicio || undefined,
      tipo_estudio: input.tipo_estudio,
      estado: input.estado,
      motivo_suspension: input.estado === 'suspendido' ? input.motivo_suspension?.trim() : undefined,
      fecha_suspension: input.estado === 'suspendido' ? new Date().toISOString() : undefined,
      consentimiento_firmado: input.consentimiento_firmado,
      consentimiento_fecha: input.consentimiento_firmado ? new Date().toISOString() : undefined,
      mostrar_en_mapa: input.mostrar_en_mapa,
      cita: input.cita?.trim() || undefined,
    }

    if (input.tipo_estudio === 'internacional') {
      dataToUpdate.pais_estudio = input.pais_estudio?.trim() || undefined
      dataToUpdate.ciudad_estudio = input.ciudad_estudio?.trim() || undefined
      if (input.lat !== undefined && input.lng !== undefined) {
        dataToUpdate.coordenadas_estudio = {
          lat: input.lat,
          lng: input.lng,
        }
      }
    }

    await payload.update({
      collection: 'becarios',
      id: input.id,
      locale: input.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToUpdate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff/${input.id}`)
    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/impacto`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar becario:', error)
    return { error: 'Ocurrió un error al actualizar los datos del becario.' }
  }
}
