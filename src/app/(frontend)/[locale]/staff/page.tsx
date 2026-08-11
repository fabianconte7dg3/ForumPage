import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { BotonCerrarSesion } from '@/components/BotonCerrarSesion'
import { TablaBecarios } from '@/components/staff/TablaBecarios'
import { NavegacionStaff } from '@/components/staff/NavegacionStaff'
import { TabPublicaciones } from '@/components/staff/TabPublicaciones'
import { TabComunidades } from '@/components/staff/TabComunidades'
import { TabProyectos } from '@/components/staff/TabProyectos'
import { TabEquipo } from '@/components/staff/TabEquipo'
import { TabAprendizaje } from '@/components/staff/TabAprendizaje'
import { TabProgramas } from '@/components/staff/TabProgramas'
import { TabSolicitudesServicio } from '@/components/staff/TabSolicitudesServicio'
import { TabImportar } from '@/components/staff/TabImportar'
import { FormularioConfiguracionModal } from '@/components/staff/FormularioConfiguracionModal'
import { defaultLocale, type Locale } from '@/i18n'
import { sesionActual } from '@/lib/auth'
import config from '@/payload.config'
import type { Becario, HoraLaborSocial, Actividad, Comunidad, Proyecto, Programa, Equipo, Recurso, Tutoria, Practica, Nivel, Materia, Sede, CentroEducativo, Configuracion, Curso, Taller, GiraEducativa, Donacion, SolicitudServicio } from '@/payload-types'

export const dynamic = 'force-dynamic'

const TEXTOS = {
  es: {
    titulo: 'Panel del Staff',
    subtitulo: 'Gestión de expedientes de becarios',
    cerrarSesion: 'Cerrar sesión',
    seguridad: 'Seguridad',
    columnasBecario: 'Becario',
    columnasUniversidad: 'Universidad',
    columnasEstado: 'Estado de beca',
    columnasPendientes: 'Pendientes',
    columnasProgreso: 'Progreso',
    columnasAccion: '',
    verExpediente: 'Ver expediente',
    sinBecarios: 'No hay becarios registrados.',
    estadoActivo: 'Activo',
    estadoSuspendido: 'Suspendido',
    estadoGraduado: 'Graduado',
    estadoRetornado: 'Retornado',
    estadoRetirado: 'Retirado',
    totalBecarios: 'Becarios',
    totalPendientes: 'Horas pendientes de revisión',
    totalAprobadas: 'Horas aprobadas este ciclo',
    buscarPlaceholder: 'Buscar por nombre...',
    sinResultados: 'No se encontraron becarios.',
  },
  en: {
    titulo: 'Staff Panel',
    subtitulo: 'Becario expedition management',
    cerrarSesion: 'Log out',
    seguridad: 'Security',
    columnasBecario: 'Becario',
    columnasUniversidad: 'University',
    columnasEstado: 'Scholarship status',
    columnasPendientes: 'Pending',
    columnasProgreso: 'Progress',
    columnasAccion: '',
    verExpediente: 'View record',
    sinBecarios: 'No becarios registered.',
    estadoActivo: 'Active',
    estadoSuspendido: 'Suspended',
    estadoGraduado: 'Graduated',
    estadoRetornado: 'Returned',
    estadoRetirado: 'Withdrawn',
    totalBecarios: 'Becarios',
    totalPendientes: 'Hours pending review',
    totalAprobadas: 'Approved hours this cycle',
    buscarPlaceholder: 'Search by name...',
    sinResultados: 'No becarios found.',
  },
} satisfies Record<Locale, Record<string, string>>

