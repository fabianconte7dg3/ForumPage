'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FormularioNuevoBecario } from '@/components/staff/FormularioNuevoBecario'
import type { Becario } from '@/payload-types'
import type { Locale } from '@/i18n'

type HorasData = { pendientes: number; aprobadas: number }
type ComunidadSimple = { id: number; nombre: string }

type Props = {
  locale: Locale
  becarios: Becario[]
  horasPorBecario: Record<number, HorasData>
  comunidades?: ComunidadSimple[]
  textos: {
    buscarPlaceholder: string
    columnasBecario: string
    columnasUniversidad: string
    columnasEstado: string
    columnasPendientes: string
    columnasProgreso: string
    columnasAccion: string
    verExpediente: string
    sinResultados: string
    estadoActivo: string
    estadoSuspendido: string
    estadoGraduado: string
    estadoRetornado: string
    estadoRetirado: string
  }
}

const ESTADO_ESTILO: Record<Becario['estado'], string> = {
  activo: 'border-montana/40 bg-montana/10 text-montana',
  graduado: 'border-rio/40 bg-rio/10 text-rio',
  retornado: 'border-piedra/25 text-piedra',
  retirado: 'border-piedra/25 text-piedra line-through',
  suspendido: 'border-cosecha bg-cosecha/10 text-cosecha',
}

export function TablaBecarios({ locale, becarios, horasPorBecario, comunidades = [], textos: t }: Props) {
  const [query, setQuery] = useState('')

  const ESTADO_LABEL: Record<Becario['estado'], string> = {
    activo: t.estadoActivo,
    suspendido: t.estadoSuspendido,
    graduado: t.estadoGraduado,
    retornado: t.estadoRetornado,
    retirado: t.estadoRetirado,
  }

  const becariosFiltrados = query.trim() === '' 
    ? becarios 
    : becarios.filter((b) => b.nombre.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder={t.buscarPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-sm border border-piedra/25 px-4 py-2 font-lectura text-sm outline-none transition-colors focus:border-montana"
        />
        <FormularioNuevoBecario locale={locale} comunidades={comunidades} />
      </div>

      {becariosFiltrados.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.sinResultados}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-piedra/25">
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">{t.columnasBecario}</th>
                <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">{t.columnasUniversidad}</th>
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">{t.columnasEstado}</th>
                <th className="py-3 pr-4 text-right font-dato text-xs uppercase tracking-widest text-piedra">{t.columnasPendientes}</th>
                <th className="hidden py-3 pr-4 text-right font-dato text-xs uppercase tracking-widest text-piedra sm:table-cell">{t.columnasProgreso}</th>
                <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">{t.columnasAccion}</th>
              </tr>
            </thead>
            <tbody>
              {becariosFiltrados.map((b) => {
                const horas = horasPorBecario[b.id] ?? { pendientes: 0, aprobadas: 0 }
                return (
                  <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={b.id}>
                    <td className="py-3 pr-4">
                      <p className="font-display text-sm font-bold text-tinta">{b.nombre}</p>
                      <p className="font-lectura text-xs text-piedra md:hidden">{b.universidad}</p>
                    </td>
                    <td className="hidden py-3 pr-4 md:table-cell">
                      <p className="font-lectura text-sm text-tinta">{b.universidad}</p>
                      {b.carrera && <p className="font-lectura text-xs text-piedra">{b.carrera}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${ESTADO_ESTILO[b.estado]}`}>
                        {ESTADO_LABEL[b.estado]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {horas.pendientes > 0 ? (
                        <span className="inline-block rounded-sm border border-cosecha bg-cosecha/10 px-2 py-0.5 font-dato text-xs font-bold text-cosecha">
                          {horas.pendientes}h
                        </span>
                      ) : (
                        <span className="font-dato text-xs text-piedra">0</span>
                      )}
                    </td>
                    <td className="hidden py-3 pr-4 text-right sm:table-cell">
                      <span className="font-dato text-xs text-tinta">{horas.aprobadas}h</span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        className="rounded-sm border border-montana px-3 py-1.5 font-dato text-xs uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white"
                        href={`/${locale}/staff/${b.id}`}
                      >
                        {t.verExpediente}
                      </Link>
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
