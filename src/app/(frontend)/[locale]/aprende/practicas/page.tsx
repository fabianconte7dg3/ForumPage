import Link from 'next/link'
import { getPayload } from 'payload'
import type { Where } from 'payload'

import { FiltrosBiblioteca } from '@/components/FiltrosBiblioteca'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Practica, Nivel, Materia } from '@/payload-types'

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Prácticas',
    subtitulo: 'Ejercicios de autoevaluación por nivel y materia.',
    modalidad: 'Modalidad',
    nivel: 'Nivel',
    materia: 'Materia',
    todos: 'Todas',
    resultados: (n: number) => `${n} práctica${n === 1 ? '' : 's'}`,
    vacio: 'Ninguna práctica coincide. Prueba con otro filtro.',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    modalidades: {
      descargable: 'Descargable',
      quiz_autocorregido: 'Quiz autocorregido',
      quiz_con_progreso: 'Quiz con progreso',
    } as Record<Practica['modalidad'], string>,
  },
  en: {
    titulo: 'Practice',
    subtitulo: 'Self-assessment exercises by level and subject.',
    modalidad: 'Mode',
    nivel: 'Level',
    materia: 'Subject',
    todos: 'All',
    resultados: (n: number) => `${n} practice${n === 1 ? '' : 's'}`,
    vacio: 'No practice matches. Try another filter.',
    anterior: 'Previous',
    siguiente: 'Next',
    modalidades: {
      descargable: 'Downloadable',
      quiz_autocorregido: 'Self-graded quiz',
      quiz_con_progreso: 'Quiz with progress',
    } as Record<Practica['modalidad'], string>,
  },
} satisfies Record<Locale, Record<string, unknown>>

const PAGE_SIZE = 12

export default async function PracticasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ modalidad?: string; nivel?: string; materia?: string; page?: string }>
}) {
  const { locale } = await params
  const filtros = await searchParams
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const where: Where = {}
  if (filtros.modalidad) where.modalidad = { equals: filtros.modalidad }
  if (filtros.nivel) where.nivel = { equals: Number(filtros.nivel) }
  if (filtros.materia) where.materia = { equals: Number(filtros.materia) }

  const pagina = Number(filtros.page) || 1

  const [niveles, materias, practicas] = await Promise.all([
    payload.find({ collection: 'niveles', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'materias', limit: 100, locale, overrideAccess: true }),
    payload.find({ collection: 'practicas', where, page: pagina, limit: PAGE_SIZE, depth: 1, locale, overrideAccess: true }),
  ])

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <aside className="md:col-span-3">
          <FiltrosBiblioteca
            materias={(materias.docs as Materia[]).map((m) => ({ value: String(m.id), label: m.nombre }))}
            niveles={(niveles.docs as Nivel[]).map((n) => ({ value: String(n.id), label: n.nombre }))}
            textos={{ tipo: t.modalidad, nivel: t.nivel, materia: t.materia, todos: t.todos }}
            tipos={Object.entries(t.modalidades).map(([value, label]) => ({ value, label }))}
          />
        </aside>

        <section className="md:col-span-9">
          <div className="mb-6 flex items-center justify-between border-l-2 border-cosecha pl-4">
            <span className="font-dato text-xs uppercase tracking-widest text-montana">
              {t.resultados(practicas.totalDocs)}
            </span>
          </div>

          {practicas.docs.length === 0 ? (
            <p className="font-lectura text-sm text-tinta/70">{t.vacio}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(practicas.docs as Practica[]).map((practica) => {
                const nivel = typeof practica.nivel === 'object' ? practica.nivel : undefined
                const materia = typeof practica.materia === 'object' ? practica.materia : undefined
                return (
                  <Link
                    className="block rounded-lg border border-piedra/25 bg-white p-5 hover:border-montana"
                    href={`/${locale}/aprende/practicas/${practica.slug}`}
                    key={practica.id}
                  >
                    <span className="rounded-sm border border-piedra/25 bg-niebla px-2 py-1 font-dato text-xs uppercase text-tinta">
                      {t.modalidades[practica.modalidad] ?? practica.modalidad}
                    </span>
                    <h3 className="mt-3 font-lectura text-base font-semibold text-tinta">{practica.titulo}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
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
                  </Link>
                )
              })}
            </div>
          )}

          {practicas.totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-4 font-dato text-xs text-piedra">
              {practicas.hasPrevPage && (
                <Link
                  className="hover:text-montana"
                  href={`?${new URLSearchParams({ ...filtros, page: String(pagina - 1) }).toString()}`}
                >
                  ← {t.anterior}
                </Link>
              )}
              <span className="text-tinta">
                {practicas.page} / {practicas.totalPages}
              </span>
              {practicas.hasNextPage && (
                <Link
                  className="hover:text-montana"
                  href={`?${new URLSearchParams({ ...filtros, page: String(pagina + 1) }).toString()}`}
                >
                  {t.siguiente} →
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}
