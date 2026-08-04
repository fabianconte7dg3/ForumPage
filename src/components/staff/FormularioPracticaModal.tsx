'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearPractica } from '@/actions/crear-practica'
import { editarPractica } from '@/actions/editar-practica'
import type { Practica, Nivel, Materia } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  practica?: Practica
  niveles: Nivel[]
  materias: Materia[]
  triggerText?: string
  variant?: 'primary' | 'secondary'
}

type PreguntaEstado = {
  enunciado: string
  opciones: string[]
  respuestaCorrecta: number
  retroalimentacion: string
}

const preguntaVacia = (): PreguntaEstado => ({
  enunciado: '',
  opciones: ['', ''],
  respuestaCorrecta: 0,
  retroalimentacion: '',
})

export function FormularioPracticaModal({
  locale,
  practica,
  niveles,
  materias,
  triggerText,
  variant = 'primary',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const esEdicion = !!practica

  const [titulo, setTitulo] = useState(practica?.titulo ?? '')
  const [nivelId, setNivelId] = useState<number | ''>(
    typeof practica?.nivel === 'object' ? practica.nivel?.id ?? '' : practica?.nivel ?? ''
  )
  const [materiaId, setMateriaId] = useState<number | ''>(
    typeof practica?.materia === 'object' ? practica.materia?.id ?? '' : practica?.materia ?? ''
  )
  const [modalidad, setModalidad] = useState<'descargable' | 'quiz_autocorregido' | 'quiz_con_progreso'>(
    practica?.modalidad ?? 'quiz_autocorregido'
  )
  const [archivoFile, setArchivoFile] = useState<File | null>(null)
  const [preguntas, setPreguntas] = useState<PreguntaEstado[]>(
    practica?.preguntas?.map((p) => ({
      enunciado: p.enunciado,
      opciones: (p.opciones ?? []).map((o) => o.texto),
      respuestaCorrecta: p.respuesta_correcta,
      retroalimentacion: p.retroalimentacion ?? '',
    })) ?? [preguntaVacia()]
  )

  const esQuiz = modalidad === 'quiz_autocorregido' || modalidad === 'quiz_con_progreso'

  const agregarPregunta = () => setPreguntas((prev) => [...prev, preguntaVacia()])
  const quitarPregunta = (i: number) => setPreguntas((prev) => prev.filter((_, idx) => idx !== i))
  const actualizarPregunta = (i: number, patch: Partial<PreguntaEstado>) =>
    setPreguntas((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))

  const agregarOpcion = (i: number) =>
    setPreguntas((prev) => prev.map((p, idx) => (idx === i ? { ...p, opciones: [...p.opciones, ''] } : p)))

  const actualizarOpcion = (i: number, j: number, valor: string) =>
    setPreguntas((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, opciones: p.opciones.map((o, oi) => (oi === j ? valor : o)) } : p))
    )

  const quitarOpcion = (i: number, j: number) =>
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== i || p.opciones.length <= 2) return p
        const opciones = p.opciones.filter((_, oi) => oi !== j)
        let respuestaCorrecta = p.respuestaCorrecta
        if (respuestaCorrecta === j) respuestaCorrecta = 0
        else if (respuestaCorrecta > j) respuestaCorrecta -= 1
        return { ...p, opciones, respuestaCorrecta }
      })
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    let archivo: FormData | undefined
    if (archivoFile) {
      archivo = new FormData()
      archivo.append('file', archivoFile)
    }

    const base = {
      titulo,
      nivel: nivelId || undefined,
      materia: materiaId || undefined,
      modalidad,
      archivo,
      preguntas: esQuiz
        ? preguntas.map((p) => ({
            enunciado: p.enunciado,
            opciones: p.opciones,
            respuestaCorrecta: p.respuestaCorrecta,
            retroalimentacion: p.retroalimentacion,
          }))
        : undefined,
      locale,
    }

    const res = esEdicion
      ? await editarPractica({ ...base, id: practica.id })
      : await crearPractica(base)

    setCargando(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setAbierto(false)
      if (!esEdicion) {
        setTitulo('')
        setNivelId('')
        setMateriaId('')
        setArchivoFile(null)
        setPreguntas([preguntaVacia()])
      }
      router.refresh()
    }
  }

  const defaultTrigger = esEdicion ? '✏ Editar Práctica' : '+ Nueva Práctica'

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={
          variant === 'primary'
            ? 'rounded-sm border border-montana bg-montana px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90'
            : 'rounded-sm border border-montana px-3 py-1 font-dato text-xs font-bold uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white'
        }
      >
        {triggerText ?? defaultTrigger}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/60 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-2xl rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-piedra/25 pb-4">
              <div>
                <p className="font-dato text-xs uppercase tracking-widest text-piedra">Prácticas del Centro de Aprendizaje</p>
                <h2 className="font-display text-xl font-bold uppercase text-montana">
                  {esEdicion ? 'Editar Práctica' : 'Agregar Nueva Práctica'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="font-dato text-sm font-bold text-piedra hover:text-tinta"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-sm border border-cosecha/50 bg-cosecha/10 p-3 font-lectura text-sm text-tinta">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                  Título <span className="text-cosecha">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Quiz de fracciones"
                  className="w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Modalidad <span className="text-cosecha">*</span>
                  </label>
                  <select
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value as typeof modalidad)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="quiz_autocorregido">Quiz autocorregido</option>
                    <option value="quiz_con_progreso">Quiz con progreso</option>
                    <option value="descargable">Descargable</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Nivel</label>
                  <select
                    value={nivelId}
                    onChange={(e) => setNivelId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Sin especificar</option>
                    {niveles.map((n) => (
                      <option key={n.id} value={n.id}>{n.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">Materia</label>
                  <select
                    value={materiaId}
                    onChange={(e) => setMateriaId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                  >
                    <option value="">Sin especificar</option>
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {modalidad === 'descargable' && (
                <div>
                  <label className="mb-1 block font-dato text-xs uppercase tracking-widest text-tinta">
                    Archivo {esEdicion ? '(dejar vacío para conservar el actual)' : <span className="text-cosecha">*</span>}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setArchivoFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-sm border border-piedra/25 bg-white px-3 py-1.5 font-lectura text-sm outline-none focus:border-montana"
                  />
                </div>
              )}

              {esQuiz && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block font-dato text-xs uppercase tracking-widest text-tinta">
                      Preguntas <span className="text-cosecha">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={agregarPregunta}
                      className="font-dato text-xs font-bold uppercase tracking-widest text-montana hover:underline"
                    >
                      + Agregar Pregunta
                    </button>
                  </div>

                  {preguntas.map((p, i) => (
                    <div key={i} className="rounded-sm border border-piedra/25 bg-niebla/30 p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="font-dato text-xs font-bold uppercase tracking-widest text-montana">
                          Pregunta {i + 1}
                        </span>
                        {preguntas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => quitarPregunta(i)}
                            className="font-dato text-xs text-cosecha hover:underline"
                          >
                            Quitar pregunta
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={2}
                        required
                        value={p.enunciado}
                        onChange={(e) => actualizarPregunta(i, { enunciado: e.target.value })}
                        placeholder="Enunciado de la pregunta"
                        className="mb-3 w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                      />

                      <p className="mb-1 font-dato text-xs uppercase tracking-widest text-piedra">
                        Opciones (marcá la correcta)
                      </p>
                      <div className="space-y-2">
                        {p.opciones.map((opcion, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correcta-${i}`}
                              checked={p.respuestaCorrecta === j}
                              onChange={() => actualizarPregunta(i, { respuestaCorrecta: j })}
                              className="h-4 w-4 accent-montana"
                            />
                            <input
                              type="text"
                              required
                              value={opcion}
                              onChange={(e) => actualizarOpcion(i, j, e.target.value)}
                              placeholder={`Opción ${j + 1}`}
                              className="flex-1 rounded-sm border border-piedra/25 bg-white px-3 py-1.5 font-lectura text-sm outline-none focus:border-montana"
                            />
                            {p.opciones.length > 2 && (
                              <button
                                type="button"
                                onClick={() => quitarOpcion(i, j)}
                                className="font-dato text-xs text-cosecha hover:underline"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => agregarOpcion(i)}
                        className="mt-2 font-dato text-xs font-bold uppercase tracking-widest text-montana hover:underline"
                      >
                        + Agregar Opción
                      </button>

                      <textarea
                        rows={2}
                        value={p.retroalimentacion}
                        onChange={(e) => actualizarPregunta(i, { retroalimentacion: e.target.value })}
                        placeholder="Retroalimentación (opcional)"
                        className="mt-3 w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm outline-none focus:border-montana"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-piedra/25">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="rounded-sm border border-piedra/25 px-4 py-2 font-dato text-xs font-bold uppercase tracking-widest text-tinta hover:bg-niebla"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="rounded-sm border border-montana bg-montana px-5 py-2 font-dato text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-montana/90 disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Práctica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
