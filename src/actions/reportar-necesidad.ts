'use server'

import { getPayload } from 'payload'

import config from '@/payload.config'

export type ResultadoReporte = { ok: true } | { error: string; ok: false }

// Corre en el servidor a propósito: el `create` de Necesidades queda cerrado
// a staff/admin (ver Necesidades.ts) — un formulario público no debe pegarle
// directo a esa API con un POST abierto, así que esta acción inserta con
// overrideAccess, siempre con estado 'recibida' y sin mostrarse todavía
// (`visible_publicamente: false` — el staff decide cuándo publicarla).
export async function reportarNecesidad(datos: {
  comunidadId: number
  descripcion: string
  // Campo señuelo: un formulario real nunca lo completa, un bot que
  // autocompleta todo sí. Si llega con algo, se descarta en silencio.
  favorito?: string
  solicitante: string
  titulo: string
}): Promise<ResultadoReporte> {
  if (datos.favorito) {
    return { ok: true }
  }

  const titulo = datos.titulo?.trim()
  const descripcion = datos.descripcion?.trim()
  const solicitante = datos.solicitante?.trim()

  if (!titulo || !descripcion || !solicitante || !datos.comunidadId) {
    return { error: 'Completá todos los campos', ok: false }
  }
  if (titulo.length > 200 || descripcion.length > 2000 || solicitante.length > 200) {
    return { error: 'Uno de los campos es demasiado largo', ok: false }
  }

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'necesidades',
    data: {
      comunidad: datos.comunidadId,
      descripcion,
      estado: 'recibida',
      prioridad: 'media',
      solicitante,
      titulo,
      visible_publicamente: false,
    },
    overrideAccess: true,
  })

  return { ok: true }
}
