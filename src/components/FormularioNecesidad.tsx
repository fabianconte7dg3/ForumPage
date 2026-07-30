'use client'

import { useState } from 'react'

import { reportarNecesidad } from '@/actions/reportar-necesidad'
import type { Locale } from '@/i18n'

const TEXTOS = {
  es: {
    solicitante: 'Tu nombre',
    comunidad: 'Comunidad',
    titulo: 'Título de la necesidad',
    descripcion: 'Descripción',
    enviar: 'Enviar solicitud',
    exito: 'Recibimos tu solicitud. El staff la va a revisar.',
    error: 'No se pudo enviar. Probá de nuevo.',
    elegirComunidad: 'Elegí una comunidad',
  },
  en: {
    solicitante: 'Your name',
    comunidad: 'Community',
    titulo: 'Need title',
    descripcion: 'Description',
    enviar: 'Send request',
    exito: 'We received your request. Staff will review it.',
    error: 'Could not send it. Try again.',
    elegirComunidad: 'Choose a community',
  },
} satisfies Record<Locale, Record<string, string>>

export function FormularioNecesidad({ comunidades, locale }: { comunidades: { id: number; nombre: string }[]; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS.es
  const [solicitante, setSolicitante] = useState('')
  const [comunidadId, setComunidadId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [favorito, setFavorito] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    const resultado = await reportarNecesidad({
      comunidadId: Number(comunidadId),
      descripcion,
      favorito,
      solicitante,
      titulo,
    })
    setEnviando(false)
    if (resultado.ok) {
      setExito(true)
    } else {
      setError(resultado.error)
    }
  }

  if (exito) {
    return <p className="font-lectura text-sm text-montana">{t.exito}</p>
  }

  return (
    <form className="max-w-lg space-y-4" onSubmit={enviar}>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="solicitante">
          {t.solicitante}
        </label>
        <input
          className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
          id="solicitante"
          onChange={(e) => setSolicitante(e.target.value)}
          required
          value={solicitante}
        />
      </div>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="comunidad">
          {t.comunidad}
        </label>
        <select
          className="mt-1 w-full rounded-sm border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm"
          id="comunidad"
          onChange={(e) => setComunidadId(e.target.value)}
          required
          value={comunidadId}
        >
          <option value="">{t.elegirComunidad}</option>
          {comunidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="titulo">
          {t.titulo}
        </label>
        <input
          className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
          id="titulo"
          maxLength={200}
          onChange={(e) => setTitulo(e.target.value)}
          required
          value={titulo}
        />
      </div>
      <div>
        <label className="block font-dato text-xs uppercase tracking-widest text-tinta" htmlFor="descripcion">
          {t.descripcion}
        </label>
        <textarea
          className="mt-1 w-full rounded-sm border border-piedra/25 px-3 py-2 font-lectura text-sm"
          id="descripcion"
          maxLength={2000}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          rows={4}
          value={descripcion}
        />
      </div>
      <input
        aria-hidden="true"
        className="absolute left-[-9999px]"
        name="sitio_web"
        onChange={(e) => setFavorito(e.target.value)}
        tabIndex={-1}
        type="text"
        value={favorito}
      />
      {error && <p className="font-lectura text-sm text-red-700">{error}</p>}
      <button
        className="rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white disabled:opacity-40"
        disabled={enviando}
        type="submit"
      >
        {t.enviar}
      </button>
    </form>
  )
}
