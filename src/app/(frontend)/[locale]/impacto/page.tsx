import { getPayload } from 'payload'

import { ImpactoMapLoader } from '@/components/ImpactoMapLoader'
import { ImpactoTabs } from '@/components/ImpactoTabs'
import type { ProyectoActivo, DestinoEstudio, BecarioDestacado } from '@/components/ImpactoOverview'
import type { ComunidadFeature, SedeFeature } from '@/components/ImpactoMap'
import { defaultLocale, type Locale } from '@/i18n'
import config from '@/payload.config'
import type { Actividad, Becario, Comunidad, Programa, Proyecto, Sede } from '@/payload-types'

const ESTADOS = {
  es: { propuesto: 'Propuesto', aprobado: 'Aprobado', en_ejecucion: 'En ejecución', completado: 'Completado' },
  en: { propuesto: 'Proposed', aprobado: 'Approved', en_ejecucion: 'In progress', completado: 'Completed' },
} satisfies Record<Locale, Record<string, string>>

const TIPOS_SEDE = {
  es: { sede_principal: 'Sede principal', biblioteca: 'Biblioteca', centro: 'Centro' },
  en: { sede_principal: 'Main site', biblioteca: 'Library', centro: 'Center' },
} satisfies Record<Locale, Record<string, string>>

// Sin esto, Next intenta pre-renderizar la página en build time y necesita
// Postgres alcanzable ahí mismo — el contenido de Payload cambia entre
// despliegues, así que siempre se renderiza por request.
export const dynamic = 'force-dynamic'

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
    tabMap: 'Mapa',
    tabOverview: 'Resumen',
    scholarOfTheTerm: 'Becario Destacado',
    classOf: 'Clase de',
    openHerStory: 'Abrir su historia en el mapa',
    scholarsSupported: 'Becarios Apoyados',
    allFromCocle: 'Todos de Coclé',
    activeScholarships: 'Becas Activas',
    thisAcademicYear: 'Este año académico',
    projectsInCocle: 'Proyectos en Coclé',
    currentlyTracked: 'En seguimiento actual',
    studyingInPanama: 'Estudiando en Panamá',
    outsideCocle: 'Fuera de Coclé',
    studyingAbroad: 'Estudiando en el Extranjero',
    inXCountries: (n: number) => `En ${n} país${n === 1 ? '' : 'es'}`,
    projectsInFlight: 'Proyectos en ejecución — Coclé',
    project: 'Proyecto',
    community: 'Comunidad',
    progress: 'Progreso',
    whereScholarsStudy: 'Dónde estudian los becarios de Coclé',
    place: 'Lugar',
    institutions: 'Instituciones',
    scholars: 'Becarios',
    abroad: 'Extranjero',
    atHome: 'Panamá',
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
    tabMap: 'Map',
    tabOverview: 'Overview',
    scholarOfTheTerm: 'Scholar of the Term',
    classOf: 'Class of',
    openHerStory: 'Open her story on the map',
    scholarsSupported: 'Scholars Supported',
    allFromCocle: 'All from Coclé',
    activeScholarships: 'Active Scholarships',
    thisAcademicYear: 'This academic year',
    projectsInCocle: 'Projects in Coclé',
    currentlyTracked: 'Currently tracked',
    studyingInPanama: 'Studying in Panama',
    outsideCocle: 'Outside Coclé',
    studyingAbroad: 'Studying Abroad',
    inXCountries: (n: number) => `In ${n} countr${n === 1 ? 'y' : 'ies'}`,
    projectsInFlight: 'Projects in flight — Coclé',
    project: 'Project',
    community: 'Community',
    progress: 'Progress',
    whereScholarsStudy: 'Where Coclé scholars study',
    place: 'Place',
    institutions: 'Institutions',
    scholars: 'Scholars',
    abroad: 'Abroad',
    atHome: 'Panama',
  },
} satisfies Record<Locale, Record<string, unknown>>

