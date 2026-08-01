import Link from 'next/link'
import type { Actividad } from '@/payload-types'
import { formatearFecha } from '@/lib/format'

type Props = {
  locale: 'es' | 'en'
  publicaciones: Actividad[]
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export function TabPublicaciones({ locale, publicaciones, page = 1, totalPages = 1, hasNextPage = false, hasPrevPage = false }: Props) {
  const t = {
    es: {
      nuevaPublicacion: '+ Nueva Publicación',
      sinPublicaciones: 'No hay publicaciones recientes.',
      fecha: 'Fecha',
      comunidad: 'Comunidad',
      titulo: 'Título',
      accion: '',
      editar: 'Editar',
      anterior: 'Anterior',
      siguiente: 'Siguiente',
      paginaDe: (p: number, t: number) => `Página ${p} de ${t}`,
    },
    en: {
      nuevaPublicacion: '+ New Publication',
      sinPublicaciones: 'No recent publications.',
      fecha: 'Date',
      comunidad: 'Community',
      titulo: 'Title',
      accion: '',
      editar: 'Edit',
      anterior: 'Previous',
      siguiente: 'Next',
      paginaDe: (p: number, t: number) => `Page ${p} of ${t}`,
    },
  }[locale]

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <a
          href="/admin/collections/actividades/create"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm bg-montana px-4 py-2 font-dato text-xs uppercase tracking-widest text-white transition-colors hover:bg-montana/90"
        >
          {t.nuevaPublicacion}
        </a>
      </div>

      {publicaciones.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.sinPublicaciones}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-piedra/25">
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">{t.fecha}</th>
                <th className="py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra">{t.titulo}</th>
                <th className="hidden py-3 pr-4 text-left font-dato text-xs uppercase tracking-widest text-piedra md:table-cell">{t.comunidad}</th>
                <th className="py-3 text-right font-dato text-xs uppercase tracking-widest text-piedra">{t.accion}</th>
              </tr>
            </thead>
            <tbody>
              {publicaciones.map((pub) => {
                const comunidad = typeof pub.comunidad === 'object' ? pub.comunidad : null
                return (
                  <tr className="border-b border-piedra/10 transition-colors hover:bg-niebla/50" key={pub.id}>
                    <td className="py-3 pr-4">
                      <span className="font-dato text-xs text-piedra">{formatearFecha(pub.fecha_publicacion, locale)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-display text-sm font-bold text-tinta">{pub.titulo}</p>
                      {comunidad && <p className="font-lectura text-xs text-piedra md:hidden">{comunidad.nombre}</p>}
                    </td>
                    <td className="hidden py-3 pr-4 md:table-cell">
                      {comunidad ? (
                        <span className="font-lectura text-sm text-tinta">{comunidad.nombre}</span>
                      ) : (
                        <span className="text-piedra">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <a
                        className="rounded-sm border border-montana px-3 py-1.5 font-dato text-xs uppercase tracking-widest text-montana transition-colors hover:bg-montana hover:text-white"
                        href={`/admin/collections/actividades/${pub.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.editar}
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-piedra/25 pt-4">
          <div>
            {hasPrevPage ? (
              <Link
                href={`/${locale}/staff?tab=publicaciones&p=${page - 1}`}
                className="font-dato text-xs uppercase tracking-widest text-montana transition-colors hover:underline"
              >
                ← {t.anterior}
              </Link>
            ) : (
              <span className="font-dato text-xs uppercase tracking-widest text-piedra/50">
                ← {t.anterior}
              </span>
            )}
          </div>
          
          <div className="font-dato text-xs uppercase tracking-widest text-piedra">
            {t.paginaDe(page, totalPages)}
          </div>
          
          <div>
            {hasNextPage ? (
              <Link
                href={`/${locale}/staff?tab=publicaciones&p=${page + 1}`}
                className="font-dato text-xs uppercase tracking-widest text-montana transition-colors hover:underline"
              >
                {t.siguiente} →
              </Link>
            ) : (
              <span className="font-dato text-xs uppercase tracking-widest text-piedra/50">
                {t.siguiente} →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
