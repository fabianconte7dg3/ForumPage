import { getPayload } from 'payload'
import Link from 'next/link'

import { TutoriaCard } from '@/components/TutoriaCard'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Tutoria } from '@/payload-types'

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Centro de Aprendizaje',
    subtitulo: 'Recursos, tutorías y prácticas abiertas a toda la comunidad — sin necesidad de crear una cuenta.',
    biblioteca: 'Biblioteca',
    bibliotecaTexto: 'Guías, videos y enlaces por nivel y materia.',
    tutorias: 'Tutorías',
    tutoriasTexto: 'Sesiones de apoyo académico con fecha y sede.',
    practicas: 'Prácticas',
    practicasTexto: 'Ejercicios y quizzes de autoevaluación.',
    proximasTutorias: 'Próximas tutorías',
    verTodas: 'Ver todas →',
    sinTutorias: 'No hay tutorías programadas por ahora.',
  },
  en: {
    titulo: 'Learning Center',
    subtitulo: 'Resources, tutoring, and practice exercises open to the whole community — no account required.',
    biblioteca: 'Library',
    bibliotecaTexto: 'Guides, videos, and links by level and subject.',
    tutorias: 'Tutoring',
    tutoriasTexto: 'Academic support sessions with date and site.',
    practicas: 'Practice',
    practicasTexto: 'Self-assessment exercises and quizzes.',
    proximasTutorias: 'Upcoming tutoring',
    verTodas: 'View all →',
    sinTutorias: 'No tutoring sessions scheduled right now.',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function AprendePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const proximasTutorias = await payload.find({
    collection: 'tutorias',
    where: { fecha_hora: { greater_than_equal: new Date().toISOString() } },
    sort: 'fecha_hora',
    limit: 3,
    depth: 1,
    locale,
    overrideAccess: true,
  })

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AccesoCard href={`/${locale}/aprende/biblioteca`} texto={t.bibliotecaTexto} titulo={t.biblioteca} />
        <AccesoCard href={`/${locale}/aprende/tutorias`} texto={t.tutoriasTexto} titulo={t.tutorias} />
        <AccesoCard href={`/${locale}/aprende/practicas`} texto={t.practicasTexto} titulo={t.practicas} />
      </div>

      <section>
        <div className="mb-6 flex items-end justify-between border-b border-piedra/25 pb-4">
          <h2 className="font-display text-xl font-bold uppercase text-montana">{t.proximasTutorias}</h2>
          <Link className="font-dato text-xs uppercase text-tinta hover:text-montana" href={`/${locale}/aprende/tutorias`}>
            {t.verTodas}
          </Link>
        </div>

        {proximasTutorias.docs.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.sinTutorias}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(proximasTutorias.docs as Tutoria[]).map((tutoria) => (
              <TutoriaCard key={tutoria.id} locale={locale} tutoria={tutoria} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function AccesoCard({ href, texto, titulo }: { href: string; texto: string; titulo: string }) {
  return (
    <Link
      className="flex flex-col rounded-lg border border-piedra/25 bg-white p-6 transition-colors hover:border-montana/50"
      href={href}
    >
      <h3 className="font-display text-lg font-bold uppercase text-montana">{titulo}</h3>
      <p className="mt-2 font-lectura text-sm text-tinta/70">{texto}</p>
    </Link>
  )
}
