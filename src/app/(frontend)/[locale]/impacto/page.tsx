import { getPayload } from 'payload'

import { ImpactoMapLoader } from '@/components/ImpactoMapLoader'
import type { ComunidadFeature, SedeFeature } from '@/components/ImpactoMap'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Actividad, Comunidad, Programa, Proyecto, Sede } from '@/payload-types'

const ESTADOS = {
  es: { propuesto: 'Propuesto', aprobado: 'Aprobado', en_ejecucion: 'En ejecución', completado: 'Completado' },
  en: { propuesto: 'Proposed', aprobado: 'Approved', en_ejecucion: 'In progress', completado: 'Completed' },
} satisfies Record<Locale, Record<string, string>>

const TIPOS_SEDE = {
  es: { sede_principal: 'Sede principal', biblioteca: 'Biblioteca', centro: 'Centro' },
  en: { sede_principal: 'Main site', biblioteca: 'Library', centro: 'Center' },
} satisfies Record<Locale, Record<string, string>>

const TEXTOS = {
  es: {
    titulo: 'Mapa de Impacto',
    subtitulo: 'Comunidades y sedes donde trabaja la fundación en Coclé norte.',
    todos: 'Todos los programas',
    verFicha: 'Ver ficha completa →',
    statComunidades: 'Comunidades atendidas',
    statSedes: 'Sedes',
    statProyectosActivos: 'Proyectos activos',
    statObrasCompletadas: 'Obras completadas',
    statBecariosActivos: 'Becarios activos',
    statPaises: 'Países alcanzados',
    capas: 'Capas',
    capaComunidades: 'Comunidades',
    capaSedes: 'Sedes',
    lugares: 'Comunidades de Coclé',
    sinProyectos: 'Sin proyectos aún',
    proyectosEnComunidad: 'Proyectos en esta comunidad',
    actividadesEnComunidad: (n: number) => `${n} actividad${n === 1 ? '' : 'es'}`,
    avance: 'Avance',
    cerrar: 'Cerrar',
  },
  en: {
    titulo: 'Impact Map',
    subtitulo: 'Communities and sites where the foundation works in northern Coclé.',
    todos: 'All programs',
    verFicha: 'View full page →',
    statComunidades: 'Communities served',
    statSedes: 'Sites',
    statProyectosActivos: 'Active projects',
    statObrasCompletadas: 'Completed works',
    statBecariosActivos: 'Active scholars',
    statPaises: 'Countries reached',
    capas: 'Layers',
    capaComunidades: 'Communities',
    capaSedes: 'Sites',
    lugares: 'Coclé communities',
    sinProyectos: 'No projects yet',
    proyectosEnComunidad: 'Projects in this community',
    actividadesEnComunidad: (n: number) => `${n} activit${n === 1 ? 'y' : 'ies'}`,
    avance: 'Progress',
    cerrar: 'Close',
  },
} satisfies Record<Locale, Record<string, unknown>>

