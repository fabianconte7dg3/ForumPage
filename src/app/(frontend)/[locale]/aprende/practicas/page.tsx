import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Practica } from '@/payload-types'

const MODALIDADES = {
  es: {
    descargable: 'Descargable',
    quiz_autocorregido: 'Quiz autocorregido',
    quiz_con_progreso: 'Quiz con progreso',
  },
  en: {
    descargable: 'Downloadable',
    quiz_autocorregido: 'Self-graded quiz',
    quiz_con_progreso: 'Quiz with progress',
  },
} satisfies Record<Locale, Record<string, string>>

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Prácticas',
    subtitulo: 'Ejercicios de autoevaluación por nivel y materia.',
    vacio: 'Todavía no hay prácticas publicadas.',
  },
  en: {
    titulo: 'Practice',
    subtitulo: 'Self-assessment exercises by level and subject.',
    vacio: 'No practice exercises published yet.',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function PracticasPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const modalidades = MODALIDADES[locale] ?? MODALIDADES[defaultLocale]
  const payload = await getPayload({ config })

  const practicas = await payload.find({ collection: 'practicas', limit: 100, depth: 1, locale, overrideAccess: true })

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      {practicas.docs.length === 0 ? (
        <p className="font-lectura text-sm text-tinta/70">{t.vacio}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(practicas.docs as Practica[]).map((practica) => {
            const nivel = typeof practica.nivel === 'object' ? practica.nivel : undefined
            const materia = typeof practica.materia === 'object' ? practica.materia : undefined
            return (
              <div className="rounded-lg border border-piedra/25 bg-white p-5" key={practica.id}>
                <span className="rounded-sm border border-piedra/25 bg-niebla px-2 py-1 font-dato text-xs uppercase text-tinta">
                  {modalidades[practica.modalidad] ?? practica.modalidad}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
