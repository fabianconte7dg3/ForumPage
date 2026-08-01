'use client'

import { useState } from 'react'
import { FormularioComunidadModal } from '@/components/staff/FormularioComunidadModal'
import type { Comunidad } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  comunidades: Comunidad[]
}

export function TabComunidades({ locale, comunidades }: Props) {
  const [query, setQuery] = useState('')

  const filtradas = query.trim() === ''
    ? comunidades
    : comunidades.filter((c) => c.nombre.toLowerCase().includes(query.toLowerCase()) || c.distrito?.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold uppercase text-montana">Puntos del Mapa & Comunidades</h2>
          <p className="font-lectura text-xs text-tinta/70">
            Administra las comunidades de Coclé y sus coordenadas GPS para el Mapa de Impacto.
          </p>
        </div>
        <FormularioComunidadModal locale={locale} />
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar comunidad por nombre o distrito..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-sm border border-piedra/25 px-4 py-2 font-lectura text-sm outline-none transition-colors focus:border-montana"
        />
      </div>

      {filtradas.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">No se encontraron comunidades.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-piedra/25">
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Comunidad</th>
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Distrito</th>
                <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">Corregimiento</th>
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Coordenadas GPS</th>
                <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={c.id}>
                  <td className="py-3 pr-4">
                    <p className="font-display text-sm font-bold text-tinta">{c.nombre}</p>
                    {c.descripcion && (
                      <p className="line-clamp-1 font-lectura text-xs text-piedra">{c.descripcion}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-lectura text-sm text-tinta">{c.distrito}</td>
                  <td className="hidden py-3 pr-4 font-lectura text-sm text-tinta md:table-cell">
                    {c.corregimiento ?? '—'}
                  </td>
                  <td className="py-3 pr-4 font-dato text-xs text-montana">
                    {c.coordenadas?.lat && c.coordenadas?.lng ? (
                      <span>{c.coordenadas.lat.toFixed(4)}, {c.coordenadas.lng.toFixed(4)}</span>
                    ) : (
                      <span className="text-cosecha font-bold">Sin coordenadas</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <FormularioComunidadModal
                      locale={locale}
                      comunidad={c}
                      variant="secondary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
