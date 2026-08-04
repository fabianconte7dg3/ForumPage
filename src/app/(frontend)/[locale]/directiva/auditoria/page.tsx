import Link from 'next/link'
import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { User } from '@/payload-types'

// El registro cambia con cada acción sensible del staff — nunca estático.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Registro de auditoría',
    descripcion: 'Cambios sensibles del panel (horas, recuperaciones, desembolsos, cuentas), quién los hizo y cuándo. Solo directiva y administración.',
    sinSesion: 'Iniciá sesión desde el panel de administración para ver esto.',
    irAlPanel: 'Ir al panel',
    columnaFecha: 'Fecha',
    columnaActor: 'Quién',
    columnaAccion: 'Acción',
    columnaColeccion: 'Colección',
    columnaDocumento: 'Documento',
    verCambio: 'Ver valores',
    valorAnterior: 'Antes',
    valorNuevo: 'Después',
    sinValores: 'Sin valores registrados.',
    vacio: 'Todavía no hay eventos de auditoría.',
    anterior: '← Más recientes',
    siguiente: 'Más antiguos →',
    pagina: (p: number, total: number) => `Página ${p} de ${total}`,
  },
  en: {
    titulo: 'Audit log',
    descripcion: 'Sensitive panel changes (hours, recoveries, disbursements, accounts), who made them, and when. Directiva and admin only.',
    sinSesion: 'Log in from the admin panel to see this.',
    irAlPanel: 'Go to the panel',
    columnaFecha: 'Date',
    columnaActor: 'Who',
    columnaAccion: 'Action',
    columnaColeccion: 'Collection',
    columnaDocumento: 'Document',
    verCambio: 'View values',
    valorAnterior: 'Before',
    valorNuevo: 'After',
    sinValores: 'No values recorded.',
    vacio: 'No audit events yet.',
    anterior: '← Newest',
    siguiente: 'Older →',
    pagina: (p: number, total: number) => `Page ${p} of ${total}`,
  },
} satisfies Record<Locale, Record<string, string | ((p: number, total: number) => string)>>

const POR_PAGINA = 30

export default async function AuditoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ p?: string }>
}) {
  const { locale } = await params
  const { p } = await searchParams
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario || (usuario.rol !== 'directiva' && usuario.rol !== 'admin')) {
    return (
      <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
        <p className="font-lectura text-sm text-tinta">{t.sinSesion}</p>
        <Link className="mt-4 inline-block rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white" href="/admin">
          {t.irAlPanel}
        </Link>
      </div>
    )
  }

  const pagina = Math.max(1, Number(p) || 1)
  const payload = await getPayload({ config })
  const resultado = await payload.find({
    collection: 'auditoria',
    sort: '-fecha',
    limit: POR_PAGINA,
    page: pagina,
    depth: 1,
    overrideAccess: true,
  })

  const formatearFechaHora = (valor: string) =>
    new Date(valor).toLocaleString(locale === 'es' ? 'es-PA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-piedra/25 pb-6">
        <div>
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">Directiva</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
          <p className="mt-2 max-w-(--text-reading-width) font-lectura text-sm text-tinta/80">{t.descripcion}</p>
        </div>
        <Link
          className="font-dato text-xs uppercase tracking-widest text-piedra transition-colors hover:text-montana"
          href={`/${locale}/directiva/necesidades`}
        >
          Cola de necesidades →
        </Link>
      </header>

      {resultado.docs.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.vacio}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-piedra/25 text-left">
                <th className="py-2 pr-4 font-dato text-xs uppercase tracking-widest text-piedra">{t.columnaFecha}</th>
                <th className="py-2 pr-4 font-dato text-xs uppercase tracking-widest text-piedra">{t.columnaActor}</th>
                <th className="py-2 pr-4 font-dato text-xs uppercase tracking-widest text-piedra">{t.columnaAccion}</th>
                <th className="py-2 pr-4 font-dato text-xs uppercase tracking-widest text-piedra">{t.columnaColeccion}</th>
                <th className="py-2 pr-4 font-dato text-xs uppercase tracking-widest text-piedra">{t.columnaDocumento}</th>
                <th className="py-2 font-dato text-xs uppercase tracking-widest text-piedra">{t.verCambio}</th>
              </tr>
            </thead>
            <tbody>
              {resultado.docs.map((evento) => {
                const actor = typeof evento.actor === 'object' ? (evento.actor as User) : null
                const tieneValores = evento.valor_anterior != null || evento.valor_nuevo != null
                return (
                  <tr className="border-b border-piedra/10 align-top" key={evento.id}>
                    <td className="py-3 pr-4 font-dato text-xs text-tinta/70 whitespace-nowrap">{formatearFechaHora(evento.fecha)}</td>
                    <td className="py-3 pr-4 font-lectura text-sm text-tinta">{actor?.email ?? '—'}</td>
                    <td className="py-3 pr-4 font-lectura text-sm text-tinta">{evento.accion}</td>
                    <td className="py-3 pr-4 font-dato text-xs text-tinta/70">{evento.coleccion}</td>
                    <td className="py-3 pr-4 font-dato text-xs text-tinta/70">{evento.documento_id}</td>
                    <td className="py-3">
                      {tieneValores ? (
                        <details>
                          <summary className="cursor-pointer font-dato text-xs uppercase tracking-widest text-rio">{t.verCambio}</summary>
                          <div className="mt-2 max-w-md space-y-2">
                            {evento.valor_anterior != null && (
                              <div>
                                <p className="font-dato text-[10px] uppercase tracking-widest text-piedra">{t.valorAnterior}</p>
                                <pre className="overflow-x-auto rounded-sm bg-niebla p-2 font-dato text-[11px] text-tinta">
                                  {JSON.stringify(evento.valor_anterior, null, 2)}
                                </pre>
                              </div>
                            )}
                            {evento.valor_nuevo != null && (
                              <div>
                                <p className="font-dato text-[10px] uppercase tracking-widest text-piedra">{t.valorNuevo}</p>
                                <pre className="overflow-x-auto rounded-sm bg-niebla p-2 font-dato text-[11px] text-tinta">
                                  {JSON.stringify(evento.valor_nuevo, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      ) : (
                        <span className="font-dato text-xs text-piedra">{t.sinValores}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {resultado.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-piedra/25 pt-4">
          <Link
            aria-disabled={!resultado.hasPrevPage}
            className={`font-dato text-xs uppercase tracking-widest ${resultado.hasPrevPage ? 'text-montana hover:underline' : 'pointer-events-none text-piedra/40'}`}
            href={`/${locale}/directiva/auditoria?p=${pagina - 1}`}
          >
            {t.anterior}
          </Link>
          <p className="font-dato text-xs text-piedra">{t.pagina(pagina, resultado.totalPages)}</p>
          <Link
            aria-disabled={!resultado.hasNextPage}
            className={`font-dato text-xs uppercase tracking-widest ${resultado.hasNextPage ? 'text-montana hover:underline' : 'pointer-events-none text-piedra/40'}`}
            href={`/${locale}/directiva/auditoria?p=${pagina + 1}`}
          >
            {t.siguiente}
          </Link>
        </div>
      )}
    </div>
  )
}
