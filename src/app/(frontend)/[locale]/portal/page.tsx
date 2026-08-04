import { getPayload } from 'payload'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { BotonCerrarSesion } from '@/components/BotonCerrarSesion'
import { BotonReportarHoras } from '@/components/BotonReportarHoras'
import { FormularioLogin } from '@/components/FormularioLogin'
import { defaultLocale, type Locale } from '@/i18n'
import { dentroDeVentana, formatearFecha } from '@/lib/format'
import { sesionActual } from '@/lib/auth'
import { materiasPendientes } from '@/lib/materias-pendientes'
import config from '@/payload.config'
import type { Becario, Configuracion, Desembolso, HoraLaborSocial, Recuperacion, RegistrosAcademico } from '@/payload-types'

// El progreso de horas y el aviso de suspensión dependen de datos que
// cambian todo el tiempo (aprobaciones del staff, reactivaciones) — nunca
// estático.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    tituloLogin: 'Portal del Becario',
    descripcionLogin: 'Iniciá sesión para ver tu progreso, tus desembolsos y tu expediente.',
    soloBecarios: 'Este portal es solo para becarios. Si sos staff, directiva o administrador, entrá por el panel.',
    irAlPanel: 'Ir al panel',
    hola: 'Hola',
    cerrarSesion: 'Cerrar sesión',
    seguridad: 'Seguridad',
    horasTitulo: 'Horas de labor social',
    horasDetalle: 'de',
    horasAprobadas: 'horas aprobadas',
    suspendidoTitulo: 'Tu beca está suspendida',
    materiasPendientesTitulo: 'Todavía te falta recuperar',
    reactivadoTitulo: '¡Tu beca fue reactivada!',
    reactivadoDetalle: 'Ya podés seguir usando tu beneficio con normalidad.',
    desembolsosTitulo: 'Desembolsos',
    desembolsosVacio: 'Todavía no hay desembolsos registrados.',
    estadoProgramado: 'Programado',
    estadoRetenido: 'Retenido',
    estadoPagado: 'Pagado',
    registroHorasTitulo: 'Tus reportes de labor social',
    registroHorasVacio: 'Todavía no has reportado ninguna hora. Usá el botón para registrar tu actividad.',
    horaEstadoPendiente: 'Pendiente',
    horaEstadoAprobada: 'Aprobada',
    horaEstadoRechazada: 'Rechazada',
    estadoCancelado: 'Cancelado',
  },
  en: {
    tituloLogin: 'Becario Portal',
    descripcionLogin: 'Log in to see your progress, disbursements, and record.',
    soloBecarios: 'This portal is for becarios only. Staff, directiva, and admin should use the panel.',
    irAlPanel: 'Go to the panel',
    hola: 'Hi',
    cerrarSesion: 'Log out',
    seguridad: 'Security',
    horasTitulo: 'Community service hours',
    horasDetalle: 'of',
    horasAprobadas: 'approved hours',
    suspendidoTitulo: 'Your scholarship is suspended',
    materiasPendientesTitulo: 'Still pending recovery',
    reactivadoTitulo: 'Your scholarship was reactivated!',
    reactivadoDetalle: 'You can keep using your benefit as usual.',
    desembolsosTitulo: 'Disbursements',
    desembolsosVacio: 'No disbursements recorded yet.',
    estadoProgramado: 'Scheduled',
    estadoRetenido: 'Withheld',
    estadoPagado: 'Paid',
    estadoCancelado: 'Cancelled',
    registroHorasTitulo: 'Your service hour reports',
    registroHorasVacio: 'You haven\'t reported any hours yet. Use the button to log your activity.',
    horaEstadoPendiente: 'Pending',
    horaEstadoAprobada: 'Approved',
    horaEstadoRechazada: 'Rejected',
  },
} satisfies Record<Locale, Record<string, string>>

