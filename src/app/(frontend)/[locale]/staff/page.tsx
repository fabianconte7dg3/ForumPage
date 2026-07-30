import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { BotonCerrarSesion } from '@/components/BotonCerrarSesion'
import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Becario, HoraLaborSocial } from '@/payload-types'

export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Panel del Staff',
    subtitulo: 'Gestión de expedientes de becarios',
    cerrarSesion: 'Cerrar sesión',
    columnasBecario: 'Becario',
    columnasUniversidad: 'Universidad',
    columnasEstado: 'Estado de beca',
    columnasPendientes: 'Pendientes',
    columnasProgreso: 'Progreso',
    columnasAccion: '',
    verExpediente: 'Ver expediente',
    sinBecarios: 'No hay becarios registrados.',
    estadoActivo: 'Activo',
    estadoSuspendido: 'Suspendido',
    estadoGraduado: 'Graduado',
    estadoRetornado: 'Retornado',
    estadoRetirado: 'Retirado',
    totalBecarios: 'Becarios',
    totalPendientes: 'Horas pendientes de revisión',
    totalAprobadas: 'Horas aprobadas este ciclo',
  },
  en: {
    titulo: 'Staff Panel',
    subtitulo: 'Becario expedition management',
    cerrarSesion: 'Log out',
    columnasBecario: 'Becario',
    columnasUniversidad: 'University',
    columnasEstado: 'Scholarship status',
    columnasPendientes: 'Pending',
    columnasProgreso: 'Progress',
    columnasAccion: '',
    verExpediente: 'View record',
    sinBecarios: 'No becarios registered.',
    estadoActivo: 'Active',
    estadoSuspendido: 'Suspended',
    estadoGraduado: 'Graduated',
    estadoRetornado: 'Returned',
    estadoRetirado: 'Withdrawn',
    totalBecarios: 'Becarios',
    totalPendientes: 'Hours pending review',
    totalAprobadas: 'Approved hours this cycle',
  },
} satisfies Record<Locale, Record<string, string>>

const ESTADO_ESTILO: Record<Becario['estado'], string> = {
  activo: 'border-montana/40 bg-montana/10 text-montana',
  graduado: 'border-rio/40 bg-rio/10 text-rio',
  retornado: 'border-piedra/25 text-piedra',
  retirado: 'border-piedra/25 text-piedra line-through',
  suspendido: 'border-cosecha bg-cosecha/10 text-cosecha',
}

export default async function StaffDashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    redirect(`/${locale}/portal`)
  }

  const payload = await getPayload({ config })

  // Todos los becarios
  const becarios = (
    await payload.find({
      collection: 'becarios',
      limit: 500,
      sort: 'nombre',
      overrideAccess: true,
    })
  ).docs as Becario[]

  // Todas las horas (para calcular pendientes y aprobadas por becario)
  const todasLasHoras = (
    await payload.find({
      collection: 'horas-labor-social',
      limit: 10000,
      overrideAccess: true,
    })
  ).docs as HoraLaborSocial[]

  // Agrupar horas por becario
  const horasPorBecario = new Map<number, { pendientes: number; aprobadas: number }>()
  for (const h of todasLasHoras) {
    const bId = typeof h.becario === 'object' ? h.becario.id : h.becario
    const entry = horasPorBecario.get(bId) ?? { pendientes: 0, aprobadas: 0 }
    if (h.estado === 'pendiente') entry.pendientes += h.horas
    if (h.estado === 'aprobada') entry.aprobadas += h.horas
    horasPorBecario.set(bId, entry)
  }

  const totalPendientes = todasLasHoras.filter((h) => h.estado === 'pendiente').reduce((acc, h) => acc + h.horas, 0)
  const totalAprobadas = todasLasHoras.filter((h) => h.estado === 'aprobada').reduce((acc, h) => acc + h.horas, 0)

  const ESTADO_LABEL: Record<Becario['estado'], string> = {
    activo: t.estadoActivo,
    suspendido: t.estadoSuspendido,
    graduado: t.estadoGraduado,
    retornado: t.estadoRetornado,
    retirado: t.estadoRetirado,
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-piedra/25 pb-8">
        <div>
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">Forum Foundation</p>
          <h1 className="font-display text-2xl font-bold uppercase text-montana md:text-3xl">{t.titulo}</h1>
          <p className="mt-1 font-lectura text-sm text-tinta/70">{t.subtitulo}</p>
        </div>
        <BotonCerrarSesion locale={locale} texto={t.cerrarSesion} />
      </header>

      {/* Tarjetas de resumen global */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalBecarios}</p>
          <p className="mt-1 font-display text-2xl font-bold text-tinta">{becarios.length}</p>
        </div>
        <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalPendientes}</p>
          <p className="mt-1 font-display text-2xl font-bold text-cosecha">{totalPendientes}</p>
        </div>
        <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalAprobadas}</p>
          <p className="mt-1 font-display text-2xl font-bold text-montana">{totalAprobadas}</p>
        </div>
      </div>

      {/* Tabla de becarios */}
      {becarios.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.sinBecarios}</p>
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
              {becarios.map((b) => {
                const horas = horasPorBecario.get(b.id) ?? { pendientes: 0, aprobadas: 0 }
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
