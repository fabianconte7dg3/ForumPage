'use server'

import { getPayload } from 'payload'

import type { Locale } from '@/i18n'
import config from '@/payload.config'
import type { Practica } from '@/payload-types'

export type ResultadoPregunta = { correcto: boolean; retroalimentacion: string | null }
export type ResultadoQuiz = { aciertos: number; total: number; preguntas: ResultadoPregunta[] }

// Corre en el servidor a propósito: `respuesta_correcta` y `retroalimentacion`
// están protegidas por field-access (esStaffOSuperiorFieldAccess en Practicas.ts)
// precisamente para que no viajen al cliente antes de calificar — si se
// calificara en el navegador, la respuesta estaría en el payload desde el inicio.
export async function calificarPractica(
  practicaId: number,
  respuestas: number[],
  locale: Locale,
): Promise<ResultadoQuiz> {
  const payload = await getPayload({ config })
  const practica = (await payload.findByID({
    collection: 'practicas',
    id: practicaId,
    locale,
    overrideAccess: true,
  })) as Practica

  const preguntas = practica.preguntas ?? []

  const resultado = preguntas.map((pregunta, i) => ({
    correcto: respuestas[i] === pregunta.respuesta_correcta,
    retroalimentacion: pregunta.retroalimentacion ?? null,
  }))

  return {
    aciertos: resultado.filter((r) => r.correcto).length,
    total: preguntas.length,
    preguntas: resultado,
  }
}
