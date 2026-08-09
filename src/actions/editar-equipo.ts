'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type EditarEquipoInput = {
  id: number
  nombre: string
  cargo: string
  bio?: string
  destacado: boolean
  orden: number
  fotoFile?: FormData
  locale: Locale
}

export async function editarEquipo(input: EditarEquipoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar miembros del equipo.' }
  }

  if (!input.nombre || input.nombre.trim().length < 2) {
    return { error: 'El nombre es obligatorio.' }
  }

  if (!input.cargo || input.cargo.trim().length < 2) {
    return { error: 'El cargo es obligatorio.' }
  }

  const payload = await getPayload({ config })

  try {
    let fotoId: number | undefined

    if (input.fotoFile) {
      const file = input.fotoFile.get('file') as File | null
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `Foto de ${input.nombre.trim()}`,
          },
          file: {
            data: buffer,
            name: file.name,
            mimetype: file.type,
            size: file.size,
          },
          overrideAccess: false,
          user: usuario,
        })
        fotoId = mediaDoc.id
      }
    }

    const dataToUpdate: Record<string, unknown> = {
      nombre: input.nombre.trim(),
      cargo: input.cargo.trim(),
      bio: input.bio?.trim() || undefined,
      destacado: Boolean(input.destacado),
      orden: Number(input.orden) || 0,
    }

    if (fotoId) {
      dataToUpdate.foto = fotoId
    }

    await payload.update({
      collection: 'equipo',
      id: input.id,
      locale: input.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToUpdate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/nosotros`)
    revalidatePath(`/${input.locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar miembro del equipo:', error)
    return { error: 'Ocurrió un error al actualizar el miembro del equipo.' }
  }
}
