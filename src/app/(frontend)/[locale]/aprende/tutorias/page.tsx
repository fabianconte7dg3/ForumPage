import { getPayload } from 'payload'
import type { Where } from 'payload'

import { TutoriaCard } from '@/components/TutoriaCard'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Materia, Nivel, Sede, Tutoria } from '@/payload-types'

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Tutorías',
    subtitulo: 'Sesiones de apoyo académico, próximas primero.',
    materia: 'Materia',
    nivel: 'Nivel',
    sede: 'Sede',
    todas: 'Todas',
    aplicar: 'Aplicar filtros',
    resultados: (n: number) => `${n} tutoría${n === 1 ? '' : 's'}`,
    vacio: 'No hay tutorías programadas para este filtro.',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
  },
  en: {
    titulo: 'Tutoring',
    subtitulo: 'Academic support sessions, soonest first.',
    materia: 'Subject',
    nivel: 'Level',
    sede: 'Site',
    todas: 'All',
    aplicar: 'Apply filters',
    resultados: (n: number) => `${n} session${n === 1 ? '' : 's'}`,
    vacio: 'No tutoring sessions match this filter.',
    anterior: 'Previous',
    siguiente: 'Next',
  },
} satisfies Record<Locale, Record<string, unknown>>

const PAGE_SIZE = 9

export default async function TutoriasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ materia?: string; nivel?: string; sede?: string; page?: string }>
}) {
  const { locale } = await params
  const filtros = await searchParams
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const where: Where = { fecha_hora: { greater_than_equal: new Date().toISOString() } }
  if (filtros.materia) where.materia = { equals: Number(filtros.materia) }
  if (filtros.nivel) where.nivel = { equals: Number(filtros.nivel) }
  if (filtros.sede) where.sede = { equals: Number(filtros.sede) }

  const pagina = Number(filtros.page) || 1

  const [materias, niveles, sedes, tutorias] = await Promise.all([
    payload.find({ collection: 'materias', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'niveles', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'sedes', limit: 100, locale, overrideAccess: true }),
    payload.find({
      collection: 'tutorias',
      where,
      sort: 'fecha_hora',
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
          label={t.materia}
          name="materia"
          options={(materias.docs as Materia[]).map((m) => ({ value: String(m.id), label: m.nombre }))}
          todasLabel={t.todas}
          value={filtros.materia}
        />
        <FiltroSelect
          label={t.nivel}
          name="nivel"
          options={(niveles.docs as Nivel[]).map((n) => ({ value: String(n.id), label: n.nombre }))}
          todasLabel={t.todas}
          value={filtros.nivel}
        />
        <FiltroSelect
          label={t.sede}
          name="sede"
          options={(sedes.docs as Sede[]).map((s) => ({ value: String(s.id), label: s.nombre }))}
          todasLabel={t.todas}
          value={filtros.sede}
        />
        <button
          className="rounded-md bg-montana px-4 py-2 font-dato text-xs uppercase tracking-wider text-niebla hover:bg-montana-hover"
          type="submit"
        >
          {t.aplicar}
        </button>
      </form>

      <p className="mb-6 border-l-2 border-cosecha pl-4 font-dato text-xs uppercase tracking-widest text-montana">
        {t.resultados(tutorias.totalDocs)}
      </p>

      {tutorias.docs.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.vacio}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(tutorias.docs as Tutoria[]).map((tutoria) => (
            <TutoriaCard key={tutoria.id} locale={locale} tutoria={tutoria} />
          ))}
        </div>
      )}

      {tutorias.totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4 font-dato text-xs text-piedra">
          {tutorias.hasPrevPage && (
            <a className="hover:text-montana" href={`?${new URLSearchParams({ ...filtros, page: String(pagina - 1) }).toString()}`}>
              ← {t.anterior}
            </a>
          )}
          <span className="text-tinta">
            {tutorias.page} / {tutorias.totalPages}
          </span>
          {tutorias.hasNextPage && (
            <a className="hover:text-montana" href={`?${new URLSearchParams({ ...filtros, page: String(pagina + 1) }).toString()}`}>
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
