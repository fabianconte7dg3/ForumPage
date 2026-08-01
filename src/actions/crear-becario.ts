'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type CrearBecarioInput = {
  nombre: string
  comunidadId?: number
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
  consentimiento_firmado: boolean
  mostrar_en_mapa: boolean
  cita?: string
  locale: string
}

export async function crearBecario(input: CrearBecarioInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para registrar becarios.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre completo es obligatorio.' }
  }

  if (input.mostrar_en_mapa && !input.consentimiento_firmado) {
    return { error: 'No se puede mostrar en el mapa sin el consentimiento firmado.' }
  }

  const payload = await getPayload({ config })

  try {
    const dataToCreate: Record<string, unknown> = {
      nombre: input.nombre.trim(),
      comunidad: input.comunidadId || undefined,
      universidad: input.universidad?.trim() || undefined,
      carrera: input.carrera?.trim() || undefined,
      anio: input.anio || undefined,
      anio_inicio: input.anio_inicio || undefined,
      tipo_estudio: input.tipo_estudio,
      estado: input.estado,
      consentimiento_firmado: input.consentimiento_firmado,
      consentimiento_fecha: input.consentimiento_firmado ? new Date().toISOString() : undefined,
      mostrar_en_mapa: input.mostrar_en_mapa,
      cita: input.cita?.trim() || undefined,
    }

    if (input.tipo_estudio === 'internacional') {
      dataToCreate.pais_estudio = input.pais_estudio?.trim() || undefined
      dataToCreate.ciudad_estudio = input.ciudad_estudio?.trim() || undefined
      if (input.lat !== undefined && input.lng !== undefined) {
        dataToCreate.coordenadas_estudio = {
          lat: input.lat,
          lng: input.lng,
        }
      }
    }

    const nuevo = await payload.create({
      collection: 'becarios',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToCreate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/impacto`)
    return { success: true, id: nuevo.id }
  } catch (error) {
    console.error('Error al crear becario:', error)
    return { error: 'Ocurrió un error al registrar el becario. Revisa los datos ingresados.' }
  }
}
