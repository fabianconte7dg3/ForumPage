import { getPayload } from 'payload'

import { FormularioNecesidad } from '@/components/FormularioNecesidad'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Comunidad, Necesidade } from '@/payload-types'

// La cola pública cambia cada vez que el staff marca o desmarca una necesidad
// como visible, o avanza su estado — nunca estático.
export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Necesidades',
    descripcion:
      'Cada comunidad o escuela puede reportar una necesidad concreta. El staff la evalúa, la directiva la prioriza, y acá se puede seguir su avance.',
    colaTitulo: 'En seguimiento',
    colaVacia: 'Todavía no hay necesidades públicas en seguimiento.',
    reportarTitulo: 'Reportar una necesidad',
    prioridadBaja: 'Prioridad baja',
    prioridadMedia: 'Prioridad media',
    prioridadAlta: 'Prioridad alta',
  },
  en: {
    titulo: 'Needs',
    descripcion:
      'Any community or school can report a concrete need. Staff evaluates it, directiva prioritizes it, and its progress can be tracked here.',
    colaTitulo: 'Being tracked',
    colaVacia: 'No public needs being tracked yet.',
    reportarTitulo: 'Report a need',
    prioridadBaja: 'Low priority',
    prioridadMedia: 'Medium priority',
    prioridadAlta: 'High priority',
  },
} satisfies Record<Locale, Record<string, string>>

const PROGRESO_ESTADO: Record<Necesidade['estado'], number> = {
  aprobada: 60,
  completada: 100,
  en_ejecucion: 80,
  en_evaluacion: 40,
  recibida: 20,
}

export default async function NecesidadesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const PRIORIDAD_LABEL: Record<Necesidade['prioridad'], string> = {
    alta: t.prioridadAlta,
    baja: t.prioridadBaja,
    media: t.prioridadMedia,
  }

  const [necesidades, comunidades] = await Promise.all([
    payload.find({
      collection: 'necesidades',
      where: { visible_publicamente: { equals: true } },
      sort: '-createdAt',
      limit: 50,
      depth: 1,
      locale,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'comunidades',
      sort: 'nombre',
      limit: 200,
      locale,
      overrideAccess: true,
    }),
  ])

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-12 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 max-w-(--text-reading-width) font-lectura text-sm text-tinta/80">{t.descripcion}</p>
      </header>

      <section className="mb-16">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.colaTitulo}</h2>
        {necesidades.docs.length === 0 ? (
          <p className="font-lectura text-sm text-tinta/70">{t.colaVacia}</p>
        ) : (
          <ul className="space-y-4">
            {necesidades.docs.map((n) => {
              const comunidad = typeof n.comunidad === 'object' ? (n.comunidad as Comunidad) : undefined
              return (
                <li className="rounded-md border border-piedra/25 bg-white p-5" key={n.id}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-tinta">{n.titulo}</h3>
                    <span className="font-dato text-xs uppercase tracking-widest text-tinta/60">{PRIORIDAD_LABEL[n.prioridad]}</span>
                  </div>
                  {comunidad && <p className="mb-2 font-dato text-xs text-tinta/60">{comunidad.nombre}</p>}
                  {n.descripcion && <p className="mb-3 font-lectura text-sm text-tinta">{n.descripcion}</p>}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-piedra/15">
                    <div className="h-full bg-montana" style={{ width: `${PROGRESO_ESTADO[n.estado]}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-tinta">{t.reportarTitulo}</h2>
        <FormularioNecesidad
          comunidades={(comunidades.docs as Comunidad[]).map((c) => ({ id: c.id, nombre: c.nombre }))}
          locale={locale}
        />
      </section>
    </div>
  )
}
