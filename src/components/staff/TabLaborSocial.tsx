import { getPayload } from 'payload'

import { AccionesHora } from '@/components/AccionesHora'
import { defaultLocale, type Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import config from '@/payload.config'
import type { Becario, Configuracion, HoraLaborSocial } from '@/payload-types'
import { BotonVerDocumento } from '@/components/staff/BotonVerDocumento'

const TEXTOS = {
  es: {
    // Gráfico
    horasMeta: 'horas',
    requisito: 'Requisito anual para mantenimiento de beca.',
    // Tarjetas
    estadoActualTitulo: 'Estado Actual',
    enCumplimiento: 'En Cumplimiento',
    deficiente: 'Deficiente',
    suspendido: 'Suspendido',
    metaMensaje75: (restantes: number, meta: number) =>
      `${Math.round((1 - restantes / meta) * 100)}% de la meta completada. Se requieren ${restantes} horas adicionales antes del 31 de Diciembre.`,
    horasEnRevisionTitulo: 'Horas en Revisión',
    horasEnRevisionDetalle: 'Actividades pendientes de validación por el coordinador del programa.',
    ultimaActividadTitulo: 'Última Actividad Registrada',
    reg: 'Reg:',
    // Lista
    actividadesTitulo: 'Actividades Registradas',
    verificado: 'Verificado',
    enRevision: 'En Revisión',
    rechazado: 'Rechazado',
    hrs: 'hrs',
    sinActividades: 'Este becario no tiene actividades registradas.',
  },
  en: {
    horasMeta: 'hours',
    requisito: 'Annual requirement for scholarship maintenance.',
    estadoActualTitulo: 'Current Status',
    enCumplimiento: 'In Compliance',
    deficiente: 'Deficient',
    suspendido: 'Suspended',
    metaMensaje75: (restantes: number, meta: number) =>
      `${Math.round((1 - restantes / meta) * 100)}% of goal completed. ${restantes} additional hours required before December 31.`,
    horasEnRevisionTitulo: 'Hours Under Review',
    horasEnRevisionDetalle: 'Activities pending validation by the program coordinator.',
    ultimaActividadTitulo: 'Last Registered Activity',
    reg: 'Reg:',
    actividadesTitulo: 'Registered Activities',
    verificado: 'Verified',
    enRevision: 'Under Review',
    rechazado: 'Rejected',
    hrs: 'hrs',
    sinActividades: 'This becario has no registered activities.',
  },
} as const

// SVG donut progress — puro servidor, sin JS del cliente.
function GraficoProgreso({ aprobadas, meta, locale }: { aprobadas: number; meta: number; locale: Locale }) {
  const porcentaje = meta > 0 ? Math.min(100, Math.round((aprobadas / meta) * 100)) : 0
  const radio = 70
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia - (porcentaje / 100) * circunferencia

  return (
    <div className="flex flex-col items-center">
      <svg className="h-44 w-44" viewBox="0 0 180 180">
        <circle
          className="text-piedra/15"
          cx="90" cy="90" r={radio}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
        />
        <circle
          className="text-montana"
          cx="90" cy="90" r={radio}
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${circunferencia}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          strokeWidth="12"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text
          className="fill-tinta font-display text-3xl font-bold"
          dominantBaseline="central"
          textAnchor="middle"
          x="90" y="85"
        >
          {aprobadas}
        </text>
        <text
          className="fill-piedra font-dato text-xs"
          dominantBaseline="central"
          textAnchor="middle"
          x="90" y="108"
        >
          / {meta} {locale === 'es' ? 'HORAS' : 'HOURS'}
        </text>
      </svg>
    </div>
  )
}

export async function TabLaborSocial({ becario, locale }: { becario: Becario; locale: Locale }) {
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })
  
  const configuracion = (await payload.findGlobal({ slug: 'configuracion', overrideAccess: true })) as Configuracion
  const meta = becario.meta_horas_personalizada ?? configuracion.meta_horas_labor_social

  const horas = (
    await payload.find({
      collection: 'horas-labor-social',
      where: { becario: { equals: becario.id } },
      sort: '-fecha',
      limit: 1000,
      overrideAccess: true,
    })
  ).docs as HoraLaborSocial[]

  const aprobadas = horas.filter((h) => h.estado === 'aprobada').reduce((acc, h) => acc + h.horas, 0)
  const pendientes = horas.filter((h) => h.estado === 'pendiente').reduce((acc, h) => acc + h.horas, 0)
  const restantes = Math.max(0, meta - aprobadas)
  const ultimaActividad = horas[0] ?? null

  const porcentaje = meta > 0 ? Math.round((aprobadas / meta) * 100) : 0
  let estadoCumplimiento: string
  let estadoColor: string
  if (becario.estado === 'suspendido') {
    estadoCumplimiento = t.suspendido
    estadoColor = 'text-cosecha'
  } else if (porcentaje >= 75) {
    estadoCumplimiento = t.enCumplimiento
    estadoColor = 'text-montana'
  } else {
    estadoCumplimiento = t.deficiente
    estadoColor = 'text-cosecha'
  }

  const ESTADO_HORA_LABEL: Record<HoraLaborSocial['estado'], string> = {
    aprobada: t.verificado,
    pendiente: t.enRevision,
    rechazada: t.rechazado,
  }

  const ESTADO_HORA_ICONO: Record<HoraLaborSocial['estado'], string> = {
    aprobada: 'border-montana/40 bg-montana/10 text-montana',
    pendiente: 'border-piedra/25 bg-niebla text-piedra',
    rechazada: 'border-cosecha bg-cosecha/10 text-cosecha',
  }

  return (
    <>
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-col items-center rounded-sm border border-piedra/25 bg-white px-6 py-6 md:col-span-4">
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-tinta">
            {locale === 'es' ? 'Progreso Total' : 'Total Progress'}
          </p>
          <GraficoProgreso aprobadas={aprobadas} meta={meta} locale={locale} />
          <p className="mt-3 text-center font-lectura text-xs text-tinta/70">{t.requisito}</p>
        </div>

        <div className="flex flex-col gap-4 md:col-span-8">
          <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
            <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.estadoActualTitulo}</p>
            <p className={`mt-1 font-display text-lg font-bold ${estadoColor}`}>{estadoCumplimiento}</p>
            <p className="mt-1 font-lectura text-xs text-tinta/70">
              {t.metaMensaje75(restantes, meta)}
            </p>
          </div>

          <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
            <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.horasEnRevisionTitulo}</p>
            <p className="mt-1 font-display text-lg font-bold text-cosecha">
              {pendientes} {t.horasMeta}
            </p>
            <p className="mt-1 font-lectura text-xs text-tinta/70">{t.horasEnRevisionDetalle}</p>
          </div>

          {ultimaActividad && (
            <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
              <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.ultimaActividadTitulo}</p>
              <p className="mt-1 font-display text-sm font-bold text-tinta">
                {ultimaActividad.descripcion ?? '—'}
              </p>
              <p className="mt-1 font-dato text-xs text-piedra">
                {t.reg} {formatearFecha(ultimaActividad.fecha, locale)} | {ultimaActividad.horas} {t.hrs}
              </p>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.actividadesTitulo}</h2>

        {horas.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.sinActividades}</p>
        ) : (
          <ul className="space-y-3">
            {horas.map((h) => (
              <li className="rounded-sm border border-piedra/25 bg-white px-5 py-4" key={h.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-24 shrink-0">
                      <p className="font-dato text-xs text-tinta/70">{formatearFecha(h.fecha, locale)}</p>
                      <p className="font-display text-sm font-bold text-tinta">{h.horas} {t.hrs}</p>
                    </div>
                    <div>
                      <p className="font-lectura text-sm text-tinta">{h.descripcion ?? '—'}</p>
                      {h.comentario && (
                        <p className="mt-1 font-lectura text-xs text-piedra italic">
                          {locale === 'es' ? 'Comentario:' : 'Comment:'} {h.comentario}
                        </p>
                      )}
                      
                      {h.evidencia && typeof h.evidencia === 'object' && h.evidencia.url && (
                        <div className="mt-3">
                          <BotonVerDocumento 
                            url={h.evidencia.url} 
                            locale={locale} 
                            label={locale === 'es' ? 'Ver Evidencia' : 'View Evidence'} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${ESTADO_HORA_ICONO[h.estado]}`}>
                    {h.estado === 'aprobada' && (
                      <svg className="-mt-0.5 mr-1 inline h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {ESTADO_HORA_LABEL[h.estado]}
                  </span>
                </div>

                {h.estado === 'pendiente' && <AccionesHora horaId={h.id} horasReportadas={h.horas} locale={locale} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
