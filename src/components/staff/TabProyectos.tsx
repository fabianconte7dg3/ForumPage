'use client'

import { useState } from 'react'
import { FormularioProyectoModal } from '@/components/staff/FormularioProyectoModal'
import type { Proyecto, Comunidad, Programa } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  proyectos: Proyecto[]
  comunidades: Comunidad[]
  programas: Programa[]
}

const ESTADOS_MAP: Record<string, { label: string; style: string }> = {
  propuesto: { label: 'Propuesto', style: 'bg-piedra/10 text-piedra border-piedra/25' },
  aprobado: { label: 'Aprobado', style: 'bg-rio/10 text-rio border-rio/25' },
  en_ejecucion: { label: 'En ejecución', style: 'bg-cosecha/10 text-cosecha border-cosecha/25' },
  completado: { label: 'Completado', style: 'bg-montana/10 text-montana border-montana/25' },
}

export function TabProyectos({ locale, proyectos, comunidades, programas }: Props) {
  const [query, setQuery] = useState('')

  const filtrados = query.trim() === ''
    ? proyectos
    : proyectos.filter((p) => {
        const com = typeof p.comunidad === 'object' ? p.comunidad.nombre : ''
        return p.titulo.toLowerCase().includes(query.toLowerCase()) || com.toLowerCase().includes(query.toLowerCase())
      })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold uppercase text-montana">Proyectos de Infraestructura & Programas</h2>
          <p className="font-lectura text-xs text-tinta/70">
            Gestiona los proyectos comunitarios y actualiza su porcentaje de avance (%) para el Mapa de Impacto.
          </p>
        </div>
        <FormularioProyectoModal
          comunidades={comunidades}
          locale={locale}
          programas={programas}
        />
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar proyecto por título o comunidad..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-sm border border-piedra/25 px-4 py-2 font-lectura text-sm outline-none transition-colors focus:border-montana"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">No se encontraron proyectos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-piedra/25">
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Proyecto</th>
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Comunidad</th>
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Estado</th>
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Avance (%)</th>
                <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const comNombre = typeof p.comunidad === 'object' ? p.comunidad.nombre : '—'
                const estConfig = ESTADOS_MAP[p.estado] ?? { label: p.estado, style: 'bg-niebla text-tinta' }
                const avancePct = p.avance ?? 0

                return (
                  <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={p.id}>
                    <td className="py-3 pr-4">
                      <p className="font-display text-sm font-bold text-tinta">{p.titulo}</p>
                      {p.monto && (
                        <p className="font-dato text-xs text-piedra">${p.monto.toLocaleString()} USD</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-lectura text-sm text-tinta">{comNombre}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded-2px border px-2 py-0.5 font-dato text-[10px] font-bold uppercase tracking-wider ${estConfig.style}`}>
                        {estConfig.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded-full bg-piedra/15 overflow-hidden">
                          <div className="h-2 bg-cosecha rounded-full transition-all" style={{ width: `${avancePct}%` }} />
                        </div>
                        <span className="font-dato text-xs font-bold text-montana">{avancePct}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <FormularioProyectoModal
                        comunidades={comunidades}
                        locale={locale}
                        programas={programas}
                        proyecto={p}
                        variant="secondary"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
