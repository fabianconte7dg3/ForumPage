import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { ActividadCard } from '@/components/ActividadCard'
import { formatearFecha } from '@/lib/format'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Actividad, CentroEducativo, Programa, Proyecto } from '@/payload-types'

const ESTADOS = {
  es: {
    propuesto: 'Propuesto',
    aprobado: 'Aprobado',
    en_ejecucion: 'En ejecución',
    completado: 'Completado',
  },
  en: {
    propuesto: 'Proposed',
    aprobado: 'Approved',
    en_ejecucion: 'In progress',
    completado: 'Completed',
  },
} satisfies Record<Locale, Record<string, string>>

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    avance: 'Avance',
    inicio: 'Inicio',
    fin: 'Fin',
    monto: 'Monto invertido',
    antes: 'Antes',
    despues: 'Después',
    actividades: 'Actividades relacionadas',
    sinActividades: 'Todavía no hay actividades registradas para este proyecto.',
    volver: '← Volver a',
  },
  en: {
    avance: 'Progress',
    inicio: 'Start',
    fin: 'End',
    monto: 'Amount invested',
    antes: 'Before',
    despues: 'After',
    actividades: 'Related activities',
    sinActividades: 'No activities have been recorded for this project yet.',
    volver: '← Back to',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const estados = ESTADOS[locale] ?? ESTADOS[defaultLocale]
  const payload = await getPayload({ config })

  const resultado = await payload.find({
    collection: 'proyectos',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    locale,
    overrideAccess: true,
  })

  const proyecto = resultado.docs[0] as Proyecto | undefined
  if (!proyecto) notFound()

  const comunidad = typeof proyecto.comunidad === 'object' ? proyecto.comunidad : undefined
  const programa = typeof proyecto.programa === 'object' ? (proyecto.programa as Programa) : undefined
  const centroEducativo =
    typeof proyecto.centro_educativo === 'object' ? (proyecto.centro_educativo as CentroEducativo) : undefined
  const fotoAntes = typeof proyecto.foto_antes === 'object' ? proyecto.foto_antes : undefined
  const fotoDespues = typeof proyecto.foto_despues === 'object' ? proyecto.foto_despues : undefined

  const actividades = await payload.find({
    collection: 'actividades',
    where: { proyecto: { equals: proyecto.id } },
    sort: '-fecha_publicacion',
    limit: 6,
    depth: 1,
    locale,
    overrideAccess: true,
  })

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3 font-dato text-xs uppercase tracking-widest text-tinta/60">
          <span className="rounded-sm border border-piedra/25 px-2 py-0.5">
            {estados[proyecto.estado] ?? proyecto.estado}
          </span>
          {comunidad && (
            <Link className="hover:text-montana" href={`/${locale}/impacto/comunidades/${comunidad.slug}`}>
              {comunidad.nombre}
            </Link>
          )}
          {programa && <span>{programa.nombre}</span>}
          {centroEducativo && <span>{centroEducativo.nombre}</span>}
        </div>
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{proyecto.titulo}</h1>

        <div className="mt-6 h-2 w-full rounded-full bg-piedra/15">
          <div className="h-2 rounded-full bg-cosecha" style={{ width: `${proyecto.avance ?? 0}%` }} />
        </div>
        <p className="mt-1 font-dato text-xs text-tinta/60">
          {t.avance}: {proyecto.avance ?? 0}%
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 font-dato text-sm sm:grid-cols-4">
          {proyecto.fecha_inicio && (
            <div>
              <dt className="text-xs uppercase text-tinta/60">{t.inicio}</dt>
              <dd className="text-tinta">{formatearFecha(proyecto.fecha_inicio, locale)}</dd>
            </div>
          )}
          {proyecto.fecha_fin && (
            <div>
              <dt className="text-xs uppercase text-tinta/60">{t.fin}</dt>
              <dd className="text-tinta">{formatearFecha(proyecto.fecha_fin, locale)}</dd>
            </div>
          )}
          {typeof proyecto.monto === 'number' && (
            <div>
              <dt className="text-xs uppercase text-tinta/60">{t.monto}</dt>
              <dd className="text-tinta">${proyecto.monto.toLocaleString(locale === 'es' ? 'es-PA' : 'en-US')}</dd>
            </div>
          )}
        </dl>
      </header>

      {(fotoAntes?.url || fotoDespues?.url) && (
        <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fotoAntes?.url && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={fotoAntes.alt ?? ''} className="aspect-4/3 w-full object-cover" src={fotoAntes.url} />
              <figcaption className="mt-1 font-dato text-xs uppercase tracking-wider text-tinta/60">
                {t.antes}
              </figcaption>
            </figure>
          )}
          {fotoDespues?.url && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={fotoDespues.alt ?? ''} className="aspect-4/3 w-full object-cover" src={fotoDespues.url} />
              <figcaption className="mt-1 font-dato text-xs uppercase tracking-wider text-tinta/60">
                {t.despues}
              </figcaption>
            </figure>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-6 font-display text-xl font-bold uppercase text-montana">{t.actividades}</h2>
        {actividades.docs.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.sinActividades}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(actividades.docs as Actividad[]).map((actividad) => (
              <ActividadCard actividad={actividad} key={actividad.id} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {comunidad && (
        <Link
          className="mt-12 inline-block font-dato text-xs uppercase tracking-wider text-rio hover:underline"
          href={`/${locale}/impacto/comunidades/${comunidad.slug}`}
        >
          {t.volver} {comunidad.nombre}
        </Link>
      )}
    </div>
  )
}