export default async function StaffDashboardPage({
  params,
  searchParams 
}: { 
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ tab?: string; p?: string }> 
}) {
  const { locale } = await params
  const { tab = 'becarios', p = '1' } = await searchParams
  const paginaPublicaciones = Math.max(1, parseInt(p, 10) || 1)
  const t = TEXTOS[locale] ?? TEXTOS[defaultLocale]
  const usuario = await sesionActual()

  if (!usuario || (usuario.rol !== 'staff' && usuario.rol !== 'admin')) {
    redirect(`/${locale}/portal`)
  }

  const payload = await getPayload({ config })

  // Comunidades simples para el selector del formulario
  const comunidadesDocs = (
    await payload.find({
      collection: 'comunidades',
      limit: 200,
      sort: 'nombre',
      overrideAccess: true,
    })
  ).docs
  const comunidades = comunidadesDocs.map((c) => ({ id: c.id, nombre: c.nombre }))

  // Destinos internacionales frecuentes, para la sugerencia del formulario de becarios
  const destinos = (
    await payload.find({
      collection: 'destinos-internacionales',
      limit: 200,
      sort: 'universidad',
      overrideAccess: true,
    })
  ).docs.map((d) => ({
    id: d.id,
    universidad: d.universidad,
    pais: d.pais,
    ciudad: d.ciudad,
    coordenadas: d.coordenadas,
    bandera: d.bandera,
  }))

  // Todos los becarios
  const becarios = (
    await payload.find({
      collection: 'becarios',
      limit: 500,
      sort: 'nombre',
      overrideAccess: true,
    })
  ).docs as Becario[]

  // Todas las horas (para calcular pendientes y aprobadas por becario)
  const todasLasHoras = (
    await payload.find({
      collection: 'horas-labor-social',
      limit: 10000,
      overrideAccess: true,
    })
  ).docs as HoraLaborSocial[]

  // Agrupar horas por becario
  const horasPorBecario = new Map<number, { pendientes: number; aprobadas: number }>()
  for (const h of todasLasHoras) {
    const bId = typeof h.becario === 'object' ? h.becario.id : h.becario
    const entry = horasPorBecario.get(bId) ?? { pendientes: 0, aprobadas: 0 }
    if (h.estado === 'pendiente') entry.pendientes += h.horas
    if (h.estado === 'aprobada') entry.aprobadas += h.horas
    horasPorBecario.set(bId, entry)
  }

  const totalPendientes = todasLasHoras.filter((h) => h.estado === 'pendiente').reduce((acc, h) => acc + h.horas, 0)
  const totalAprobadas = todasLasHoras.filter((h) => h.estado === 'aprobada').reduce((acc, h) => acc + h.horas, 0)

  // Publicaciones (Actividades) paginadas
  const publicacionesResponse = await payload.find({
    collection: 'actividades',
    limit: 10,
    page: paginaPublicaciones,
    depth: 1,
    sort: '-fecha_publicacion',
    overrideAccess: true,
  })
  const publicaciones = publicacionesResponse.docs as Actividad[]

  // Map is not serializable for Client Components, converting to object
  const horasObj: Record<number, { pendientes: number; aprobadas: number }> = {}
  horasPorBecario.forEach((value, key) => {
    horasObj[key] = value
  })

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-12 md:px-16 md:py-24">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-piedra/25 pb-8">
        <div>
          <p className="font-dato text-xs uppercase tracking-widest text-piedra">Forum Foundation</p>
          <h1 className="font-display text-2xl font-bold uppercase text-montana md:text-3xl">{t.titulo}</h1>
          <p className="mt-1 font-lectura text-sm text-tinta/70">{t.subtitulo}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link className="font-dato text-xs uppercase tracking-widest text-tinta/60 underline" href={`/${locale}/cuenta/seguridad`}>
            {t.seguridad}
          </Link>
          <BotonCerrarSesion locale={locale} texto={t.cerrarSesion} />
        </div>
      </header>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <aside className="md:w-56 md:flex-shrink-0">
          <NavegacionStaff locale={locale} />
        </aside>

        <main className="min-w-0 flex-1">
      {tab === 'becarios' && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
              <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalBecarios}</p>
              <p className="mt-1 font-display text-2xl font-bold text-tinta">{becarios.length}</p>
            </div>
            <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
              <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalPendientes}</p>
              <p className="mt-1 font-display text-2xl font-bold text-cosecha">{totalPendientes}</p>
            </div>
            <div className="rounded-sm border border-piedra/25 bg-white px-5 py-4">
              <p className="font-dato text-xs uppercase tracking-widest text-piedra">{t.totalAprobadas}</p>
              <p className="mt-1 font-display text-2xl font-bold text-montana">{totalAprobadas}</p>
            </div>
          </div>

          <TablaBecarios
            locale={locale}
            becarios={becarios}
            horasPorBecario={horasObj}
            comunidades={comunidades}
            destinos={destinos}
            textos={t}
          />

          {await (async () => {
            const configuracion = await payload.findGlobal({ slug: 'configuracion', locale, overrideAccess: true })
            return (
              <div className="mt-12 rounded-sm border border-piedra/25 bg-white p-6">
                <div className="mb-4 flex flex-col gap-4 border-b border-piedra/25 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold uppercase text-montana">Configuración General</h2>
                    <p className="font-lectura text-xs text-tinta/70">Meta de horas, calificaciones reprobatorias y contacto institucional.</p>
                  </div>
                  <FormularioConfiguracionModal configuracion={configuracion as Configuracion} locale={locale} />
                </div>
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-dato text-xs uppercase tracking-widest text-piedra">Meta de horas</dt>
                    <dd className="font-lectura text-tinta">{configuracion?.meta_horas_labor_social ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-dato text-xs uppercase tracking-widest text-piedra">Calificaciones reprobatorias</dt>
                    <dd className="font-lectura text-tinta">
                      {configuracion?.calificaciones_reprobatorias?.map((c) => c.calificacion).join(', ') || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-dato text-xs uppercase tracking-widest text-piedra">Contacto institucional</dt>
                    <dd className="font-lectura text-tinta">{configuracion?.contacto_institucional?.email ?? '—'}</dd>
                  </div>
                </dl>
              </div>
            )
          })()}
        </>
      )}

      {tab === 'publicaciones' && (
        await (async () => {
          const [programasRes, proyectosRes] = await Promise.all([
            payload.find({ collection: 'programas', limit: 100, sort: 'nombre', overrideAccess: true }),
            payload.find({ collection: 'proyectos', limit: 200, sort: 'titulo', overrideAccess: true }),
          ])
          return (
            <TabPublicaciones
              comunidades={comunidades}
              locale={locale}
              programas={programasRes.docs.map((p) => ({ id: p.id, nombre: p.nombre }))}
              proyectos={proyectosRes.docs.map((p) => ({ id: p.id, titulo: p.titulo }))}
              publicaciones={publicaciones}
              page={publicacionesResponse.page}
              totalPages={publicacionesResponse.totalPages}
              hasNextPage={publicacionesResponse.hasNextPage}
              hasPrevPage={publicacionesResponse.hasPrevPage}
            />
          )
        })()
      )}

      {tab === 'comunidades' && (
        await (async () => {
          const [sedesRes, centrosRes] = await Promise.all([
            payload.find({ collection: 'sedes', limit: 200, depth: 1, sort: 'nombre', overrideAccess: true }),
            payload.find({ collection: 'centros-educativos', limit: 200, depth: 1, sort: 'nombre', overrideAccess: true }),
          ])
          return (
            <TabComunidades
              centrosEducativos={centrosRes.docs as CentroEducativo[]}
              comunidades={comunidadesDocs as Comunidad[]}
              locale={locale}
              sedes={sedesRes.docs as Sede[]}
            />
          )
        })()
      )}

      {tab === 'proyectos' && (
        await (async () => {
          const [proyectosRes, programasRes] = await Promise.all([
            payload.find({
              collection: 'proyectos',
              limit: 500,
              depth: 1,
              sort: '-fecha_inicio',
              overrideAccess: true,
            }),
            payload.find({
              collection: 'programas',
              limit: 100,
              sort: 'nombre',
              overrideAccess: true,
            }),
          ])
          return (
            <TabProyectos
              comunidades={comunidadesDocs as Comunidad[]}
              locale={locale}
              programas={programasRes.docs as Programa[]}
              proyectos={proyectosRes.docs as Proyecto[]}
            />
          )
        })()
      )}

      {tab === 'equipo' && (
        await (async () => {
          const [equipoRes, nosotrosGlobal] = await Promise.all([
            payload.find({
              collection: 'equipo',
              limit: 100,
              sort: 'orden',
              overrideAccess: true,
            }),
            payload.findGlobal({
              slug: 'nosotros',
              locale,
              depth: 1,
              overrideAccess: true,
            }),
          ])

          const extractTextFromRichText = (richTextNode: unknown): string => {
            if (!richTextNode) return ''
            if (typeof richTextNode === 'string') return richTextNode
            if (Array.isArray(richTextNode)) return richTextNode.map(extractTextFromRichText).join(' ')
            if (typeof richTextNode === 'object' && richTextNode !== null) {
              const node = richTextNode as Record<string, unknown>
              if (typeof node.text === 'string') return node.text
              if (node.children) return extractTextFromRichText(node.children)
              if (node.root) return extractTextFromRichText(node.root)
            }
            return ''
          }

          const misionTexto = extractTextFromRichText(nosotrosGlobal?.mision)
          const historiaTexto = extractTextFromRichText(nosotrosGlobal?.historia)
          const secciones = (nosotrosGlobal?.secciones_resumen ?? []).map((s) => ({
            titulo: s.titulo,
            texto: s.texto,
            imagenId: typeof s.imagen === 'object' ? s.imagen?.id : (s.imagen ?? undefined),
            imagenUrl: typeof s.imagen === 'object' ? (s.imagen?.url ?? undefined) : undefined,
          }))

          return (
            <TabEquipo
              equipo={equipoRes.docs as Equipo[]}
              historiaTexto={historiaTexto}
              locale={locale}
              misionTexto={misionTexto}
              secciones={secciones}
            />
          )
        })()
      )}

      {tab === 'aprendizaje' && (
        await (async () => {
          const [recursosRes, tutoriasRes, practicasRes, nivelesRes, materiasRes, sedesRes] = await Promise.all([
            payload.find({ collection: 'recursos', limit: 200, depth: 1, sort: '-createdAt', overrideAccess: true }),
            payload.find({ collection: 'tutorias', limit: 200, depth: 1, sort: '-fecha_hora', overrideAccess: true }),
            payload.find({ collection: 'practicas', limit: 200, depth: 1, sort: '-createdAt', overrideAccess: true }),
            payload.find({ collection: 'niveles', limit: 100, sort: 'nombre', overrideAccess: true }),
            payload.find({ collection: 'materias', limit: 100, sort: 'nombre', overrideAccess: true }),
            payload.find({ collection: 'sedes', limit: 100, sort: 'nombre', overrideAccess: true }),
          ])
          return (
            <TabAprendizaje
              locale={locale}
              recursos={recursosRes.docs as Recurso[]}
              tutorias={tutoriasRes.docs as Tutoria[]}
              practicas={practicasRes.docs as Practica[]}
              niveles={nivelesRes.docs as Nivel[]}
              materias={materiasRes.docs as Materia[]}
              sedes={sedesRes.docs as Sede[]}
            />
          )
        })()
      )}

      {tab === 'programas' && (
        await (async () => {
          const [cursosRes, talleresRes, girasRes, donacionesRes, sedesRes, centrosRes, nivelesRes] = await Promise.all([
            payload.find({ collection: 'cursos', limit: 200, depth: 1, sort: '-createdAt', overrideAccess: true }),
            payload.find({ collection: 'talleres', limit: 200, depth: 1, sort: '-createdAt', overrideAccess: true }),
            payload.find({ collection: 'giras-educativas', limit: 200, depth: 1, sort: '-createdAt', overrideAccess: true }),
            payload.find({ collection: 'donaciones', limit: 200, depth: 1, sort: '-createdAt', overrideAccess: true }),
            payload.find({ collection: 'sedes', limit: 200, sort: 'nombre', overrideAccess: true }),
            payload.find({ collection: 'centros-educativos', limit: 200, sort: 'nombre', overrideAccess: true }),
            payload.find({ collection: 'niveles', limit: 100, sort: 'nombre', overrideAccess: true }),
          ])
          return (
            <TabProgramas
              locale={locale}
              cursos={cursosRes.docs as Curso[]}
              talleres={talleresRes.docs as Taller[]}
              giras={girasRes.docs as GiraEducativa[]}
              donaciones={donacionesRes.docs as Donacion[]}
              sedes={sedesRes.docs as Sede[]}
              escuelas={centrosRes.docs as CentroEducativo[]}
              niveles={nivelesRes.docs as Nivel[]}
              comunidades={comunidades}
            />
          )
        })()
      )}

      {tab === 'servicios' && (
        await (async () => {
          const solicitudesRes = await payload.find({
            collection: 'solicitudes-servicios',
            limit: 300,
            depth: 1,
            sort: '-fecha_solicitud',
            overrideAccess: true,
          })
          return (
            <TabSolicitudesServicio
              locale={locale}
              solicitudes={solicitudesRes.docs as SolicitudServicio[]}
              comunidades={comunidades}
            />
          )
        })()
      )}

      {tab === 'importar' && <TabImportar locale={locale} />}
        </main>
      </div>
    </div>
  )
}
