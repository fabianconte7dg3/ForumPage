import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { QuizPractica } from '@/components/QuizPractica'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Practica } from '@/payload-types'

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    descargar: 'Descargar',
    enviar: 'Calificar',
    reintentar: 'Reintentar',
    aciertos: 'Aciertos',
    completadoAntes: 'Completado antes',
  },
  en: {
    descargar: 'Download',
    enviar: 'Grade',
    reintentar: 'Retry',
    aciertos: 'Score',
    completadoAntes: 'Completed before',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function PracticaPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const resultado = await payload.find({
    collection: 'practicas',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    locale,
    overrideAccess: true,
  })

  const practica = resultado.docs[0] as Practica | undefined
  if (!practica) notFound()

  const nivel = typeof practica.nivel === 'object' ? practica.nivel : undefined
  const materia = typeof practica.materia === 'object' ? practica.materia : undefined
  const archivo = typeof practica.archivo === 'object' ? practica.archivo : undefined

  // Solo lo publicable llega al cliente — respuesta_correcta y retroalimentacion
  // se quedan en el servidor hasta que se llame a la acción de calificar.
  const preguntasPublicas = (practica.preguntas ?? []).map((p) => ({
    enunciado: p.enunciado,
    opciones: (p.opciones ?? []).map((o) => o.texto),
  }))

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <div className="mb-4 flex flex-wrap gap-2 font-dato text-xs uppercase tracking-widest text-tinta/60">
          {nivel && <span className="rounded-sm border border-piedra/25 px-2 py-0.5">{nivel.nombre}</span>}
          {materia && <span className="rounded-sm border border-piedra/25 px-2 py-0.5">{materia.nombre}</span>}
        </div>
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{practica.titulo}</h1>
      </header>

      {practica.modalidad === 'descargable' && archivo?.url && (
        <a
          className="inline-block rounded-sm bg-montana px-6 py-2 font-dato text-xs uppercase tracking-widest text-white"
          href={archivo.url}
        >
          {t.descargar}
        </a>
      )}

      {(practica.modalidad === 'quiz_autocorregido' || practica.modalidad === 'quiz_con_progreso') && (
        <QuizPractica
          guardarProgreso={practica.modalidad === 'quiz_con_progreso'}
          locale={locale}
          practicaId={practica.id}
          preguntas={preguntasPublicas}
          textos={t}
        />
      )}
    </div>
  )
}