export default async function ImpactoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const estados = ESTADOS[locale] ?? ESTADOS[defaultLocale]
  const tiposSede = TIPOS_SEDE[locale] ?? TIPOS_SEDE[defaultLocale]
  const payload = await getPayload({ config })

  const [comunidades, sedes, proyectos, actividades, programas] = await Promise.all([
    payload.find({ collection: 'comunidades', limit: 200, locale, overrideAccess: true }),
    payload.find({ collection: 'sedes', limit: 200, depth: 1, locale, overrideAccess: true }),
    payload.find({ collection: 'proyectos', limit: 500, depth: 0, locale, overrideAccess: true }),
    payload.find({ collection: 'actividades', limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'programas', where: { activo: { equals: true } }, limit: 100, locale, overrideAccess: true }),
  ])

  const programasPorComunidad = new Map<number, Set<number>>()
  const proyectosPorComunidad = new Map<
    number,
    { id: number; titulo: string; slug: string; estadoLabel: string; avance: number }[]
  >()
  for (const proyecto of proyectos.docs as Proyecto[]) {
    const comunidadId = typeof proyecto.comunidad === 'object' ? proyecto.comunidad.id : proyecto.comunidad
    const programaId = typeof proyecto.programa === 'object' ? proyecto.programa?.id : proyecto.programa
    if (programaId) {
      const set = programasPorComunidad.get(comunidadId) ?? new Set<number>()
      set.add(programaId)
      programasPorComunidad.set(comunidadId, set)
    }
    const lista = proyectosPorComunidad.get(comunidadId) ?? []
    lista.push({
      id: proyecto.id,
      titulo: proyecto.titulo,
      slug: proyecto.slug ?? '',
      estadoLabel: estados[proyecto.estado] ?? proyecto.estado,
      avance: proyecto.avance ?? 0,
    })
    proyectosPorComunidad.set(comunidadId, lista)
  }

  const actividadesPorComunidad = new Map<number, number>()
  for (const actividad of actividades.docs as Actividad[]) {
    const comunidadId = typeof actividad.comunidad === 'object' ? actividad.comunidad?.id : actividad.comunidad
    if (!comunidadId) continue
    actividadesPorComunidad.set(comunidadId, (actividadesPorComunidad.get(comunidadId) ?? 0) + 1)
  }

  const comunidadesFeatures: ComunidadFeature[] = (comunidades.docs as Comunidad[])
    .filter((c) => c.coordenadas)
    .map((c) => {
      const proyectosComunidad = proyectosPorComunidad.get(c.id) ?? []
      const avanceProm =
        proyectosComunidad.length > 0
          ? Math.round(proyectosComunidad.reduce((suma, p) => suma + p.avance, 0) / proyectosComunidad.length)
          : null
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.coordenadas.lng, c.coordenadas.lat] },
        properties: {
          id: c.id,
          nombre: c.nombre,
          slug: c.slug ?? '',
          distrito: c.distrito,
          descripcion: c.descripcion ?? undefined,
          programas: Array.from(programasPorComunidad.get(c.id) ?? []),
          proyectos: proyectosComunidad,
          avanceProm,
          actividadesLabel: t.actividadesEnComunidad(actividadesPorComunidad.get(c.id) ?? 0),
        },
      }
    })

  const sedesFeatures: SedeFeature[] = (sedes.docs as Sede[])
    .filter((s) => s.coordenadas)
    .map((s) => {
      const comunidad = typeof s.comunidad === 'object' ? s.comunidad : undefined
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.coordenadas.lng, s.coordenadas.lat] },
        properties: {
          nombre: s.nombre,
          destacada: Boolean(s.destacada),
          tipoLabel: tiposSede[s.tipo] ?? s.tipo,
          horario: s.horario ?? undefined,
          comunidadNombre: comunidad?.nombre,
          comunidadSlug: comunidad?.slug ?? undefined,
        },
      }
    })

  const proyectosActivos = (proyectos.docs as Proyecto[]).filter(
    (p) => p.estado === 'en_ejecucion' || p.estado === 'aprobado',
  ).length
  const obrasCompletadas = (proyectos.docs as Proyecto[]).filter((p) => p.estado === 'completado').length

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <header className="mb-8 border-b border-piedra/25 pb-8">
        <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
        <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
      </header>

      <ImpactoMapLoader
        comunidades={comunidadesFeatures}
        locale={locale}
        maptilerKey={process.env.MAPTILER_KEY}
        programas={(programas.docs as Programa[]).map((p) => ({ id: p.id, nombre: p.nombre, color: p.color }))}
        sedes={sedesFeatures}
        stats={{
          comunidades: comunidadesFeatures.length,
          sedes: sedesFeatures.length,
          proyectosActivos,
          obrasCompletadas,
        }}
        textos={{
          todos: t.todos,
          verFicha: t.verFicha,
          statComunidades: t.statComunidades,
          statSedes: t.statSedes,
          statProyectosActivos: t.statProyectosActivos,
          statObrasCompletadas: t.statObrasCompletadas,
          statBecariosActivos: t.statBecariosActivos,
          statPaises: t.statPaises,
          capas: t.capas,
          capaComunidades: t.capaComunidades,
          capaSedes: t.capaSedes,
          lugares: t.lugares,
          sinProyectos: t.sinProyectos,
          proyectosEnComunidad: t.proyectosEnComunidad,
          avance: t.avance,
          cerrar: t.cerrar,
        }}
      />
    </div>
  )
}
