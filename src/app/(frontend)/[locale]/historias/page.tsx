import { getPayload } from 'payload'
import type { Where } from 'payload'

import { ActividadCard } from '@/components/ActividadCard'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Actividad, Comunidad, Programa } from '@/payload-types'

const TEXTOS = {
  es: {
    titulo: 'Historias',
    subtitulo: 'El mural de actividades de la fundación.',
    comunidad: 'Comunidad',
    programa: 'Programa',
    todas: 'Todas',
    aplicar: 'Aplicar filtros',
    resultados: (n: number) => `${n} actividad${n === 1 ? '' : 'es'}`,
    vacio: 'No hay actividades para este filtro.',
    verTodas: 'Ver todas las actividades',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
  },
  en: {
    titulo: 'Stories',
    subtitulo: "The foundation's activity mural.",
    comunidad: 'Community',
    programa: 'Program',
    todas: 'All',
    aplicar: 'Apply filters',
    resultados: (n: number) => `${n} activit${n === 1 ? 'y' : 'ies'}`,
    vacio: 'No activities match this filter.',
    verTodas: 'View all activities',
    anterior: 'Previous',
    siguiente: 'Next',
  },
} satisfies Record<Locale, Record<string, unknown>>

const PAGE_SIZE = 9

export default async function HistoriasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ comunidad?: string; programa?: string; page?: string }>
}) {
  const { locale } = await params
  const filtros = await searchParams
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const where: Where = {}
  if (filtros.comunidad) where.comunidad = { equals: Number(filtros.comunidad) }
  if (filtros.programa) where.programa = { equals: Number(filtros.programa) }

  const pagina = Number(filtros.page) || 1

  const [comunidades, programas, actividades] = await Promise.all([
    payload.find({ collection: 'comunidades', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'programas', limit: 100, locale, overrideAccess: true }),
    payload.find({
      collection: 'actividades',
      where,
      sort: '-fecha_publicacion',
      page: pagina,
      limit: PAGE_SIZE,
      depth: 1,
      locale,
      overrideAccess: true,
    }),
  ])

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      <form className="mb-8 flex flex-wrap items-end gap-4" method="get">
        <FiltroSelect
          label={t.comunidad}
          name="comunidad"
          options={(comunidades.docs as Comunidad[]).map((c) => ({ value: String(c.id), label: c.nombre }))}
          todasLabel={t.todas}
          value={filtros.comunidad}
        />
        <FiltroSelect
          label={t.programa}
          name="programa"
          options={(programas.docs as Programa[]).map((p) => ({ value: String(p.id), label: p.nombre }))}
          todasLabel={t.todas}
          value={filtros.programa}
        />
        <button
          className="rounded-md bg-montana px-4 py-2 font-dato text-xs uppercase tracking-wider text-niebla hover:bg-montana-hover"
          type="submit"
        >
          {t.aplicar}
        </button>
      </form>

      <p className="mb-6 border-l-2 border-cosecha pl-4 font-dato text-xs uppercase tracking-widest text-montana">
        {t.resultados(actividades.totalDocs)}
      </p>

      {actividades.docs.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">
          {t.vacio}{' '}
          <a className="text-rio hover:underline" href={`/${locale}/historias`}>
            {t.verTodas}
          </a>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(actividades.docs as Actividad[]).map((actividad) => (
            <ActividadCard actividad={actividad} key={actividad.id} locale={locale} />
          ))}
        </div>
      )}

      {actividades.totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4 font-dato text-xs text-piedra">
          {actividades.hasPrevPage && (
            <a
              className="hover:text-montana"
              href={`?${new URLSearchParams({ ...filtros, page: String(pagina - 1) }).toString()}`}
            >
              ← {t.anterior}
            </a>
          )}
          <span className="text-tinta">
            {actividades.page} / {actividades.totalPages}
          </span>
          {actividades.hasNextPage && (
            <a
              className="hover:text-montana"
              href={`?${new URLSearchParams({ ...filtros, page: String(pagina + 1) }).toString()}`}
            >
              {t.siguiente} →
            </a>
          )}
        </nav>
      )}
    </div>
  )
}

function FiltroSelect({
  label,
  name,
  options,
  todasLabel,
  value,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
  todasLabel: string
  value?: string
}) {
  return (
    <div>
      <label className="mb-2 block font-dato text-xs uppercase tracking-wider text-tinta/60" htmlFor={name}>
        {label}
      </label>
      <select
        className="rounded-md border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta"
        defaultValue={value ?? ''}
        id={name}
        name={name}
      >
        <option value="">{todasLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
