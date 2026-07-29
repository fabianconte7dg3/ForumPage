'use client'

import { useEffect, useState } from 'react'

import { calificarPractica, type ResultadoQuiz } from '@/actions/calificar-practica'
import type { Locale } from '@/i18n'

type PreguntaPublica = { enunciado: string; opciones: string[] }

type Textos = {
  enviar: string
  reintentar: string
  aciertos: string
  completadoAntes: string
}

type Progreso = { aciertos: number; total: number; fecha: string }

const claveProgreso = (practicaId: number) => `practica-progreso-${practicaId}`

export function QuizPractica({
  practicaId,
  preguntas,
  guardarProgreso,
  locale,
  textos,
}: {
  practicaId: number
  preguntas: PreguntaPublica[]
  guardarProgreso: boolean
  locale: Locale
  textos: Textos
}) {
  const [respuestas, setRespuestas] = useState<(number | undefined)[]>(() => preguntas.map(() => undefined))
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [progresoPrevio, setProgresoPrevio] = useState<Progreso | null>(null)

  useEffect(() => {
    // localStorage no existe en el servidor — se lee acá (tras montar en el
    // cliente) a propósito, para que el HTML de SSR e hidratación coincidan.
    if (!guardarProgreso) return
    const guardado = localStorage.getItem(claveProgreso(practicaId))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (guardado) setProgresoPrevio(JSON.parse(guardado))
  }, [guardarProgreso, practicaId])

  const completo = respuestas.every((r) => r !== undefined)

  async function enviar() {
    setEnviando(true)
    const seleccionadas = respuestas.map((r) => r ?? -1)
    const res = await calificarPractica(practicaId, seleccionadas, locale)
    setResultado(res)
    setEnviando(false)
    if (guardarProgreso) {
      const progreso: Progreso = { aciertos: res.aciertos, total: res.total, fecha: new Date().toISOString() }
      localStorage.setItem(claveProgreso(practicaId), JSON.stringify(progreso))
      setProgresoPrevio(progreso)
    }
  }

  function reintentar() {
    setRespuestas(preguntas.map(() => undefined))
    setResultado(null)
  }

  return (
    <div className="space-y-8">
      {progresoPrevio && !resultado && (
        <p className="rounded-sm border border-piedra/25 bg-niebla px-4 py-2 font-dato text-xs uppercase text-tinta">
          {textos.completadoAntes}: {progresoPrevio.aciertos}/{progresoPrevio.total}
        </p>
      )}

      {preguntas.map((pregunta, i) => {
        const res = resultado?.preguntas[i]
        return (
          <fieldset className="rounded-lg border border-piedra/25 bg-white p-5" disabled={!!resultado} key={i}>
            <legend className="font-lectura text-base font-semibold text-tinta">{pregunta.enunciado}</legend>
            <div className="mt-3 space-y-2">
              {pregunta.opciones.map((opcion, j) => (
                <label className="flex items-center gap-2 font-lectura text-sm text-tinta" key={j}>
                  <input
                    checked={respuestas[i] === j}
                    name={`pregunta-${i}`}
                    onChange={() => setRespuestas((prev) => prev.map((r, k) => (k === i ? j : r)))}
                    type="radio"
                  />
                  {opcion}
                </label>
              ))}
            </div>
            {res && (
              <p className={`mt-3 font-dato text-xs ${res.correcto ? 'text-montana' : 'text-red-700'}`}>
                {res.correcto ? '✓' : '✗'} {res.retroalimentacion}
              </p>
            )}
          </fieldset>
        )
      })}

      {!resultado ? (
        <button
          className="rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white disabled:opacity-40"
          disabled={!completo || enviando}
          onClick={enviar}
          type="button"
        >
          {textos.enviar}
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <p className="font-display text-lg font-bold text-montana">
            {textos.aciertos}: {resultado.aciertos}/{resultado.total}
          </p>
          <button
            className="rounded-sm border border-piedra/25 px-4 py-2 font-dato text-xs uppercase tracking-widest text-tinta"
            onClick={reintentar}
            type="button"
          >
            {textos.reintentar}
          </button>
        </div>
      )}
    </div>
  )
}