export default async function ImpactoPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const estados = ESTADOS[locale] ?? ESTADOS[defaultLocale]
  const tiposSede = TIPOS_SEDE[locale] ?? TIPOS_SEDE[defaultLocale]
  const payload = await getPayload({ config })

  const [comunidades, sedes, proyectos, actividades, programas, becariosActivosTodos, becariosTotalesRes] = await Promise.all([
    payload.find({ collection: 'comunidades', limit: 200, locale, overrideAccess: true }),
    payload.find({ collection: 'sedes', limit: 200, depth: 1, locale, overrideAccess: true }),
    payload.find({ collection: 'proyectos', limit: 500, depth: 0, locale, overrideAccess: true }),
    payload.find({ collection: 'actividades', limit: 500, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'programas', where: { activo: { equals: true } }, limit: 100, locale, overrideAccess: true }),
    payload.find({
      collection: 'becarios',
      where: { estado: { equals: 'activo' } },
      limit: 500,
      depth: 1,
      overrideAccess: true,
    }),
    payload.count({ collection: 'becarios', overrideAccess: true }),
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
    .filter((c) => c.coordenadas && c.nombre !== 'Sin clasificar')
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

  const becariosDocsActivos = becariosActivosTodos.docs as Becario[]

  // flatMap en vez de filter().map(): el guard adentro del callback sí estrecha
  // `comunidad` (number | Comunidad) y las coordenadas opcionales — con
  // filter() por separado TypeScript no arrastra el narrowing al map().
  const becariosFeatures = becariosDocsActivos.flatMap((b) => {
    if (!b.mostrar_en_mapa || b.tipo_estudio !== 'internacional') return []
    const comunidad = typeof b.comunidad === 'object' ? b.comunidad : undefined
    const est = b.coordenadas_estudio
    if (!comunidad?.coordenadas || !est?.lat || !est?.lng) return []
    const foto = typeof b.foto === 'object' ? b.foto : undefined
    return [
      {
        id: b.id,
        nombre: b.nombre,
        carrera: b.carrera ?? '',
        universidad: b.universidad ?? '',
        pais_estudio: b.pais_estudio ?? '',
        ciudad_estudio: b.ciudad_estudio ?? '',
        comunidad_nombre: comunidad.nombre,
        comunidad_slug: comunidad.slug ?? undefined,
        foto_url: foto?.url ?? undefined,
        cita: b.cita ?? undefined,
        anio: b.anio ?? undefined,
        origen: [comunidad.coordenadas.lng, comunidad.coordenadas.lat] as [number, number],
        destino: [est.lng, est.lat] as [number, number],
      },
    ]
  })

  // mostrar_en_mapa también acá: es la misma colección con overrideAccess, y
  // dos líneas arriba becariosFeatures sí lo respeta — sin el check, un
  // becario que apagó su consentimiento podía terminar igual de "Destacado".
  const becarioDestacadoRaw = becariosDocsActivos.find((b) => b.mostrar_en_mapa && b.cita && typeof b.foto === 'object' && b.foto?.url)
  const becarioDestacado: BecarioDestacado | null = becarioDestacadoRaw ? {
    id: becarioDestacadoRaw.id,
    nombre: becarioDestacadoRaw.nombre,
    carrera: becarioDestacadoRaw.carrera ?? '',
    universidad: becarioDestacadoRaw.universidad ?? '',
    clase: (becarioDestacadoRaw.anio_inicio ? becarioDestacadoRaw.anio_inicio + 4 : new Date().getFullYear() + 2).toString(),
    cita: becarioDestacadoRaw.cita ?? '',
    fotoUrl: (typeof becarioDestacadoRaw.foto === 'object' ? becarioDestacadoRaw.foto?.url : null) ?? null,
    comunidad: typeof becarioDestacadoRaw.comunidad === 'object' ? (becarioDestacadoRaw.comunidad?.nombre ?? '') : '',
    destino: (becarioDestacadoRaw.tipo_estudio === 'internacional' ? becarioDestacadoRaw.pais_estudio : 'Panamá') ?? '',
  } : null

  const proyectosActivosList: ProyectoActivo[] = []
  const proyectosCompletadosList: ProyectoActivo[] = []
  
  for (const p of proyectos.docs as Proyecto[]) {
    const comName = typeof p.comunidad === 'object' ? p.comunidad.nombre : ''
    const act = { id: p.id, titulo: p.titulo, comunidad: comName, avance: p.avance ?? 0 }
    if (p.estado === 'en_ejecucion' || p.estado === 'aprobado') {
      proyectosActivosList.push(act)
    } else if (p.estado === 'completado') {
      proyectosCompletadosList.push(act)
    }
  }

  const studyingPanama = becariosDocsActivos.filter(b => b.tipo_estudio === 'nacional').length
  const studyingAbroad = becariosDocsActivos.filter(b => b.tipo_estudio === 'internacional').length
  
  const paisesUnicos = new Set(becariosDocsActivos.filter(b => b.tipo_estudio === 'internacional' && b.pais_estudio).map(b => b.pais_estudio))

  const destinosMap = new Map<string, { instituciones: Set<string>, cantidad: number }>()
  for (const b of becariosDocsActivos) {
    let lugar = t.atHome
    if (b.tipo_estudio === 'internacional' && b.pais_estudio) {
      lugar = b.pais_estudio
    }
    const uni = b.universidad || 'Universidad'
    const entry = destinosMap.get(lugar) ?? { instituciones: new Set(), cantidad: 0 }
    entry.instituciones.add(uni)
    entry.cantidad += 1
    destinosMap.set(lugar, entry)
  }

  const destinos: DestinoEstudio[] = Array.from(destinosMap.entries()).map(([lugar, data]) => ({
    lugar,
    instituciones: Array.from(data.instituciones).slice(0, 3).join(', ') + (data.instituciones.size > 3 ? ', ...' : ''),
    cantidad: data.cantidad
  })).sort((a, b) => b.cantidad - a.cantidad)

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      <ImpactoTabs
        textos={{ map: t.tabMap, overview: t.tabOverview }}
        mapaComponent={
          <>
            <header className="mb-8 border-b border-piedra/25 pb-8">
              <h1 className="font-display text-3xl font-bold uppercase text-montana md:text-4xl">{t.titulo}</h1>
              <p className="mt-2 font-lectura text-lg text-tinta/70">{t.subtitulo}</p>
            </header>
            <ImpactoMapLoader
              becarios={becariosFeatures}
              comunidades={comunidadesFeatures}
              locale={locale}
              maptilerKey={process.env.MAPTILER_KEY}
              programas={(programas.docs as Programa[]).map((p) => ({ id: p.id, nombre: p.nombre, color: p.color }))}
              sedes={sedesFeatures}
              stats={{
                comunidades: comunidadesFeatures.length,
                sedes: sedesFeatures.length,
                proyectosActivos: proyectosActivosList.length,
                obrasCompletadas: proyectosCompletadosList.length,
                becariosActivos: becariosDocsActivos.length,
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
          </>
        }
        overviewProps={{
          becario: becarioDestacado,
          stats: {
            scholarsSupported: becariosTotalesRes.totalDocs,
            activeScholarships: becariosDocsActivos.length,
            projectsCocle: proyectosActivosList.length + proyectosCompletadosList.length,
            studyingPanama: studyingPanama,
            studyingAbroad: studyingAbroad,
          },
          proyectos: proyectosActivosList.slice(0, 5),
          destinos: destinos,
          textos: {
            scholarOfTheTerm: t.scholarOfTheTerm,
            classOf: t.classOf,
            openHerStory: t.openHerStory,
            scholarsSupported: t.scholarsSupported,
            allFromCocle: t.allFromCocle,
            activeScholarships: t.activeScholarships,
            thisAcademicYear: t.thisAcademicYear,
            projectsInCocle: t.projectsInCocle,
            currentlyTracked: t.currentlyTracked,
            studyingInPanama: t.studyingInPanama,
            outsideCocle: t.outsideCocle,
            studyingAbroad: t.studyingAbroad,
            inXCountries: t.inXCountries(paisesUnicos.size),
            projectsInFlight: t.projectsInFlight,
            project: t.project,
            community: t.community,
            progress: t.progress,
            whereScholarsStudy: t.whereScholarsStudy,
            place: t.place,
            institutions: t.institutions,
            scholars: t.scholars,
            abroad: t.abroad,
            atHome: t.atHome,
          }
        }}
      />
    </div>
  )
}
