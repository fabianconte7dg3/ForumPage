'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'

export type EditarNosotrosInput = {
  misionText: string
  historiaText: string
  locale: string
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

    await payload.updateGlobal({
      slug: 'nosotros',
      data: {
        mision: richMision,
        historia: richHistoria,
      },
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/nosotros`)
    revalidatePath(`/${input.locale}/staff`)
    return { success: true }
  } catch (error) {
    console.error('Error al editar Nosotros global:', error)
    return { error: 'Ocurrió un error al actualizar la información de Nosotros.' }
  }
}
