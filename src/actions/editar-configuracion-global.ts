'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarConfiguracionInput = {
  calificaciones_reprobatorias: string[]
  contacto_email?: string
  contacto_telefono?: string
  contacto_direccion?: string
  fecha_actualizacion_impacto?: string
  locale: Locale
  meta_horas_labor_social: number
  texto_aviso_suspension?: string
}

export async function editarConfiguracionGlobal(input: EditarConfiguracionInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar la configuración.' }
  }

  if (!Number.isFinite(input.meta_horas_labor_social) || input.meta_horas_labor_social <= 0) {
    return { error: 'La meta de horas de labor social debe ser un número mayor a 0.' }
  }

  const payload = await getPayload({ config })

  try {
    await payload.updateGlobal({
      slug: 'configuracion',
      locale: input.locale,
      data: {
        meta_horas_labor_social: input.meta_horas_labor_social,
        calificaciones_reprobatorias: input.calificaciones_reprobatorias
          .filter((c) => c.trim().length > 0)
          .map((c) => ({ calificacion: c.trim() })),
        texto_aviso_suspension: input.texto_aviso_suspension?.trim() || undefined,
        contacto_institucional: {
          email: input.contacto_email?.trim() || undefined,
          telefono: input.contacto_telefono?.trim() || undefined,
          direccion: input.contacto_direccion?.trim() || undefined,
        },
        fecha_actualizacion_impacto: input.fecha_actualizacion_impacto || undefined,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar configuración:', error)
    return { error: 'Ocurrió un error al actualizar la configuración.' }
  }
}
