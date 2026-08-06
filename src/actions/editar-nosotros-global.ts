'use server'

import { revalidatePath } from 'next/cache'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { User } from '@/payload-types'

export type SeccionResumenInput = {
  titulo: string
  texto: string
  imagenId?: number
  imagenFile?: FormData
}

export type EditarNosotrosInput = {
  misionText: string
  historiaText: string
  secciones: SeccionResumenInput[]
  locale: string
}

async function subirImagen(payload: Payload, file: File, alt: string, usuario: User) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data: buffer, name: file.name, mimetype: file.type, size: file.size },
    overrideAccess: false,
    user: usuario,
  })
  return doc.id
}

export async function editarNosotrosGlobal(input: EditarNosotrosInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para editar la información institucional.' }
  }

  const payload = await getPayload({ config })

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const richMision: any = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: input.misionText.trim(), version: 1 }],
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const richHistoria: any = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: input.historiaText.trim(), version: 1 }],
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }

    const secciones = []
    for (const seccion of input.secciones) {
      let imagenId = seccion.imagenId
      const archivo = seccion.imagenFile?.get('file') as File | null
      if (archivo && archivo.size > 0) {
        imagenId = await subirImagen(payload, archivo, seccion.titulo.trim(), usuario)
      }
      secciones.push({
        titulo: seccion.titulo.trim(),
        texto: seccion.texto.trim(),
        imagen: imagenId || undefined,
      })
    }

    await payload.updateGlobal({
      slug: 'nosotros',
      data: {
        mision: richMision,
        historia: richHistoria,
        secciones_resumen: secciones,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/nosotros`)
    revalidatePath(`/${input.locale}/nosotros/programas`)
    revalidatePath(`/${input.locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar Nosotros global:', error)
    return { error: 'Ocurrió un error al actualizar la información de Nosotros.' }
  }
}
