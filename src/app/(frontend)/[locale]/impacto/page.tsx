import { getPayload } from 'payload'

import { ImpactoMapLoader } from '@/components/ImpactoMapLoader'
import type { ComunidadFeature, SedeFeature } from '@/components/ImpactoMap'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Comunidad, Programa, Proyecto, Sede } from '@/payload-types'

const TEXTOS = {
  es: {
    titulo: 'Mapa de Impacto',
    subtitulo: 'Comunidades y sedes donde trabaja la fundación en Coclé norte.',
    todos: 'Todos los programas',
    verFicha: 'Ver ficha →',
    contador: (comunidades: number, sedes: number) => `${comunidades} comunidades · ${sedes} sedes`,
  },
  en: {
    titulo: 'Impact Map',
    subtitulo: 'Communities and sites where the foundation works in northern Coclé.',
    todos: 'All programs',
    verFicha: 'View page →',
    contador: (comunidades: number, sedes: number) => `${comunidades} communities · ${sedes} sites`,
  },
} satisfies Record<Locale, { titulo: string; subtitulo: string; todos: string; verFicha: string; contador: (c: number, s: number) => string }>

export default async function ImpactoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const payload = await getPayload({ config })

  const [comunidades, sedes, proyectos, programas] = await Promise.all([
    payload.find({ collection: 'comunidades', limit: 200, locale, overrideAccess: true }),
    payload.find({ collection: 'sedes', limit: 200, locale, overrideAccess: true }),
    payload.find({ collection: 'proyectos', limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'programas', where: { activo: { equals: true } }, limit: 100, locale, overrideAccess: true }),
  ])

  const programasPorComunidad = new Map<number, Set<number>>()
  for (const proyecto of proyectos.docs as Proyecto[]) {
    const comunidadId = typeof proyecto.comunidad === 'object' ? proyecto.comunidad.id : proyecto.comunidad
    const programaId = typeof proyecto.programa === 'object' ? proyecto.programa?.id : proyecto.programa
    if (!programaId) continue
    const set = programasPorComunidad.get(comunidadId) ?? new Set<number>()
    set.add(programaId)
    programasPorComunidad.set(comunidadId, set)
  }

  const comunidadesFeatures: ComunidadFeature[] = (comunidades.docs as Comunidad[])
    .filter((c) => c.coordenadas)
    .map((c) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.coordenadas.lng, c.coordenadas.lat] },
      properties: {
        id: c.id,
        nombre: c.nombre,
        slug: c.slug ?? '',
        programas: Array.from(programasPorComunidad.get(c.id) ?? []),
      },
    }))

  const sedesFeatures: SedeFeature[] = (sedes.docs as Sede[])
    .filter((s) => s.coordenadas)
    .map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.coordenadas.lng, s.coordenadas.lat] },
      properties: { nombre: s.nombre, destacada: Boolean(s.destacada) },
    }))

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      <p className="mb-6 border-l-2 border-cosecha pl-4 font-dato text-xs uppercase tracking-widest text-montana">
        {t.contador(comunidadesFeatures.length, sedesFeatures.length)}
      </p>

      <ImpactoMapLoader
        comunidades={comunidadesFeatures}
        locale={locale}
        maptilerKey={process.env.MAPTILER_KEY}
        programas={(programas.docs as Programa[]).map((p) => ({ id: p.id, nombre: p.nombre, color: p.color }))}
        sedes={sedesFeatures}
        textoTodos={t.todos}
        textoVerFicha={t.verFicha}
      />
    </div>
  )
}
