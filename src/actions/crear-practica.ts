'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sesionActual } from '@/lib/auth'
import type { Locale } from '@/i18n'

export type PreguntaInput = {
  enunciado: string
  opciones: string[]
  respuestaCorrecta: number
  retroalimentacion?: string
}

export type CrearPracticaInput = {
  titulo: string
  nivel?: number
  materia?: number
  modalidad: 'descargable' | 'quiz_autocorregido' | 'quiz_con_progreso'
  archivo?: FormData
  preguntas?: PreguntaInput[]
  locale: Locale
}

function validarPreguntas(preguntas: PreguntaInput[] | undefined): string | null {
  if (!preguntas || preguntas.length === 0) return 'Agregá al menos una pregunta.'
  for (const p of preguntas) {
    if (!p.enunciado?.trim()) return 'Cada pregunta necesita un enunciado.'
    if (!p.opciones || p.opciones.some((o) => !o.trim()) || p.opciones.length < 2) {
      return 'Cada pregunta necesita al menos 2 opciones, todas completas.'
    }
    if (p.respuestaCorrecta < 0 || p.respuestaCorrecta >= p.opciones.length) {
      return 'La opción correcta debe ser una de las opciones existentes.'
    }
  }
  return null
}

export async function crearPractica(input: CrearPracticaInput) {
  const usuario = await sesionActual()
  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    return { error: 'No autorizado para agregar prácticas.' }
  }

  if (!input.titulo || input.titulo.trim().length < 2) {
    return { error: 'El título es obligatorio.' }
  }

  const esQuiz = input.modalidad === 'quiz_autocorregido' || input.modalidad === 'quiz_con_progreso'

  if (esQuiz) {
    const errorPreguntas = validarPreguntas(input.preguntas)
    if (errorPreguntas) return { error: errorPreguntas }
  }

  const payload = await getPayload({ config })

  try {
    let archivoId: number | undefined
    if (input.modalidad === 'descargable') {
      const file = input.archivo?.get('file') as File | null
      if (!file || file.size === 0) {
        return { error: 'Subí el archivo descargable.' }
      }
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

    const dataToCreate = {
      titulo: input.titulo.trim(),
      nivel: input.nivel || undefined,
      materia: input.materia || undefined,
      modalidad: input.modalidad,
      archivo: archivoId,
      preguntas: esQuiz
        ? input.preguntas!.map((p) => ({
            enunciado: p.enunciado.trim(),
            opciones: p.opciones.map((texto) => ({ texto: texto.trim() })),
            respuesta_correcta: p.respuestaCorrecta,
            retroalimentacion: p.retroalimentacion?.trim() || undefined,
          }))
        : undefined,
    }

    const nueva = await payload.create({
      collection: 'practicas',
      locale: input.locale,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToCreate as any,
      overrideAccess: false,
      user: usuario,
    })

    revalidatePath(`/${input.locale}/staff`)
    revalidatePath(`/${input.locale}/aprende/practicas`)
    return { success: true, id: nueva.id }
  } catch (error) {
    console.error('Error al crear práctica:', error)
    return { error: 'Ocurrió un error al registrar la práctica.' }
  }
}
