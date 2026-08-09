'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarRecursoInput = {
  id: number
  titulo: string
  tipo: 'pdf_propio' | 'enlace_externo' | 'video_youtube' | 'practica'
  nivel?: number
  materia?: number
  idioma: 'es' | 'en'
  url?: string
  fuenteYLicencia: string
  archivo?: FormData
  locale: Locale
}

export async function editarRecurso(input: EditarRecursoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar recursos.' }
  }

  if (!input.titulo || input.titulo.trim().length < 2) {
    return { error: 'El título es obligatorio.' }
  }

  if (!input.fuenteYLicencia || input.fuenteYLicencia.trim().length < 2) {
    return { error: 'La fuente y licencia son obligatorias.' }
  }

  if ((input.tipo === 'enlace_externo' || input.tipo === 'video_youtube') && !input.url?.trim()) {
    return { error: 'La URL es obligatoria para este tipo de recurso.' }
  }

  const payload = await getPayload({ config })

  try {
    // Solo se toca `archivo` si se subió un reemplazo — si no, se deja el
    // archivo existente tal cual (no forzar re-subida en cada edición).
    let archivoId: number | undefined
    const file = input.archivo?.get('file') as File | null
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt: input.titulo.trim() },
        file: { data: buffer, name: file.name, mimetype: file.type, size: file.size },
        overrideAccess: false,
        user: usuario,
      })
      archivoId = mediaDoc.id
    }

    const dataToUpdate = {
      titulo: input.titulo.trim(),
      tipo: input.tipo,
      nivel: input.nivel || undefined,
      materia: input.materia || undefined,
      idioma: input.idioma,
      ...(archivoId !== undefined && { archivo: archivoId }),
      url: input.url?.trim() || undefined,
      fuente_y_licencia: input.fuenteYLicencia.trim(),
    }

    await payload.update({
      collection: 'recursos',
      id: input.id,
      locale: input.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToUpdate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/aprende/biblioteca`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar recurso:', error)
    return { error: 'Ocurrió un error al actualizar el recurso.' }
  }
}
