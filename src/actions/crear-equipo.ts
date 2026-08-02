'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type CrearEquipoInput = {
  nombre: string
  cargo: string
  bio?: string
  destacado: boolean
  orden: number
  fotoFile?: FormData
  locale: string
}

export async function crearEquipo(input: CrearEquipoInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para agregar miembros del equipo.' }
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

    const dataToCreate = {
      nombre: input.nombre.trim(),
      cargo: input.cargo.trim(),
      bio: input.bio?.trim() || undefined,
      destacado: Boolean(input.destacado),
      orden: Number(input.orden) || 0,
      foto: fotoId || undefined,
    }

    const nuevo = await payload.create({
      collection: 'equipo',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToCreate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/nosotros`)
    revalidatePath(`/${input.locale}/staff`)
    return { success: true, id: nuevo.id }
  } catch (error) {
    console.error('Error al agregar miembro del equipo:', error)
    return { error: 'Ocurrió un error al registrar el miembro del equipo.' }
  }
}
