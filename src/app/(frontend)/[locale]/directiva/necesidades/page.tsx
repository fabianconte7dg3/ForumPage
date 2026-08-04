import Link from 'next/link'
import { getPayload } from 'payload'

import { AccionesNecesidad } from '@/components/staff/AccionesNecesidad'
import { defaultLocale, type Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Comunidad, Necesidade } from '@/payload-types'

// Igual que el panel del becario: la cola cambia cada vez que el staff avanza
// un caso — nunca estático.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Cola de necesidades',
    descripcion: 'Lo que se está dejando de atender, ordenado por prioridad. Solo staff, directiva y administración.',
    sinSesion: 'Iniciá sesión desde el panel de administración para ver esto.',
    irAlPanel: 'Ir al panel',
    prioridadAlta: 'Prioridad alta',
    prioridadMedia: 'Prioridad media',
    prioridadBaja: 'Prioridad baja',
    vacio: 'No hay casos en esta prioridad.',
    solicitante: 'Reportado por',
    costoEstimado: 'Costo estimado',
    completadasTitulo: 'Completadas recientemente',
    completadasVacio: 'Todavía no hay casos completados.',
    estadoRecibida: 'Recibida',
    estadoEnEvaluacion: 'En evaluación',
    estadoAprobada: 'Aprobada',
    estadoEnEjecucion: 'En ejecución',
    estadoCompletada: 'Completada',
  },
  en: {
    titulo: 'Needs queue',
    descripcion: 'What is being neglected, sorted by priority. Staff, directiva, and admin only.',
    sinSesion: 'Log in from the admin panel to see this.',
    irAlPanel: 'Go to the panel',
    prioridadAlta: 'High priority',
    prioridadMedia: 'Medium priority',
    prioridadBaja: 'Low priority',
    vacio: 'No cases at this priority.',
    solicitante: 'Reported by',
    costoEstimado: 'Estimated cost',
    completadasTitulo: 'Recently completed',
    completadasVacio: 'No completed cases yet.',
    estadoRecibida: 'Received',
    estadoEnEvaluacion: 'Under review',
    estadoAprobada: 'Approved',
    estadoEnEjecucion: 'In progress',
    estadoCompletada: 'Completed',
  },
} satisfies Record<Locale, Record<string, string>>

const ESTILO_ESTADO: Record<Necesidade['estado'], string> = {
  aprobada: 'border-rio/40 bg-rio/10 text-rio',
  completada: 'border-piedra/25 text-piedra',
  en_ejecucion: 'border-montana/40 bg-montana/10 text-montana',
  en_evaluacion: 'border-cosecha bg-cosecha/10 text-cosecha',
  recibida: 'border-piedra/25 text-tinta',
}

export default async function ColaNecesidadesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario || usuario.rol === 'becario') {
    return (
      <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
        <p className="font-lectura text-sm text-tinta">{t.sinSesion}</p>
        <Link className="mt-4 inline-block rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white" href="/admin">
          {t.irAlPanel}
        </Link>
      </div>
    )
  }

  const ESTADO_LABEL: Record<Necesidade['estado'], string> = {
    aprobada: t.estadoAprobada,
    completada: t.estadoCompletada,
    en_ejecucion: t.estadoEnEjecucion,
    en_evaluacion: t.estadoEnEvaluacion,
    recibida: t.estadoRecibida,
  }

  const payload = await getPayload({ config })
  const puedeGestionar = usuario.rol === 'staff' || usuario.rol === 'admin'

  const [activas, completadas, proyectosRes] = await Promise.all([
    payload.find({
      collection: 'necesidades',
      where: { estado: { not_equals: 'completada' } },
      sort: ['prioridad_orden', 'createdAt'],
      limit: 200,
      depth: 1,
      locale,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'necesidades',
      where: { estado: { equals: 'completada' } },
      sort: '-updatedAt',
      limit: 20,
      depth: 1,
      locale,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'proyectos',
      limit: 200,
      sort: 'titulo',
      locale,
      overrideAccess: true,
    }),
  ])
  const proyectos = proyectosRes.docs.map((p) => ({ id: p.id, titulo: p.titulo }))

  const grupos: { clave: Necesidade['prioridad']; titulo: string }[] = [
    { clave: 'alta', titulo: t.prioridadAlta },
    { clave: 'media', titulo: t.prioridadMedia },
    { clave: 'baja', titulo: t.prioridadBaja },
  ]

  function tarjeta(n: Necesidade) {
    const comunidad = typeof n.comunidad === 'object' ? (n.comunidad as Comunidad) : undefined
    return (
      <li className="rounded-md border border-piedra/25 bg-white p-5" key={n.id}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold text-tinta">{n.titulo}</h3>
          <span className={`rounded-sm border px-2 py-0.5 font-dato text-xs uppercase tracking-widest ${ESTILO_ESTADO[n.estado]}`}>
            {ESTADO_LABEL[n.estado]}
          </span>
        </div>
        <p className="mb-1 font-dato text-xs text-tinta/60">
          {comunidad?.nombre}
          {n.solicitante ? ` · ${t.solicitante}: ${n.solicitante}` : ''}
        </p>
        {n.descripcion && <p className="mb-2 font-lectura text-sm text-tinta">{n.descripcion}</p>}
        <p className="font-dato text-xs text-tinta/60">
          {formatearFecha(n.createdAt, locale)}
          {n.costo_estimado ? ` · ${t.costoEstimado}: ${n.costo_estimado.toLocaleString(locale === 'es' ? 'es-PA' : 'en-US', { currency: 'USD', style: 'currency' })}` : ''}
        </p>
        {puedeGestionar && <AccionesNecesidad locale={locale} necesidad={n} proyectos={proyectos} />}
      </li>
    )
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 flex flex-wrap items-start justify-between gap-4 border-b border-piedra/25 pb-8">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
          <p className="mt-2 max-w-(--text-reading-width) font-lectura text-sm text-tinta/80">{t.descripcion}</p>
        </div>
        {usuario.rol === 'directiva' || usuario.rol === 'admin' ? (
          <Link
            className="font-dato text-xs uppercase tracking-widest text-piedra transition-colors hover:text-montana"
            href={`/${locale}/directiva/auditoria`}
          >
            Registro de auditoría →
          </Link>
        ) : null}
      </header>

      {grupos.map((grupo) => {
        const casos = activas.docs.filter((n) => n.prioridad === grupo.clave)
        return (
          <section className="mb-12" key={grupo.clave}>
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-tinta">{grupo.titulo}</h2>
            {casos.length === 0 ? (
              <p className="font-lectura text-sm text-tinta/70">{t.vacio}</p>
            ) : (
              <ul className="space-y-4">{casos.map(tarjeta)}</ul>
            )}
          </section>
        )
      })}

      <section>
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.completadasTitulo}</h2>
        {completadas.docs.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.completadasVacio}</p>
        ) : (
          <ul className="space-y-4">{completadas.docs.map(tarjeta)}</ul>
        )}
      </section>
    </div>
  )
}
