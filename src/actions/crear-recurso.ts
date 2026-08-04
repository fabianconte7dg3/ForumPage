'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type CrearRecursoInput = {
  titulo: string
  tipo: 'pdf_propio' | 'enlace_externo' | 'video_youtube' | 'practica'
  nivel?: number
  materia?: number
  idioma: 'es' | 'en'
  url?: string
  fuenteYLicencia: string
  archivo?: FormData
  locale: string
}

export async function crearRecurso(input: CrearRecursoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para agregar recursos.' }
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
    let archivoId: number | undefined

    if (input.tipo === 'pdf_propio') {
      const file = input.archivo?.get('file') as File | null
      if (!file || file.size === 0) {
        return { error: 'Subí el archivo PDF del recurso.' }
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      // A `media` a propósito: Recursos.archivo es material descargable
      // público de la Biblioteca, no un documento de expediente.
      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt: input.titulo.trim() },
        file: { data: buffer, name: file.name, mimetype: file.type, size: file.size },
        overrideAccess: false,
        user: usuario,
      })
      archivoId = mediaDoc.id
    }

    const dataToCreate = {
      titulo: input.titulo.trim(),
      tipo: input.tipo,
      nivel: input.nivel || undefined,
      materia: input.materia || undefined,
      idioma: input.idioma,
      archivo: archivoId,
      url: input.url?.trim() || undefined,
      fuente_y_licencia: input.fuenteYLicencia.trim(),
    }

    const nuevo = await payload.create({
      collection: 'recursos',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToCreate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/aprende/biblioteca`)
    return { success: true, id: nuevo.id }
  } catch (error) {
    console.error('Error al crear recurso:', error)
    return { error: 'Ocurrió un error al registrar el recurso.' }
  }
}
