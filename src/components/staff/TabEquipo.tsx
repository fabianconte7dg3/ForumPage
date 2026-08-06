'use client'

import { FormularioEquipoModal } from '@/components/staff/FormularioEquipoModal'
import { FormularioNosotrosModal } from '@/components/staff/FormularioNosotrosModal'
import type { Equipo } from '@/payload-types'
import type { Locale } from '@/i18n'

type Props = {
  locale: Locale
  equipo: Equipo[]
  misionTexto?: string
  historiaTexto?: string
  resumenTexto?: string
}

export function TabEquipo({ locale, equipo, misionTexto, historiaTexto, resumenTexto }: Props) {
  return (
    <div className="space-y-12">
      {/* Sección 1: Misión e Historia Global */}
      <div className="rounded-sm border border-piedra/25 bg-white p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-piedra/25 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Misión e Historia (/nosotros)</h2>
            <p className="font-lectura text-xs text-tinta/70">
              Textos institucionales principales de la fundación.
            </p>
          </div>
          <FormularioNosotrosModal
            historiaInicial={historiaTexto}
            locale={locale}
            misionInicial={misionTexto}
            resumenInicial={resumenTexto}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <span className="font-dato text-xs font-bold uppercase tracking-widest text-piedra">Misión</span>
            <p className="mt-2 font-lectura text-sm text-tinta/80 whitespace-pre-wrap">
              {misionTexto || 'Sin misión registrada.'}
            </p>
          </div>

          <div>
            <span className="font-dato text-xs font-bold uppercase tracking-widest text-piedra">Historia & Orígenes</span>
            <p className="mt-2 font-lectura text-sm text-tinta/80 whitespace-pre-wrap line-clamp-6">
              {historiaTexto || 'Sin historia registrada.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sección 2: Miembros del Equipo */}
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold uppercase text-montana">Miembros del Equipo</h2>
            <p className="font-lectura text-xs text-tinta/70">
              Administra el equipo de trabajo y directiva visible en la página `/nosotros`.
            </p>
          </div>
          <FormularioEquipoModal locale={locale} />
        </div>

        {equipo.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">No se encontraron miembros del equipo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-piedra/25">
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Orden</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Nombre</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Cargo</th>
                  <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">Tarjeta</th>
                  <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">Acción</th>
                </tr>
              </thead>
              <tbody>
                {equipo.map((m) => (
                  <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={m.id}>
                    <td className="py-3 pr-4 font-dato text-xs font-bold text-montana">{m.orden}</td>
                    <td className="py-3 pr-4">
                      <p className="font-display text-sm font-bold text-tinta">{m.nombre}</p>
                      {m.bio && <p className="line-clamp-1 font-lectura text-xs text-piedra">{m.bio}</p>}
                    </td>
                    <td className="py-3 pr-4 font-lectura text-sm text-tinta">{m.cargo}</td>
                    <td className="py-3 pr-4">
                      {m.destacado ? (
                        <span className="inline-block rounded-2px bg-cosecha/15 border border-cosecha/30 px-2 py-0.5 font-dato text-[10px] font-bold uppercase tracking-wider text-cosecha">
                          ⭐ Fundador (Destacado)
                        </span>
                      ) : (
                        <span className="font-dato text-xs text-piedra">Estándar</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <FormularioEquipoModal
                        locale={locale}
                        miembro={m}
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
    </div>
  )
}
