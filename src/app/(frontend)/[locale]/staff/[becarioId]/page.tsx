import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { AccionesHora } from '@/components/AccionesHora'
import { defaultLocale, type Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Becario, Configuracion, HoraLaborSocial } from '@/payload-types'

export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    volver: '← Volver al panel',
    subtitulo: 'Expediente del Becario',
    titulo: 'Registro de Labor Social',
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
    // Ficha
    universidad: 'Universidad',
    carrera: 'Carrera',
    anio: 'Año',
    estadoBeca: 'Estado beca',
    estadoActivo: 'Activo',
    estadoSuspendido: 'Suspendido',
    estadoGraduado: 'Graduado',
    estadoRetornado: 'Retornado',
    estadoRetirado: 'Retirado',
  },
  en: {
    volver: '← Back to panel',
    subtitulo: 'Becario Record',
    titulo: 'Community Service Log',
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
    universidad: 'University',
    carrera: 'Major',
    anio: 'Year',
    estadoBeca: 'Scholarship',
    estadoActivo: 'Active',
    estadoSuspendido: 'Suspended',
    estadoGraduado: 'Graduated',
    estadoRetornado: 'Returned',
    estadoRetirado: 'Withdrawn',
  },
} as const

// SVG donut progress — puro servidor, sin JS del cliente.
function GraficoProgreso({ aprobadas, meta }: { aprobadas: number; meta: number }) {
  const porcentaje = meta > 0 ? Math.min(100, Math.round((aprobadas / meta) * 100)) : 0
  // Radio y circunferencia para el arco SVG
  const radio = 70
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia - (porcentaje / 100) * circunferencia

  return (
    <div className="flex flex-col items-center">
      <svg className="h-44 w-44" viewBox="0 0 180 180">
        {/* Track de fondo */}
        <circle
          className="text-piedra/15"
          cx="90" cy="90" r={radio}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
        />
        {/* Arco de progreso */}
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
        {/* Texto central */}
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
          / {meta} HORAS
        </text>
      </svg>
    </div>
  )
}

export default async function ExpedienteBecarioPage({
  params,
}: {
  params: Promise<{ locale: Locale; becarioId: string }>
}) {
  const { locale, becarioId } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    redirect(`/${locale}/portal`)
  }

  const payload = await getPayload({ config })
  const id = Number(becarioId)
  if (Number.isNaN(id)) notFound()

  let becario: Becario
  try {
    becario = await payload.findByID({ collection: 'becarios', id, overrideAccess: true }) as Becario
  } catch {
    notFound()
  }

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

  // Estado de cumplimiento
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

  const ESTADO_BECA_LABEL = {
    activo: t.estadoActivo,
    suspendido: t.estadoSuspendido,
    graduado: t.estadoGraduado,
    retornado: t.estadoRetornado,
    retirado: t.estadoRetirado,
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
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      {/* Navegación de regreso */}
      <Link
        className="mb-6 inline-block font-dato text-xs uppercase tracking-widest text-piedra transition-colors hover:text-montana"
        href={`/${locale}/staff`}
      >
        {t.volver}
      </Link>

      {/* Header */}
      <header className="mb-8 border-b border-piedra/25 pb-6">
        <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.subtitulo}</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase text-tinta md:text-3xl">{t.titulo}</h1>
        <p className="mt-2 font-display text-lg font-bold text-montana">{becario.nombre}</p>
        <div className="mt-2 flex flex-wrap gap-4 font-dato text-xs text-piedra">
          {becario.universidad && (
            <span><span className="uppercase tracking-widest">{t.universidad}:</span> {becario.universidad}</span>
          )}
          {becario.carrera && (
            <span><span className="uppercase tracking-widest">{t.carrera}:</span> {becario.carrera}</span>
          )}
          {becario.anio && (
            <span><span className="uppercase tracking-widest">{t.anio}:</span> {becario.anio}°</span>
          )}
          <span>
            <span className="uppercase tracking-widest">{t.estadoBeca}:</span>{' '}
            <span className={becario.estado === 'activo' ? 'text-montana' : 'text-cosecha'}>
              {ESTADO_BECA_LABEL[becario.estado]}
            </span>
          </span>
        </div>
      </header>

      {/* Sección superior: Gráfico + Tarjetas */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Gráfico circular */}
        <div className="flex flex-col items-center rounded-sm border border-piedra/25 bg-white px-6 py-6 md:col-span-4">
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-tinta">
            {locale === 'es' ? 'Progreso Total' : 'Total Progress'}
          </p>
          <GraficoProgreso aprobadas={aprobadas} meta={meta} />
          <p className="mt-3 text-center font-lectura text-xs text-tinta/70">{t.requisito}</p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="flex flex-col gap-4 md:col-span-8">
          {/* Estado Actual */}
          <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
            <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.estadoActualTitulo}</p>
            <p className={`mt-1 font-display text-lg font-bold ${estadoColor}`}>{estadoCumplimiento}</p>
            <p className="mt-1 font-lectura text-xs text-tinta/70">
              {t.metaMensaje75(restantes, meta)}
            </p>
          </div>

          {/* Horas en Revisión */}
          <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
            <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.horasEnRevisionTitulo}</p>
            <p className="mt-1 font-display text-lg font-bold text-cosecha">
              {pendientes} {t.horasMeta}
            </p>
            <p className="mt-1 font-lectura text-xs text-tinta/70">{t.horasEnRevisionDetalle}</p>
          </div>

          {/* Última Actividad */}
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

      {/* Lista de actividades */}
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
                    {/* Fecha y horas */}
                    <div className="w-24 shrink-0">
                      <p className="font-dato text-xs text-tinta/70">{formatearFecha(h.fecha, locale)}</p>
                      <p className="font-display text-sm font-bold text-tinta">{h.horas} {t.hrs}</p>
                    </div>
                    {/* Descripción */}
                    <div>
                      <p className="font-lectura text-sm text-tinta">{h.descripcion ?? '—'}</p>
                      {h.comentario && (
                        <p className="mt-1 font-lectura text-xs text-piedra italic">
                          {locale === 'es' ? 'Comentario:' : 'Comment:'} {h.comentario}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Badge de estado */}
                  <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${ESTADO_HORA_ICONO[h.estado]}`}>
                    {h.estado === 'aprobada' && (
                      <svg className="-mt-0.5 mr-1 inline h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {ESTADO_HORA_LABEL[h.estado]}
                  </span>
                </div>

                {/* Botones de acción solo para pendientes */}
                {h.estado === 'pendiente' && <AccionesHora horaId={h.id} locale={locale} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
