import Link from 'next/link'

import type { Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import type { Actividad } from '@/payload-types'

export function ActividadCard({ actividad, locale }: { actividad: Actividad; locale: Locale }) {
  const comunidad = typeof actividad.comunidad === 'object' ? actividad.comunidad : undefined
  const programa = typeof actividad.programa === 'object' ? actividad.programa : undefined
  const portada = typeof actividad.portada === 'object' ? actividad.portada : undefined

  return (
    <Link
      className="group flex flex-col border border-piedra/25 transition-colors hover:bg-niebla"
      href={`/${locale}/historias/${actividad.slug}`}
    >
      <div className="aspect-4/3 border-b border-piedra/25 bg-niebla">
        {portada?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={portada.alt ?? ''}
            className="h-full w-full object-cover"
            src={portada.url}
            style={{ objectPosition: `${portada.focalX ?? 50}% ${portada.focalY ?? 50}%` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-piedra/40">FORUM</div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="font-dato text-xs text-tinta/60">{formatearFecha(actividad.fecha_publicacion, locale)}</span>
          <div className="flex gap-2">
            {comunidad && (
              <span className="rounded-sm border border-piedra/25 px-2 py-0.5 font-dato text-[10px] uppercase text-tinta">
                {comunidad.nombre}
              </span>
            )}
            {programa && (
              <span className="rounded-sm border border-piedra/25 px-2 py-0.5 font-dato text-[10px] uppercase text-tinta">
                {programa.nombre}
              </span>
            )}
          </div>
        </div>
        <h3 className="font-display text-base font-bold uppercase leading-tight text-montana">{actividad.titulo}</h3>
      </div>
    </Link>
  )
}
