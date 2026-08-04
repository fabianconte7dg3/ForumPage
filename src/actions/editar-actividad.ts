'use server'

import { revalidatePath } from 'next/cache'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import { textoAParrafos } from '@/lib/richtext'
import type { Locale } from '@/i18n'
import type { User } from '@/payload-types'

export type EditarActividadInput = {
  comunidadId: number
  contenido: string
  destacada: boolean
  extracto?: string
  fecha_publicacion: string
  galeriaExistenteIds: number[]
  galeriaFiles?: FormData
  id: number
  locale: Locale
  portadaExistenteId: number | null
  portadaFile?: FormData
  portadaFocalX?: number
  portadaFocalY?: number
  programaId?: number
  proyectoId?: number
  titulo: string
}

async function subirImagen(
  payload: Payload,
  file: File,
  alt: string,
  usuario: User,
  focal?: { x: number; y: number }
) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const doc = await payload.create({
    collection: 'media',
    data: { alt, focalX: focal?.x, focalY: focal?.y },
    file: { data: buffer, name: file.name, mimetype: file.type, size: file.size },
    overrideAccess: false,
    user: usuario,
  })
  return doc.id
}

export async function editarActividad(input: EditarActividadInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar actividades.' }
  }

  if (!input.titulo || input.titulo.trim().length < 2) {
    return { error: 'El título es obligatorio.' }
  }
  if (!input.contenido || input.contenido.trim().length < 2) {
    return { error: 'El contenido es obligatorio.' }
  }
  if (!input.comunidadId) {
    return { error: 'La comunidad es obligatoria.' }
  }

  const payload = await getPayload({ config })

  try {
    let portadaId: number | null = input.portadaExistenteId
    const portadaFile = input.portadaFile?.get('file') as File | null
    const focal =
      input.portadaFocalX !== undefined && input.portadaFocalY !== undefined
        ? { x: input.portadaFocalX, y: input.portadaFocalY }
        : undefined
    if (portadaFile && portadaFile.size > 0) {
      portadaId = await subirImagen(payload, portadaFile, input.titulo.trim(), usuario, focal)
    } else if (portadaId && focal) {
      // Portada sin cambiar, pero el staff pudo haber movido el punto focal
      // sobre la misma foto — se actualiza el documento de media existente.
      await payload.update({
        collection: 'media',
        id: portadaId,
        data: { focalX: focal.x, focalY: focal.y },
        overrideAccess: false,
        user: usuario,
      })
    }

    const galeriaIds: number[] = [...input.galeriaExistenteIds]
    const galeriaFiles = (input.galeriaFiles?.getAll('files') ?? []) as File[]
    for (const file of galeriaFiles) {
      if (file.size > 0) {
        galeriaIds.push(await subirImagen(payload, file, input.titulo.trim(), usuario))
      }
    }

    await payload.update({
      collection: 'actividades',
      id: input.id,
      data: {
        titulo: input.titulo.trim(),
        extracto: input.extracto?.trim() || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contenido: textoAParrafos(input.contenido.trim()) as any,
        fecha_publicacion: input.fecha_publicacion || new Date().toISOString(),
        portada: portadaId,
        galeria: galeriaIds,
        comunidad: input.comunidadId,
        programa: input.programaId || undefined,
        proyecto: input.proyectoId || undefined,
        destacada: input.destacada,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/historias`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar actividad:', error)
    return { error: 'Ocurrió un error al actualizar la actividad.' }
  }
}
