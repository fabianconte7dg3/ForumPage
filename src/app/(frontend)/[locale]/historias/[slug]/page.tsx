import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'
import { formatearFecha } from '@/lib/format'
import config from '@/payload.config'
import type { Actividad, Media } from '@/payload-types'

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    verComunidad: 'Ver comunidad',
    verProyecto: 'Ver proyecto relacionado',
  },
  en: {
    verComunidad: 'View community',
    verProyecto: 'View related project',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const resultado = await payload.find({
    collection: 'actividades',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    locale,
    overrideAccess: true,
  })

  const actividad = resultado.docs[0] as Actividad | undefined
  if (!actividad) notFound()

  const comunidad = typeof actividad.comunidad === 'object' ? actividad.comunidad : undefined
  const programa = typeof actividad.programa === 'object' ? actividad.programa : undefined
  const proyecto = typeof actividad.proyecto === 'object' ? actividad.proyecto : undefined
  const portada = typeof actividad.portada === 'object' ? actividad.portada : undefined
  const galeria = (actividad.galeria ?? []).filter((m): m is Media => typeof m === 'object')

  return (
    <main>
      {/* Portada full-width, con tope de altura — muchas de las fotos migradas
          son retratos verticales de celular; sin el tope, una vertical a
          ancho completo queda con una altura absurda (~1700px en pantallas
          normales). object-top prioriza la parte de arriba del recorte,
          donde suele estar la cara en un retrato. */}
      {portada?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={portada.alt ?? ''}
          className="block h-auto max-h-[520px] w-full object-cover object-top"
          src={portada.url}
        />
      )}

      {/* Contenido — contenedor más amplio que el ancho de lectura puro */}
      <article className="mx-auto w-full max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3 font-dato text-xs uppercase text-tinta/60">
            <span>{formatearFecha(actividad.fecha_publicacion, locale)}</span>
            {comunidad && <span className="rounded-sm border border-piedra/25 px-2 py-0.5">{comunidad.nombre}</span>}
            {programa && <span className="rounded-sm border border-piedra/25 px-2 py-0.5">{programa.nombre}</span>}
          </div>
          <h1 className="font-display text-2xl font-bold uppercase leading-tight text-montana md:text-4xl">
            {actividad.titulo}
          </h1>
        </header>

        {actividad.contenido && (
          <div className="font-lectura text-base leading-relaxed text-tinta [&>p]:mb-4">
            <RichText data={actividad.contenido} />
          </div>
        )}

        {galeria.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3">
            {galeria.map((media) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={media.alt ?? ''} className="aspect-4/3 w-full object-cover" key={media.id} src={media.url ?? ''} />
            ))}
          </div>
        )}

        <footer className="mt-12 flex flex-wrap gap-4 border-t border-piedra/25 pt-6 font-dato text-xs uppercase tracking-wider">
          {comunidad && (
            <Link className="text-rio hover:underline" href={`/${locale}/impacto/comunidades/${comunidad.slug}`}>
              {t.verComunidad} →
            </Link>
          )}
          {proyecto && (
            <Link className="text-rio hover:underline" href={`/${locale}/impacto/proyectos/${proyecto.slug}`}>
              {t.verProyecto} →
            </Link>
          )}
        </footer>
      </article>
    </main>
  )
}