const ESTILO_ESTADO: Record<Desembolso['estado'], string> = {
  cancelado: 'border-piedra/25 text-piedra line-through',
  pagado: 'border-montana/40 bg-montana/10 text-montana',
  programado: 'border-piedra/25 text-tinta',
  retenido: 'border-cosecha bg-cosecha/10 text-cosecha',
}

export default async function PortalPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario) {
    return (
      <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
        <header className="mb-8 border-b border-piedra/25 pb-8">
          <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.tituloLogin}</h1>
          <p className="mt-2 font-lectura text-sm text-tinta/80">{t.descripcionLogin}</p>
        </header>
        <FormularioLogin locale={locale} />
      </div>
    )
  }

  if (usuario.rol !== 'becario') {
    // Staff, admin y directiva van a su portal dedicado
    redirect(`/${locale}/staff`)
  }

  const payload = await getPayload({ config })
  const becarioId = typeof usuario.becario === 'object' ? usuario.becario?.id : usuario.becario
  const becario = becarioId ? ((await payload.findByID({ collection: 'becarios', id: becarioId, overrideAccess: true })) as Becario) : null
  const configuracion = (await payload.findGlobal({ slug: 'configuracion', overrideAccess: true })) as Configuracion

  // Lista en vivo, no una copia congelada de `motivo_suspension` al momento de
  // la suspensión — si el becario ya recuperó una de dos materias, acá deja
  // de aparecer esa aunque el texto viejo todavía la mencione.
  const pendientes =
    becario?.estado === 'suspendido'
      ? materiasPendientes(
          (
            await payload.find({
              collection: 'registros-academicos',
              where: { becario: { equals: becario.id }, estado_verificacion: { equals: 'verificado' } },
              limit: 1000,
              overrideAccess: true,
            })
          ).docs as RegistrosAcademico[],
          (
            await payload.find({
              collection: 'recuperaciones',
              where: { becario: { equals: becario.id }, estado: { equals: 'verificado' } },
              limit: 1000,
              overrideAccess: true,
            })
          ).docs as Recuperacion[],
        )
      : []

  const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000
  const reactivadoReciente =
    becario?.estado === 'activo' && !!becario.fecha_reactivacion && dentroDeVentana(becario.fecha_reactivacion, SIETE_DIAS_MS)

  const meta = becario?.meta_horas_personalizada ?? configuracion.meta_horas_labor_social
  const todasLasHoras = becario
    ? (
        await payload.find({
          collection: 'horas-labor-social',
          where: { becario: { equals: becario.id } },
          sort: '-fecha',
          limit: 1000,
          overrideAccess: true,
        })
      ).docs as HoraLaborSocial[]
    : []
  const horasAprobadas = todasLasHoras.filter((h) => h.estado === 'aprobada').reduce((acc, h) => acc + h.horas, 0)
  const progreso = meta > 0 ? Math.min(100, Math.round((horasAprobadas / meta) * 100)) : 0

  const desembolsos = becario
    ? (
        await payload.find({
          collection: 'desembolsos',
          where: { becario: { equals: becario.id } },
          sort: '-fecha_programada',
          limit: 100,
          overrideAccess: true,
        })
      ).docs
    : []
  const ESTADO_LABEL: Record<Desembolso['estado'], string> = {
    cancelado: t.estadoCancelado,
    pagado: t.estadoPagado,
    programado: t.estadoProgramado,
    retenido: t.estadoRetenido,
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 flex items-center justify-between border-b border-piedra/25 pb-8">
        <h1 className="font-display text-2xl font-bold uppercase text-montana md:text-3xl">
          {t.hola}, {becario?.nombre ?? usuario.email}
        </h1>
        <div className="flex items-center gap-4">
          <Link className="font-dato text-xs uppercase tracking-widest text-tinta/60 underline" href={`/${locale}/cuenta/seguridad`}>
            {t.seguridad}
          </Link>
          <BotonCerrarSesion locale={locale} texto={t.cerrarSesion} />
        </div>
      </header>

      {becario?.estado === 'suspendido' && (
        <div className="mb-8 rounded-md border border-cosecha bg-cosecha/10 p-5">
          <p className="font-display text-sm font-bold uppercase text-cosecha">{t.suspendidoTitulo}</p>
          {becario.motivo_suspension && <p className="mt-2 font-lectura text-sm text-tinta">{becario.motivo_suspension}</p>}
          {pendientes.length > 0 && (
            <p className="mt-2 font-lectura text-sm text-tinta">
              {t.materiasPendientesTitulo}: {pendientes.join(', ')}
            </p>
          )}
          {configuracion.texto_aviso_suspension && <p className="mt-2 font-lectura text-sm text-tinta">{configuracion.texto_aviso_suspension}</p>}
        </div>
      )}

      {reactivadoReciente && (
        <div className="mb-8 rounded-md border border-montana/40 bg-montana/10 p-5">
          <p className="font-display text-sm font-bold uppercase text-montana">{t.reactivadoTitulo}</p>
          <p className="mt-2 font-lectura text-sm text-tinta">{t.reactivadoDetalle}</p>
        </div>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.horasTitulo}</h2>
          <BotonReportarHoras locale={locale} />
        </div>
        <p className="mt-1 font-dato text-xs text-tinta/70">
          {horasAprobadas} {t.horasDetalle} {meta} {t.horasAprobadas}
        </p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-piedra/15">
          <div className="h-full bg-montana transition-[width]" style={{ width: `${progreso}%` }} />
        </div>

        {/* Lista de reportes del becario */}
        <h3 className="mt-6 font-display text-xs font-bold uppercase tracking-widest text-tinta">{t.registroHorasTitulo}</h3>
        {todasLasHoras.length === 0 ? (
          <p className="mt-2 font-lectura text-sm text-tinta/70">{t.registroHorasVacio}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {todasLasHoras.map((h) => {
              const ESTADO_HORA_LABEL: Record<HoraLaborSocial['estado'], string> = {
                aprobada: t.horaEstadoAprobada,
                pendiente: t.horaEstadoPendiente,
                rechazada: t.horaEstadoRechazada,
              }
              const ESTADO_HORA_ESTILO: Record<HoraLaborSocial['estado'], string> = {
                aprobada: 'border-montana/40 bg-montana/10 text-montana',
                pendiente: 'border-piedra/25 text-tinta',
                rechazada: 'border-cosecha bg-cosecha/10 text-cosecha',
              }
              return (
                <li className="rounded-md border border-piedra/25 bg-white px-4 py-3" key={h.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-dato text-xs text-tinta/70">{formatearFecha(h.fecha, locale)}</p>
                      {h.descripcion && <p className="font-lectura text-sm text-tinta">{h.descripcion}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-bold text-tinta">{h.horas}h</span>
                      <span className={`rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${ESTADO_HORA_ESTILO[h.estado]}`}>
                        {ESTADO_HORA_LABEL[h.estado]}
                      </span>
                    </div>
                  </div>
                  {h.comentario && (
                    <p className="mt-2 border-t border-piedra/15 pt-2 font-lectura text-xs text-tinta/70">
                      {h.comentario}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.desembolsosTitulo}</h2>
        {desembolsos.length === 0 ? (
          <p className="mt-2 font-lectura text-sm text-tinta/70">{t.desembolsosVacio}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {desembolsos.map((d) => (
              <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-piedra/25 bg-white px-4 py-3" key={d.id}>
                <div>
                  <p className="font-dato text-xs text-tinta/70">{formatearFecha(d.fecha_efectiva ?? d.fecha_programada, locale)}</p>
                  {d.concepto && <p className="font-lectura text-sm text-tinta">{d.concepto}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold text-tinta">
                    {d.monto.toLocaleString(locale === 'es' ? 'es-PA' : 'en-US', { currency: 'USD', style: 'currency' })}
                  </span>
                  <span className={`rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${ESTILO_ESTADO[d.estado]}`}>
                    {ESTADO_LABEL[d.estado]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
