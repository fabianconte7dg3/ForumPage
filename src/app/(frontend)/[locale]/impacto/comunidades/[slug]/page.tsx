import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { ActividadCard } from '@/components/ActividadCard'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Actividad, Comunidad, Proyecto } from '@/payload-types'

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

const TEXTOS = {
  es: {
    proyectos: 'Proyectos en esta comunidad',
    sinProyectos: 'Todavía no hay proyectos registrados en esta comunidad.',
    actividades: 'Actividades recientes',
    sinActividades: 'Todavía no hay actividades registradas en esta comunidad.',
    avance: 'Avance',
  },
  en: {
    proyectos: 'Projects in this community',
    sinProyectos: 'No projects have been recorded in this community yet.',
    actividades: 'Recent activities',
    sinActividades: 'No activities have been recorded in this community yet.',
    avance: 'Progress',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function ComunidadPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const estados = ESTADOS[locale] ?? ESTADOS[defaultLocale]
  const payload = await getPayload({ config })

  const resultado = await payload.find({
    collection: 'comunidades',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    locale,
    overrideAccess: true,
  })

  const comunidad = resultado.docs[0] as Comunidad | undefined
  if (!comunidad) notFound()

  const foto = typeof comunidad.foto === 'object' ? comunidad.foto : undefined

  const [proyectos, actividades] = await Promise.all([
    payload.find({
      collection: 'proyectos',
      where: { comunidad: { equals: comunidad.id } },
      sort: '-fecha_inicio',
      limit: 20,
      locale,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'actividades',
      where: { comunidad: { equals: comunidad.id } },
      sort: '-fecha_publicacion',
      limit: 6,
      depth: 1,
      locale,
      overrideAccess: true,
    }),
  ])

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        {foto?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={foto.alt ?? ''} className="mb-6 aspect-16/9 w-full object-cover" src={foto.url} />
        )}
        <p className="font-dato text-xs uppercase tracking-widest text-tinta/60">
          {comunidad.distrito}
          {comunidad.corregimiento ? ` · ${comunidad.corregimiento}` : ''}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase text-montana md:text-4xl">
          {comunidad.nombre}
        </h1>
        {comunidad.descripcion && (
          <p className="mt-4 font-lectura text-lg text-tinta/70">{comunidad.descripcion}</p>
        )}
      </header>

      <section className="mb-12">
        <h2 className="mb-6 font-display text-xl font-bold uppercase text-montana">{t.proyectos}</h2>
        {proyectos.docs.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.sinProyectos}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(proyectos.docs as Proyecto[]).map((proyecto) => (
              <Link
                className="block rounded-md border border-piedra/25 p-4 hover:border-montana"
                href={`/${locale}/impacto/proyectos/${proyecto.slug}`}
                key={proyecto.id}
              >
                <p className="font-dato text-xs uppercase tracking-wider text-tinta/60">
                  {estados[proyecto.estado] ?? proyecto.estado}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-montana">{proyecto.titulo}</h3>
                <div className="mt-3 h-2 w-full rounded-full bg-piedra/15">
                  <div
                    className="h-2 rounded-full bg-cosecha"
                    style={{ width: `${proyecto.avance ?? 0}%` }}
                  />
                </div>
                <p className="mt-1 font-dato text-xs text-tinta/60">
                  {t.avance}: {proyecto.avance ?? 0}%
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

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

      <Link
        className="mt-12 inline-block font-dato text-xs uppercase tracking-wider text-rio hover:underline"
        href={`/${locale}/historias`}
      >
        ← {locale === 'es' ? 'Volver a Historias' : 'Back to Stories'}
      </Link>
    </div>
  )
}
