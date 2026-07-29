import { getPayload } from 'payload'
import type { Where } from 'payload'

import config from '@/payload.config'
import { defaultLocale, type Locale } from '@/i18n'
import type { Materia, Nivel, Recurso } from '@/payload-types'

const TEXTOS = {
  es: {
    titulo: 'Centro de Aprendizaje',
    subtitulo: 'Biblioteca de Recursos',
    tipo: 'Categoría',
    nivel: 'Nivel educativo',
    materia: 'Materia',
    todos: 'Todos',
    aplicar: 'Aplicar filtros',
    resultados: (n: number) => `${n} resultado${n === 1 ? '' : 's'}`,
    vacio: 'Ningún recurso coincide. Prueba con otro nivel o materia.',
    fuente: 'Fuente',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    tipos: {
      pdf_propio: 'PDF',
      enlace_externo: 'Enlace',
      video_youtube: 'Video',
      practica: 'Práctica',
    } as Record<Recurso['tipo'], string>,
  },
  en: {
    titulo: 'Learning Center',
    subtitulo: 'Resource Library',
    tipo: 'Category',
    nivel: 'Grade level',
    materia: 'Subject',
    todos: 'All',
    aplicar: 'Apply filters',
    resultados: (n: number) => `${n} result${n === 1 ? '' : 's'}`,
    vacio: 'No resource matches. Try another level or subject.',
    fuente: 'Source',
    anterior: 'Previous',
    siguiente: 'Next',
    tipos: {
      pdf_propio: 'PDF',
      enlace_externo: 'Link',
      video_youtube: 'Video',
      practica: 'Practice',
    } as Record<Recurso['tipo'], string>,
  },
} satisfies Record<Locale, Record<string, unknown>>

const PAGE_SIZE = 12

export default async function BibliotecaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ tipo?: string; nivel?: string; materia?: string; page?: string }>
}) {
  const { locale } = await params
  const filtros = await searchParams
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const where: Where = {}
  if (filtros.tipo) where.tipo = { equals: filtros.tipo }
  if (filtros.nivel) where.nivel = { equals: Number(filtros.nivel) }
  if (filtros.materia) where.materia = { equals: Number(filtros.materia) }

  const pagina = Number(filtros.page) || 1

  const [niveles, materias, recursos] = await Promise.all([
    payload.find({ collection: 'niveles', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'materias', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'recursos', where, page: pagina, limit: PAGE_SIZE, depth: 1, locale, overrideAccess: true }),
  ])

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <h2 className="mt-2 font-display text-lg text-tinta/70">{t.subtitulo}</h2>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <aside className="md:col-span-3">
          <form className="flex flex-col gap-6" method="get">
            <FiltroSelect
              label={t.tipo}
              name="tipo"
              options={Object.entries(t.tipos).map(([value, label]) => ({ value, label }))}
              todosLabel={t.todos}
              value={filtros.tipo}
            />
            <FiltroSelect
              label={t.nivel}
              name="nivel"
              options={(niveles.docs as Nivel[]).map((n) => ({ value: String(n.id), label: n.nombre }))}
              todosLabel={t.todos}
              value={filtros.nivel}
            />
            <FiltroSelect
              label={t.materia}
              name="materia"
              options={(materias.docs as Materia[]).map((m) => ({ value: String(m.id), label: m.nombre }))}
              todosLabel={t.todos}
              value={filtros.materia}
            />
            <button
              className="rounded-md bg-montana px-4 py-2 font-dato text-xs uppercase tracking-wider text-niebla hover:bg-montana-hover"
              type="submit"
            >
              {t.aplicar}
            </button>
          </form>
        </aside>

        <section className="md:col-span-9">
          <div className="mb-6 flex items-center justify-between border-l-2 border-cosecha pl-4">
            <span className="font-dato text-xs uppercase tracking-widest text-montana">
              {t.resultados(recursos.totalDocs)}
            </span>
          </div>

          {recursos.docs.length === 0 ? (
            <p className="font-lectura text-sm text-tinta/70">{t.vacio}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(recursos.docs as Recurso[]).map((recurso) => (
                <RecursoCard key={recurso.id} recurso={recurso} textoFuente={t.fuente} tipos={t.tipos} />
              ))}
            </div>
          )}

          {recursos.totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-4 font-dato text-xs text-piedra">
              {recursos.hasPrevPage && (
                <a
                  className="hover:text-montana"
                  href={`?${new URLSearchParams({ ...filtros, page: String(pagina - 1) }).toString()}`}
                >
                  ← {t.anterior}
                </a>
              )}
              <span className="text-tinta">
                {recursos.page} / {recursos.totalPages}
              </span>
              {recursos.hasNextPage && (
                <a
                  className="hover:text-montana"
                  href={`?${new URLSearchParams({ ...filtros, page: String(pagina + 1) }).toString()}`}
                >
                  {t.siguiente} →
                </a>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}

function FiltroSelect({
  label,
  name,
  options,
  todosLabel,
  value,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
  todosLabel: string
  value?: string
}) {
  return (
    <div>
      <label className="mb-2 block font-dato text-xs uppercase tracking-wider text-tinta/60" htmlFor={name}>
        {label}
      </label>
      <select
        className="w-full rounded-md border border-piedra/25 bg-white px-3 py-2 font-lectura text-sm text-tinta"
        defaultValue={value ?? ''}
        id={name}
        name={name}
      >
        <option value="">{todosLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function RecursoCard({
  recurso,
  textoFuente,
  tipos,
}: {
  recurso: Recurso
  textoFuente: string
  tipos: Record<Recurso['tipo'], string>
}) {
  const nivel = typeof recurso.nivel === 'object' ? recurso.nivel : undefined
  const materia = typeof recurso.materia === 'object' ? recurso.materia : undefined
  const href = recurso.tipo === 'pdf_propio' && typeof recurso.archivo === 'object' ? recurso.archivo?.url : recurso.url

  return (
    <a
      className="flex flex-col justify-between rounded-lg border border-piedra/25 bg-white p-5 transition-colors hover:border-montana/50"
      href={href ?? '#'}
      rel={href ? 'noopener noreferrer' : undefined}
      target={href ? '_blank' : undefined}
    >
      <div>
        <div className="mb-3 flex items-start justify-between">
          <span className="rounded-sm border border-piedra/25 bg-niebla px-2 py-1 font-dato text-xs uppercase text-tinta">
            {tipos[recurso.tipo]}
          </span>
        </div>
        <h3 className="mb-2 font-lectura text-base font-semibold leading-tight text-tinta">{recurso.titulo}</h3>
      </div>
      <div className="mt-4 border-t border-piedra/25 pt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {nivel && (
            <span className="rounded-sm border border-piedra/25 px-2 py-0.5 font-dato text-[10px] uppercase text-tinta">
              {nivel.nombre}
            </span>
          )}
          {materia && (
            <span className="rounded-sm border border-piedra/25 px-2 py-0.5 font-dato text-[10px] uppercase text-tinta">
              {materia.nombre}
            </span>
          )}
        </div>
        <div className="truncate font-dato text-[10px] uppercase text-piedra">
          {textoFuente}: {recurso.fuente_y_licencia}
        </div>
      </div>
    </a>
  )
}
